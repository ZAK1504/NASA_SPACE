#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Google Compute Engine VM Provisioning & Bootstrap Script
# Target OS: Ubuntu 24.04 LTS (Noble Numbat) x86-64
# Target Architecture: Single Compute Engine VM (e2-standard-2)
# ==============================================================================
set -euo pipefail

# Require root privileges
if [ "${EUID}" -ne 0 ]; then
    echo "[!] Error: bootstrap.sh must be executed as root (e.g. sudo bash bootstrap.sh)" >&2
    exit 1
fi

echo "=================================================================="
echo "    SPHEREx HORIZON — VM SYSTEM BOOTSTRAP INITIALIZATION"
echo "=================================================================="

# 1. System Package Update & Base Utilities
echo "[+] Step 1: Updating system packages and installing prerequisites..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libcfitsio-dev \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    python3-pip \
    ufw \
    ca-certificates \
    gnupg \
    unattended-upgrades \
    debian-keyring \
    debian-archive-keyring \
    apt-transport-https

# 2. Install Node.js 20 LTS (NodeSource)
echo "[+] Step 2: Configuring Node.js 20 LTS..."
if ! command -v node &>/dev/null; then
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    NODE_MAJOR=20
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    apt-get update -y
    apt-get install -y nodejs
fi
echo "    Node: $(node -v), NPM: $(npm -v)"

# 3. Install Caddy HTTPS Web Server & Reverse Proxy
echo "[+] Step 3: Installing Caddy web server..."
if ! command -v caddy &>/dev/null; then
    curl -1sLF 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLF 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y
    apt-get install -y caddy
fi
echo "    Caddy: $(caddy version)"

# 4. Create Dedicated System Service User
echo "[+] Step 4: Configuring dedicated system user 'horizon'..."
if ! id -u horizon &>/dev/null; then
    useradd -r -s /usr/sbin/nologin -d /opt/horizon -m horizon
    echo "    Created system user 'horizon'."
else
    echo "    System user 'horizon' already exists."
fi

# Allow Caddy to traverse /opt/horizon/current/frontend/dist
usermod -aG horizon caddy || true

# 5. Create Directory Hierarchy with Strict Boundary Isolation
echo "[+] Step 5: Preparing persistent storage and release paths..."
# Persistent scientific data and sessions (survives redeployments and VM reboots)
mkdir -p /srv/horizon-data/cache/fits
mkdir -p /srv/horizon-data/cache/previews
mkdir -p /srv/horizon-data/cache/queries
mkdir -p /srv/horizon-data/cache/hips
mkdir -p /srv/horizon-data/sessions

# Application releases & atomic current symlink
mkdir -p /opt/horizon/releases
mkdir -p /opt/horizon/shared

# Private configuration & logs
mkdir -p /etc/horizon
mkdir -p /var/log/horizon
mkdir -p /var/log/caddy

# Set ownership and security permissions
chown -R horizon:horizon /srv/horizon-data
chown -R horizon:horizon /opt/horizon
chown -R horizon:horizon /etc/horizon
chown -R horizon:horizon /var/log/horizon
chown -R caddy:caddy /var/log/caddy

chmod 750 /srv/horizon-data
chmod 750 /etc/horizon
chmod 755 /opt/horizon
chmod 755 /srv/horizon-data/cache/hips # HiPS static frames

# 6. Seed Configuration Files if Missing
echo "[+] Step 6: Initializing configuration files..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f /etc/horizon/backend.env ]; then
    if [ -f "${SCRIPT_DIR}/backend.env.example" ]; then
        cp "${SCRIPT_DIR}/backend.env.example" /etc/horizon/backend.env
        chown horizon:horizon /etc/horizon/backend.env
        chmod 640 /etc/horizon/backend.env
        echo "    Copied backend.env.example to /etc/horizon/backend.env"
    fi
fi

if [ -f "${SCRIPT_DIR}/Caddyfile" ]; then
    cp "${SCRIPT_DIR}/Caddyfile" /etc/caddy/Caddyfile
    echo "    Installed /etc/caddy/Caddyfile"
fi

if [ -f "${SCRIPT_DIR}/horizon.service" ]; then
    cp "${SCRIPT_DIR}/horizon.service" /etc/systemd/system/horizon.service
    systemctl daemon-reload
    systemctl enable horizon.service
    echo "    Installed and enabled horizon.service"
fi

# 7. Configure Firewall (UFW)
echo "[+] Step 7: Configuring UFW firewall rules..."
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null 2>&1
ufw allow 80/tcp comment 'HTTP / ACME Challenge' >/dev/null 2>&1
ufw allow 443/tcp comment 'HTTPS Caddy Proxy' >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1

echo "=================================================================="
echo "    SPHEREx HORIZON BOOTSTRAP COMPLETE"
echo "    Next step: Run ./deploy/gcp/deploy-release.sh to ship a build"
echo "=================================================================="
