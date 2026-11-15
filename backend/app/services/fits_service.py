import os
import hashlib
import uuid
import socket
import ipaddress
import threading
from urllib.parse import urlparse
from typing import Dict, Any, Optional, Tuple, Set
from pathlib import Path
from collections import defaultdict
import numpy as np
import requests
from astropy.io import fits
from astropy.wcs import WCS
from app.config import settings

# Whitelist of approved astronomical archive domain names
ALLOWED_FITS_HOSTS: Set[str] = {
    "irsa.ipac.caltech.edu",
    "mast.stsci.edu",
    "archive.stsci.edu",
}

# Protected metadata and private networks to reject
METADATA_IP = ipaddress.ip_address("169.254.169.254")

def validate_outbound_url(url: str) -> str:
    """
    Validate that an external URL targets an approved scientific archive host
    and does not resolve to private, loopback, link-local, or cloud metadata endpoints.
    Protects against SSRF and DNS rebinding attacks.
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string.")

    parsed = urlparse(url)
    if parsed.scheme.lower() != "https":
        raise ValueError(f"Prohibited URL scheme '{parsed.scheme}'. Only HTTPS is permitted.")

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        raise ValueError("Invalid URL: missing hostname.")

    if hostname not in ALLOWED_FITS_HOSTS:
        raise ValueError(
            f"Prohibited destination host '{hostname}'. Only official astronomical archives "
            f"({', '.join(sorted(ALLOWED_FITS_HOSTS))}) are permitted."
        )

    port = parsed.port or 443
    if port != 443:
        raise ValueError(f"Prohibited destination port {port}. Only standard HTTPS port 443 is permitted.")

    # DNS Resolution destination safety check
    try:
        addr_info = socket.getaddrinfo(hostname, 443, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except socket.gaierror as e:
        raise ValueError(f"DNS resolution failure for host '{hostname}': {e}")

    for family, socktype, proto, canonname, sockaddr in addr_info:
        ip_str = sockaddr[0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            raise ValueError(f"Invalid resolved IP address: {ip_str}")

        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip == METADATA_IP
        ):
            raise ValueError(f"Destination IP '{ip_str}' is in a prohibited or private network range.")

    return url


class FitsService:
    validate_outbound_url = staticmethod(validate_outbound_url)

    def __init__(self):
        self.fits_cache_dir = settings.FITS_CACHE_DIR
        self._download_locks: Dict[str, threading.Lock] = defaultdict(threading.Lock)
        self._global_lock = threading.Lock()

    def get_local_path_for_url(self, fits_url: str) -> Path:
        h = hashlib.sha256(fits_url.encode('utf-8')).hexdigest()
        raw_name = Path(urlparse(fits_url).path).name
        # Sanitize filename to prevent directory traversal
        clean_name = "".join(c for c in raw_name if c.isalnum() or c in "._-")
        if not clean_name.endswith('.fits') or len(clean_name) < 6:
            clean_name = f"{h[:24]}.fits"
        return self.fits_cache_dir / clean_name

    def _enforce_cache_quota(self) -> None:
        """Evict oldest accessed FITS files if total cache exceeds CACHE_MAX_BYTES."""
        try:
            fits_files = list(self.fits_cache_dir.glob("*.fits"))
            total_bytes = sum(f.stat().st_size for f in fits_files)
            if total_bytes > settings.CACHE_MAX_BYTES:
                # Sort by last access time ascending
                fits_files.sort(key=lambda p: p.stat().st_atime)
                for f in fits_files:
                    if total_bytes <= settings.CACHE_MAX_BYTES:
                        break
                    try:
                        sz = f.stat().st_size
                        f.unlink()
                        total_bytes -= sz
                    except OSError:
                        pass
        except Exception:
            pass

    def download_fits(self, fits_url: str, timeout: Optional[int] = None) -> Path:
        """
        Download FITS file with strict SSRF validation, atomic temporary file creation,
        FITS header verification, and per-resource concurrency locking.
        """
        validated_url = validate_outbound_url(fits_url)
        local_path = self.get_local_path_for_url(validated_url)

        # Fast path if already cached and valid
        if local_path.exists() and local_path.stat().st_size > 10000:
            return local_path

        effective_timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS

        with self._download_locks[str(local_path)]:
            # Double-check inside lock
            if local_path.exists() and local_path.stat().st_size > 10000:
                return local_path

            temp_path = self.fits_cache_dir / f".tmp_{local_path.stem}_{uuid.uuid4().hex}.fits"
            downloaded_bytes = 0

            try:
                # Disable automatic redirects to re-validate any redirect target URL
                current_url = validated_url
                max_redirects = 3
                redirect_count = 0

                while redirect_count < max_redirects:
                    with requests.get(
                        current_url,
                        stream=True,
                        timeout=effective_timeout,
                        allow_redirects=False,
                        headers={"User-Agent": "SPHEREx-Horizon/1.0 (NASA Space Apps 2026)"}
                    ) as r:
                        if r.status_code in (301, 302, 303, 307, 308):
                            loc = r.headers.get("Location")
                            if not loc:
                                raise ValueError("Redirect response missing Location header.")
                            current_url = validate_outbound_url(loc)
                            redirect_count += 1
                            continue

                        r.raise_for_status()

                        with open(temp_path, 'wb') as f:
                            for chunk in r.iter_content(chunk_size=65536):
                                if chunk:
                                    downloaded_bytes += len(chunk)
                                    if downloaded_bytes > settings.MAX_DOWNLOAD_BYTES:
                                        raise ValueError(
                                            f"Download exceeded maximum permitted size of {settings.MAX_DOWNLOAD_BYTES} bytes."
                                        )
                                    f.write(chunk)
                        break
                else:
                    raise ValueError("Exceeded maximum permitted redirects.")

                # Verify valid FITS file structure before committing to cache
                if temp_path.stat().st_size < 2880:
                    raise ValueError("Downloaded file is too small to be a valid FITS file.")

                with open(temp_path, "rb") as test_f:
                    header_block = test_f.read(2880)
                    if not header_block.startswith(b"SIMPLE  ="):
                        raise ValueError("Downloaded file is not a valid FITS product (missing SIMPLE card).")

                # Verify HDU readable by astropy
                with fits.open(temp_path, memmap=True) as hdul:
                    if len(hdul) == 0:
                        raise ValueError("Downloaded FITS file contains no HDUs.")

                # Atomic rename
                temp_path.replace(local_path)
                self._enforce_cache_quota()
                return local_path

            except Exception:
                if temp_path.exists():
                    try:
                        temp_path.unlink()
                    except OSError:
                        pass
                raise

    def inspect_fits(self, file_path: Path) -> Dict[str, Any]:
        """
        Inspect all HDUs in a FITS file and extract structural metadata,
        WCS, dimensionality, and header properties.
        """
        hdus_info = []
        with fits.open(file_path, memmap=True) as hdul:
            for i, hdu in enumerate(hdul):
                shape = list(hdu.data.shape) if getattr(hdu, 'data', None) is not None else None
                dtype = str(hdu.data.dtype) if getattr(hdu, 'data', None) is not None else None
                
                # Check for WCS
                has_wcs = False
                try:
                    w = WCS(hdu.header)
                    has_wcs = getattr(w, "is_celestial", False)
                except Exception:
                    pass

                info = {
                    "index": i,
                    "name": hdu.name,
                    "header_cards_count": len(hdu.header),
                    "is_image": isinstance(hdu, (fits.PrimaryHDU, fits.ImageHDU)) and shape is not None and len(shape) >= 2,
                    "is_table": isinstance(hdu, (fits.BinTableHDU, fits.TableHDU)),
                    "shape": shape,
                    "dimensions": len(shape) if shape else 0,
                    "dtype": dtype,
                    "has_wcs": has_wcs
                }
                hdus_info.append(info)

            # Extract science header from primary or first image extension
            science_hdr = hdul[0].header
            for h in hdul:
                if getattr(h, 'data', None) is not None and len(getattr(h, 'data', []).shape) >= 2:
                    science_hdr = h.header
                    break

            summary = {
                "file_name": file_path.name,
                "file_size_bytes": file_path.stat().st_size,
                "hdu_count": len(hdul),
                "hdus": hdus_info,
                "telescope": str(science_hdr.get('TELESCOP', 'SPHEREx')),
                "instrument": str(science_hdr.get('INSTRUME', 'SPHEREx')),
                "date_obs": str(science_hdr.get('DATE-OBS', '')),
                "filter": str(science_hdr.get('FILTER', science_hdr.get('BANDPASS', ''))),
                "object": str(science_hdr.get('OBJECT', '')),
                "exptime": float(science_hdr.get('EXPTIME', 0.0)) if science_hdr.get('EXPTIME') else None,
                "bunit": str(science_hdr.get('BUNIT', 'DN/s')),
            }

        return summary

    def get_image_data_and_wcs(self, file_path: Path) -> Tuple[np.ndarray, Optional[WCS], fits.Header]:
        """
        Extract the 2D image array and celestial WCS from the FITS file.
        Robustly handles 2D slices from 3D cubes and handles NaN/infinite pixels.
        """
        with fits.open(file_path, memmap=True) as hdul:
            selected_hdu = None
            for hdu in hdul:
                if getattr(hdu, 'data', None) is not None and hasattr(hdu.data, 'ndim') and hdu.data.ndim >= 2:
                    selected_hdu = hdu
                    break

            if selected_hdu is None:
                raise ValueError(f"No image data found in FITS file {file_path.name}")

            data = np.copy(selected_hdu.data)
            header = selected_hdu.header.copy()

        # If 3D cube, extract median or central slice along spectral axis
        if data.ndim == 3:
            data = np.nanmedian(data, axis=0)

        # Clean NaN and infinite values for display and processing
        nan_mask = np.isnan(data) | np.isinf(data)
        if np.any(nan_mask):
            valid_vals = data[~nan_mask]
            if len(valid_vals) > 0:
                replacement_val = float(np.nanmedian(valid_vals))
            else:
                replacement_val = 0.0
            data[nan_mask] = replacement_val

        # Extract WCS
        wcs = None
        try:
            wcs = WCS(header)
            if not getattr(wcs, "is_celestial", False):
                wcs = None
        except Exception:
            pass

        return data, wcs, header

fits_service = FitsService()
