import io
import base64
from typing import Tuple, Dict, Any, Optional
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from astropy.visualization import (
    ImageNormalize,
    AsymmetricPercentileInterval,
    AsinhStretch,
    LinearStretch,
    SqrtStretch,
    LogStretch,
)
from astropy.nddata import Cutout2D
from astropy.coordinates import SkyCoord
import astropy.units as u
from astropy.wcs import WCS

class ImageProcessingService:
    STRETCHES = {
        "asinh": AsinhStretch(),
        "linear": LinearStretch(),
        "sqrt": SqrtStretch(),
        "log": LogStretch(),
    }

    @classmethod
    def render_image_to_base64(
        cls,
        image_data: np.ndarray,
        stretch: str = "asinh",
        lower_percentile: float = 0.5,
        upper_percentile: float = 99.5,
        colormap: str = "inferno",
        dpi: int = 100,
        show_grid: bool = False,
        wcs: Optional[WCS] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Render a calibrated FITS array using scientific percentile normalization
        and astronomical stretch. Returns (base64_png, render_metadata).
        """
        # Ensure finite
        clean_data = np.nan_to_num(image_data, nan=0.0, posinf=0.0, neginf=0.0)

        # Select stretch
        stretch_obj = cls.STRETCHES.get(stretch.lower(), AsinhStretch())

        # Calculate asymmetric percentile interval
        interval = AsymmetricPercentileInterval(lower_percentile, upper_percentile)
        vmin, vmax = interval.get_limits(clean_data)

        # Handle flat or zero-contrast data
        if vmax <= vmin:
            vmax = vmin + 1.0

        norm = ImageNormalize(clean_data, interval=interval, stretch=stretch_obj, clip=True)

        fig = plt.figure(figsize=(6, 6), dpi=dpi)
        if wcs is not None and wcs.is_celestial:
            ax = fig.add_subplot(111, projection=wcs)
            ax.set_xlabel('Right Ascension (J2000)', color='#94A3B8', fontsize=8)
            ax.set_ylabel('Declination (J2000)', color='#94A3B8', fontsize=8)
            ax.coords.grid(color='#263247', alpha=0.5, linestyle='solid' if show_grid else 'none')
        else:
            ax = fig.add_subplot(111)
            ax.axis('off')

        fig.patch.set_facecolor('#0B1020')
        ax.set_facecolor('#0B1020')
        ax.tick_params(colors='#94A3B8', labelsize=7)

        im = ax.imshow(clean_data, norm=norm, origin='lower', cmap=colormap)

        # Restrained minimal colorbar
        cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.ax.tick_params(colors='#94A3B8', labelsize=7)
        cbar.outline.set_edgecolor('#263247')

        buf = io.BytesIO()
        try:
            plt.tight_layout()
        except Exception:
            pass
        plt.savefig(buf, format='png', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
        plt.close(fig)

        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')

        metadata = {
            "stretch": stretch,
            "colormap": colormap,
            "vmin": float(vmin),
            "vmax": float(vmax),
            "lower_percentile": lower_percentile,
            "upper_percentile": upper_percentile,
            "dimensions": list(image_data.shape)
        }

        return f"data:image/png;base64,{img_b64}", metadata

    @classmethod
    def extract_cutout(
        cls,
        image_data: np.ndarray,
        wcs: WCS,
        center_ra: float,
        center_dec: float,
        size_arcsec: float = 120.0
    ) -> Tuple[np.ndarray, WCS]:
        """Extract a centered cutout around sky coordinates using Astropy Cutout2D."""
        position = SkyCoord(ra=center_ra * u.deg, dec=center_dec * u.deg, frame='icrs')
        size = u.Quantity((size_arcsec, size_arcsec), u.arcsec)
        
        cutout = Cutout2D(image_data, position=position, size=size, wcs=wcs, mode='partial', fill_value=0.0)
        return cutout.data, cutout.wcs

image_processing_service = ImageProcessingService()
