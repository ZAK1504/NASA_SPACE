import uuid
from typing import Tuple, List, Dict, Any, Optional
import numpy as np
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
import astropy.units as u
from astropy.stats import sigma_clipped_stats
from photutils.detection import DAOStarFinder
from app.services.alignment_service import alignment_service

class DifferenceService:
    @staticmethod
    def calculate_difference_image(
        earlier_data: np.ndarray,
        later_data: np.ndarray,
        mask: Optional[np.ndarray] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Compute scientific difference: Difference = Later - Earlier.
        Applies background matching using sigma-clipped statistics.
        """
        # Background estimation for both epochs
        mean1, med1, std1 = sigma_clipped_stats(earlier_data, sigma=3.0)
        mean2, med2, std2 = sigma_clipped_stats(later_data, sigma=3.0)

        # Normalize background levels
        norm_earlier = earlier_data - med1
        norm_later = later_data - med2

        # Scale match if std differs significantly
        scale_factor = (std1 / std2) if (std2 > 0 and std1 > 0) else 1.0
        diff = norm_later * scale_factor - norm_earlier

        if mask is not None:
            diff[~mask] = 0.0

        metadata = {
            "epoch1_background_median": float(med1),
            "epoch2_background_median": float(med2),
            "scale_factor": float(scale_factor),
            "min_diff": float(np.min(diff)),
            "max_diff": float(np.max(diff)),
            "std_diff": float(np.std(diff))
        }

        return diff, metadata

    @classmethod
    def detect_candidate_changes(
        cls,
        earlier_data: np.ndarray,
        later_data: np.ndarray,
        wcs: WCS,
        target_name: str = "Unknown Target",
        fwhm_pixels: float = 3.0,
        detection_threshold_sigma: float = 4.0,
        return_metrics: bool = False
    ) -> Any:
        """
        Detect candidate moving or variable sources between two aligned epochs
        using photutils DAOStarFinder and cross-epoch astrometric matching.
        """
        candidates: List[Dict[str, Any]] = []

        mean1, med1, std1 = sigma_clipped_stats(earlier_data, sigma=3.0)
        mean2, med2, std2 = sigma_clipped_stats(later_data, sigma=3.0)

        daofind1 = DAOStarFinder(fwhm=fwhm_pixels, threshold=detection_threshold_sigma * std1)
        daofind2 = DAOStarFinder(fwhm=fwhm_pixels, threshold=detection_threshold_sigma * std2)

        sources1 = daofind1(earlier_data - med1)
        sources2 = daofind2(later_data - med2)

        if sources1 is None or sources2 is None or len(sources1) == 0 or len(sources2) == 0:
            empty_metrics = {
                "raw_sources_epoch1": len(sources1) if sources1 is not None else 0,
                "raw_sources_epoch2": len(sources2) if sources2 is not None else 0,
                "associations": 0,
                "astrometric_stability_arcsec": 0.0,
                "astrometric_stability_pixels": 0.0,
                "residual_features": 0,
                "filtered_candidates": 0,
            }
            return (candidates, empty_metrics) if return_metrics else candidates

        # Convert detected sources to celestial coordinates
        coords1 = wcs.pixel_to_world(sources1['xcentroid'], sources1['ycentroid'])
        coords2 = wcs.pixel_to_world(sources2['xcentroid'], sources2['ycentroid'])

        # Match sources across epochs using nearest neighbor
        idx, sep2d, _ = coords1.match_to_catalog_sky(coords2)
        med_sep = float(np.median(sep2d.arcsec)) if len(sep2d) > 0 else 0.0

        # Separation threshold in arcseconds
        # Pixel scale ~ 6.2 arcsec for SPHEREx
        for i, (match_idx, sep) in enumerate(zip(idx, sep2d)):
            sep_arcsec = sep.arcsec
            flux1 = float(sources1['flux'][i])
            flux2 = float(sources2['flux'][match_idx])
            
            x1 = float(sources1['xcentroid'][i])
            y1 = float(sources1['ycentroid'][i])
            x2 = float(sources2['xcentroid'][match_idx])
            y2 = float(sources2['ycentroid'][match_idx])

            sky_pos = coords1[i]

            # Candidate Moving Object: separated by > 1.5 pixels (~9 arcsec)
            if 3.0 < sep_arcsec < 60.0:
                candidates.append({
                    "id": str(uuid.uuid4())[:8],
                    "target_name": f"{target_name} Candidate M{len(candidates)+1}",
                    "ra": float(sky_pos.ra.deg),
                    "dec": float(sky_pos.dec.deg),
                    "pixel_x_epoch1": round(x1, 2),
                    "pixel_y_epoch1": round(y1, 2),
                    "pixel_x_epoch2": round(x2, 2),
                    "pixel_y_epoch2": round(y2, 2),
                    "angular_displacement_arcsec": round(sep_arcsec, 2),
                    "flux_epoch1": round(flux1, 2),
                    "flux_epoch2": round(flux2, 2),
                    "delta_magnitude": round(-2.5 * np.log10(max(flux2, 1e-4) / max(flux1, 1e-4)), 2) if flux1 > 0 and flux2 > 0 else None,
                    "candidate_type": "moving_source",
                    "confidence": "moderate" if sep_arcsec > 6.0 else "low",
                    "explanation": f"Source detected with {sep_arcsec:.1f}\" positional displacement between observation epochs.",
                    "scientific_limitations": "Candidate detection requires verification against telescope PSF variations and astrometric registration uncertainty."
                })
            
            # Candidate Variable Object: stationary position but significant flux change (>50%)
            elif sep_arcsec <= 3.0 and flux1 > 0 and flux2 > 0:
                flux_ratio = flux2 / flux1
                if flux_ratio > 1.5 or flux_ratio < 0.67:
                    delta_mag = -2.5 * np.log10(flux_ratio)
                    candidates.append({
                        "id": str(uuid.uuid4())[:8],
                        "target_name": f"{target_name} Candidate V{len(candidates)+1}",
                        "ra": float(sky_pos.ra.deg),
                        "dec": float(sky_pos.dec.deg),
                        "pixel_x_epoch1": round(x1, 2),
                        "pixel_y_epoch1": round(y1, 2),
                        "pixel_x_epoch2": round(x2, 2),
                        "pixel_y_epoch2": round(y2, 2),
                        "angular_displacement_arcsec": round(sep_arcsec, 2),
                        "flux_epoch1": round(flux1, 2),
                        "flux_epoch2": round(flux2, 2),
                        "delta_magnitude": round(delta_mag, 2),
                        "candidate_type": "variable_source",
                        "confidence": "moderate",
                        "explanation": f"Source brightness changed by factor of {flux_ratio:.2f} ({delta_mag:+.2f} mag) with minimal positional shift ({sep_arcsec:.1f}\").",
                        "scientific_limitations": "Variability can be affected by sky background subtraction, blending, and detector calibration differences."
                    })

        metrics = {
            "raw_sources_epoch1": len(sources1),
            "raw_sources_epoch2": len(sources2),
            "associations": len(idx),
            "astrometric_stability_arcsec": round(med_sep, 2),
            "astrometric_stability_pixels": round(med_sep / 6.15, 3),
            "residual_features": len(candidates),
            "filtered_candidates": len(candidates),
        }

        top_candidates = candidates[:10]
        return (top_candidates, metrics) if return_metrics else top_candidates

difference_service = DifferenceService()
