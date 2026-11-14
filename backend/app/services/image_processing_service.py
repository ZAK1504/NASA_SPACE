import io
import base64
from typing import Tuple, Dict, Any, Optional
import numpy as np
import matplotlib
matplotlib.use('Agg')
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg
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
        wcs: Optional[WCS] = None,
        smooth: bool = False
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Render a calibrated FITS array using scientific percentile normalization
        and astronomical stretch using thread-safe Object-Oriented Matplotlib Figure.
        Guarantees no pyplot state bleed, no blank box artifacts, and styled spines.
        Returns (base64_png, render_metadata).
        """
        # Ensure finite array
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

        # Use purely Object-Oriented Figure and FigureCanvasAgg (no global pyplot state)
        fig = Figure(figsize=(6, 6), dpi=dpi, facecolor='#0B1020')
        canvas = FigureCanvasAgg(fig)

        interpolation_mode = 'bicubic' if smooth else 'nearest'

        if wcs is not None and wcs.is_celestial:
            try:
                ax = fig.add_subplot(111, projection=wcs)
                ax.set_facecolor('#0B1020')
                ax.set_xlabel('Right Ascension (J2000)', color='#94A3B8', fontsize=8)
                ax.set_ylabel('Declination (J2000)', color='#94A3B8', fontsize=8)
                ax.coords.grid(color='#263247', alpha=0.5, linestyle='solid' if show_grid else 'none')
                
                # Style WCS axes coordinates and spines to prevent harsh white outlines
                for coord in ax.coords:
                    coord.set_ticks(color='#64748B')
                    coord.set_ticklabel(color='#94A3B8', size=7)
                for spine in ax.spines.values():
                    spine.set_color('#263247')
                    spine.set_linewidth(1.0)
            except Exception:
                ax = fig.add_subplot(111)
                ax.set_facecolor('#0B1020')
                ax.axis('off')
        else:
            ax = fig.add_subplot(111)
            ax.set_facecolor('#0B1020')
            ax.axis('off')

        im = ax.imshow(
            clean_data,
            norm=norm,
            origin='lower',
            cmap=colormap,
            interpolation=interpolation_mode
        )

        # Subtle, restrained minimal colorbar
        try:
            cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            cbar.ax.tick_params(colors='#94A3B8', labelsize=7)
            cbar.outline.set_edgecolor('#263247')
            cbar.ax.set_facecolor('#0B1020')
        except Exception:
            pass

        buf = io.BytesIO()
        fig.savefig(buf, format='png', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
        fig.clf()
        del canvas
        del fig

        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')

        metadata = {
            "stretch": stretch,
            "colormap": colormap,
            "vmin": float(vmin),
            "vmax": float(vmax),
            "lower_percentile": lower_percentile,
            "upper_percentile": upper_percentile,
            "dimensions": list(image_data.shape),
            "smooth": smooth,
            "is_valid": bool(np.count_nonzero(clean_data) > 0)
        }

        return f"data:image/png;base64,{img_b64}", metadata

    @classmethod
    def extract_standard_northup_cutout(
        cls,
        image_data: np.ndarray,
        wcs: WCS,
        center_ra: float,
        center_dec: float,
        size_arcsec: float = 900.0,
        pixel_scale_arcsec: float = 6.15
    ) -> Tuple[np.ndarray, WCS, float]:
        """
        Extract a standard celestial tangential cutout centered on (center_ra, center_dec)
        with North strictly UP (CDELT2 > 0) and East strictly LEFT (CDELT1 < 0).
        Uses Astropy reproject_interp to standardize arbitrary detector orientations.
        Returns: (reprojected_data, target_wcs, valid_fraction)
        """
        from reproject import reproject_interp

        npix = max(16, int(round(size_arcsec / pixel_scale_arcsec)))
        target_wcs = WCS(naxis=2)
        target_wcs.wcs.crpix = [(npix + 1) / 2.0, (npix + 1) / 2.0]
        target_wcs.wcs.cdelt = [-pixel_scale_arcsec / 3600.0, pixel_scale_arcsec / 3600.0]
        target_wcs.wcs.crval = [center_ra, center_dec]
        target_wcs.wcs.ctype = ['RA---TAN', 'DEC--TAN']

        if wcs is None or not getattr(wcs, 'is_celestial', False):
            return np.zeros((npix, npix), dtype=np.float32), target_wcs, 0.0

        try:
            reproj_data, footprint = reproject_interp(
                (image_data, wcs),
                target_wcs,
                shape_out=(npix, npix)
            )
            valid_mask = np.isfinite(reproj_data) & (footprint > 0.5)
            valid_count = int(valid_mask.sum())
            valid_frac = float(valid_count) / float(npix * npix)
            
            clean_reproj = np.nan_to_num(reproj_data, nan=0.0)
            return clean_reproj, target_wcs, valid_frac
        except Exception:
            return np.zeros((npix, npix), dtype=np.float32), target_wcs, 0.0

    @classmethod
    def extract_cutout(
        cls,
        image_data: np.ndarray,
        wcs: WCS,
        center_ra: float,
        center_dec: float,
        size_arcsec: float = 180.0
    ) -> Tuple[np.ndarray, WCS]:
        """Extract a centered cutout around sky coordinates using Astropy Cutout2D."""
        position = SkyCoord(ra=center_ra * u.deg, dec=center_dec * u.deg, frame='icrs')
        size = u.Quantity((size_arcsec, size_arcsec), u.arcsec)
        
        try:
            cutout = Cutout2D(image_data, position=position, size=size, wcs=wcs, mode='partial', fill_value=0.0)
            # If cutout extracted from outside the footprint is all zeros, center on valid data
            if np.all(cutout.data == 0) or np.count_nonzero(cutout.data) == 0:
                cy, cx = image_data.shape[-2] // 2, image_data.shape[-1] // 2
                center_sky = wcs.pixel_to_world(cx, cy)
                cutout = Cutout2D(image_data, position=center_sky, size=size, wcs=wcs, mode='trim')
            return cutout.data, cutout.wcs
        except Exception:
            # Fallback to image center cutout
            cy, cx = image_data.shape[-2] // 2, image_data.shape[-1] // 2
            center_sky = wcs.pixel_to_world(cx, cy) if wcs is not None and wcs.is_celestial else None
            if center_sky is not None:
                cutout = Cutout2D(image_data, position=center_sky, size=size, wcs=wcs, mode='trim')
                return cutout.data, cutout.wcs
            half = max(16, int(size_arcsec / 12.3))
            sub = image_data[max(0, cy - half): cy + half, max(0, cx - half): cx + half]
            return sub, wcs

image_processing_service = ImageProcessingService()
