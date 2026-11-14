from typing import Tuple, Optional, Dict, Any
import numpy as np
from astropy.wcs import WCS
from reproject import reproject_interp
from reproject.mosaicking import find_optimal_celestial_wcs

class AlignmentService:
    @staticmethod
    def check_overlap(wcs1: WCS, shape1: Tuple[int, int], wcs2: WCS, shape2: Tuple[int, int]) -> bool:
        """Verify whether two celestial observations share a common sky footprint."""
        try:
            # Footprint vertices of image 1
            footprint1 = wcs1.calc_footprint()
            # Convert footprint1 sky coords to pixel coords in image 2
            x2, y2 = wcs2.all_world2pix(footprint1[:, 0], footprint1[:, 1], 0)
            
            # Check if any vertex or center falls within image 2 bounds
            h2, w2 = shape2
            inside_x = (x2 >= 0) & (x2 < w2)
            inside_y = (y2 >= 0) & (y2 < h2)
            if np.any(inside_x & inside_y):
                return True

            # Also check center of image 2 in image 1
            center2_sky = wcs2.pixel_to_world(w2 / 2.0, h2 / 2.0)
            x1, y1 = wcs1.world_to_pixel(center2_sky)
            h1, w1 = shape1
            if (0 <= x1 < w1) and (0 <= y1 < h1):
                return True

            return False
        except Exception:
            return False

    @classmethod
    def reproject_to_common_grid(
        cls,
        image_data: np.ndarray,
        input_wcs: WCS,
        target_wcs: WCS,
        target_shape: Tuple[int, int]
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Reproject an image onto a target coordinate grid using flux-conserving interpolation.
        Returns (reprojected_data, footprint_mask).
        """
        reprojected_array, footprint = reproject_interp(
            (image_data, input_wcs),
            target_wcs,
            shape_out=target_shape
        )
        
        # Replace non-overlapping NaN areas with zero
        valid_mask = footprint > 0
        clean_array = np.nan_to_num(reprojected_array, nan=0.0)
        clean_array[~valid_mask] = 0.0

        return clean_array, valid_mask

alignment_service = AlignmentService()
