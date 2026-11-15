import os
import hashlib
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import numpy as np
import requests
from astropy.io import fits
from astropy.wcs import WCS
from app.config import settings

ALLOWED_FITS_DOMAINS = [
    "irsa.ipac.caltech.edu",
    "ipac.caltech.edu",
    "nasa.gov",
    "stsci.edu",
]

def is_safe_fits_url(url: str) -> Tuple[bool, str]:
    """
    Validate that a given FITS URL strictly adheres to security requirements:
    1. Scheme must be HTTPS
    2. Hostname must be in official NASA/IPAC allowlist
    3. Hostname must NOT resolve to private, loopback, link-local, or cloud metadata IPs (SSRF protection)
    """
    if not url or not isinstance(url, str):
        return False, "Empty or invalid URL"
    
    parsed = urlparse(url.strip())
    if parsed.scheme.lower() != "https":
        return False, f"Insecure scheme '{parsed.scheme}'. Only HTTPS is permitted."

    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        return False, "Missing hostname in URL"

    # Cloud metadata / localhost block
    if hostname in ("169.254.169.254", "metadata.google.internal", "localhost", "127.0.0.1"):
        return False, f"Prohibited SSRF target host '{hostname}'"

    # Domain allowlist check
    is_allowed_domain = any(
        hostname == domain or hostname.endswith("." + domain)
        for domain in ALLOWED_FITS_DOMAINS
    )
    if not is_allowed_domain:
        return False, f"Domain '{hostname}' is not in the approved NASA/IPAC archive allowlist"

    # DNS resolution and IP verification to defeat DNS rebinding
    try:
        addr_infos = socket.getaddrinfo(hostname, 443, proto=socket.IPPROTO_TCP)
        for family, type_, proto, canonname, sockaddr in addr_infos:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
                return False, f"Resolved IP address '{ip_str}' is private/loopback/link-local."
    except Exception as e:
        return False, f"DNS resolution failed for '{hostname}': {str(e)}"

    return True, "URL is safe"


class FitsService:
    def __init__(self):
        self.fits_cache_dir = settings.FITS_CACHE_DIR

    def get_local_path_for_url(self, fits_url: str) -> Path:
        h = hashlib.sha256(fits_url.encode('utf-8')).hexdigest()
        filename = fits_url.split('/')[-1]
        if not filename.endswith('.fits'):
            filename = f"{h}.fits"
        return self.fits_cache_dir / filename

    def download_fits(
        self,
        fits_url: str,
        timeout: int = 45,
        max_bytes: int = 150 * 1024 * 1024
    ) -> Path:
        """
        Download FITS file with strict SSRF validation, size bounds,
        atomic file writes, and FITS magic header verification.
        """
        is_safe, reason = is_safe_fits_url(fits_url)
        if not is_safe:
            raise ValueError(f"Security validation rejected FITS URL: {reason}")

        local_path = self.get_local_path_for_url(fits_url)
        if local_path.exists() and local_path.stat().st_size > 10000:
            return local_path

        temp_path = local_path.with_suffix(f".tmp_{os.getpid()}_{hashlib.md5(fits_url.encode()).hexdigest()[:8]}")
        try:
            with requests.get(fits_url, stream=True, timeout=timeout, headers={"User-Agent": "SPHEREx-Platform/1.0"}) as r:
                r.raise_for_status()
                total_downloaded = 0
                with open(temp_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=65536):
                        if chunk:
                            total_downloaded += len(chunk)
                            if total_downloaded > max_bytes:
                                raise ValueError(f"Download exceeded maximum safe file size limit ({max_bytes} bytes)")
                            f.write(chunk)

            # Validate FITS magic header signature
            if temp_path.stat().st_size < 2880:
                raise ValueError("Downloaded file is smaller than minimum standard FITS header block (2880 bytes)")

            with open(temp_path, 'rb') as f:
                header_start = f.read(80)
                if not header_start.startswith(b"SIMPLE  ="):
                    raise ValueError("Downloaded content is not a valid FITS file (missing 'SIMPLE  =' header keyword)")

            # Atomic rename
            temp_path.replace(local_path)
            return local_path
        except Exception:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
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
                    has_wcs = w.is_celestial
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
            if not wcs.is_celestial:
                wcs = None
        except Exception:
            pass

        return data, wcs, header

fits_service = FitsService()
