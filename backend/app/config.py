import os
from pathlib import Path
from typing import List

# Bound numerical library thread pools to match target VM vCPU allocation (e2-standard-2)
os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("MKL_NUM_THREADS", "2")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "2")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "2")

# Set writable matplotlib config dir
os.environ.setdefault("MPLCONFIGDIR", os.getenv("MPLCONFIGDIR", "/tmp/matplotlib"))

class Settings:
    PROJECT_NAME: str = "SPHEREx Cosmic Discovery Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment & Host
    APP_ENV: str = os.getenv("APP_ENV", "development").lower()
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # NASA / IPAC IRSA endpoints
    IRSA_BASE_URL: str = os.getenv("IRSA_BASE_URL", "https://irsa.ipac.caltech.edu")
    IRSA_SIA_URL: str = f"{IRSA_BASE_URL}/SIA"
    IRSA_TAP_URL: str = f"{IRSA_BASE_URL}/TAP"
    IRSA_SIA2_URL: str = f"{IRSA_BASE_URL}/SIA2"
    
    # Paths & Storage (/srv/horizon-data in production, ./data in dev)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = Path(os.getenv("HORIZON_DATA_DIR", os.getenv("DATA_DIR", str(BASE_DIR / "data"))))
    CACHE_DIR: Path = DATA_DIR / "cache"
    FITS_CACHE_DIR: Path = CACHE_DIR / "fits"
    PREVIEW_CACHE_DIR: Path = CACHE_DIR / "previews"
    QUERY_CACHE_DIR: Path = CACHE_DIR / "queries"
    HIPS_CACHE_DIR: Path = CACHE_DIR / "hips"
    SESSIONS_DIR: Path = DATA_DIR / "sessions"
    
    # Resource Limits & Quotas
    MAX_DOWNLOAD_BYTES: int = int(os.getenv("MAX_DOWNLOAD_BYTES", str(100 * 1024 * 1024))) # 100 MB max per FITS
    MAX_CONCURRENT_DOWNLOADS: int = int(os.getenv("MAX_CONCURRENT_DOWNLOADS", "2"))
    MAX_HEAVY_JOBS: int = int(os.getenv("MAX_HEAVY_JOBS", "1")) # 1 heavy scientific job concurrently
    MAX_PENDING_JOBS: int = int(os.getenv("MAX_PENDING_JOBS", "5")) # Up to 5 queued
    CACHE_MAX_BYTES: int = int(os.getenv("CACHE_MAX_BYTES", str(15 * 1024 * 1024 * 1024))) # 15 GB disk cache cap
    REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))

    # CORS Configuration
    @property
    def CORS_ORIGINS(self) -> List[str]:
        raw_origins = os.getenv("ALLOWED_ORIGINS", "")
        if raw_origins:
            return [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
        
        # Development defaults
        if self.APP_ENV != "production":
            return [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "*"
            ]
        # Production default: same-origin only unless explicitly configured
        return [self.PUBLIC_BASE_URL] if self.PUBLIC_BASE_URL else ["http://localhost:8000", "http://127.0.0.1:8000"]

    def validate_configuration(self) -> None:
        """Validate critical configuration invariants at application startup."""
        try:
            self.DATA_DIR.mkdir(parents=True, exist_ok=True)
            self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.FITS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.PREVIEW_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.QUERY_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.HIPS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            raise RuntimeError(f"Failed to create or access data storage directories under {self.DATA_DIR}: {e}")

        if self.MAX_DOWNLOAD_BYTES <= 0:
            raise ValueError(f"MAX_DOWNLOAD_BYTES must be positive, got {self.MAX_DOWNLOAD_BYTES}")
        if self.MAX_HEAVY_JOBS <= 0:
            raise ValueError(f"MAX_HEAVY_JOBS must be positive, got {self.MAX_HEAVY_JOBS}")
        if self.CACHE_MAX_BYTES <= 0:
            raise ValueError(f"CACHE_MAX_BYTES must be positive, got {self.CACHE_MAX_BYTES}")

settings = Settings()
settings.validate_configuration()
