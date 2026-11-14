import pytest
from app.services.coordinate_service import coordinate_service

def test_decimal_to_hms_dms():
    # Barnard's Star ~ RA 269.4521, Dec 4.6933
    hms, dms = coordinate_service.deg_to_hms_dms(269.4521, 4.6933)
    assert "17h" in hms
    assert "57m" in hms
    assert "4°" in dms
    assert "+" in dms

def test_parse_coordinate_string():
    # Test decimal string
    coords = coordinate_service.parse_coordinate_string("269.4521, 4.6933")
    assert coords is not None
    ra, dec = coords
    assert abs(ra - 269.4521) < 1e-4
    assert abs(dec - 4.6933) < 1e-4

def test_point_in_footprint():
    # Point at center should be inside
    assert coordinate_service.is_point_in_footprint(269.45, 4.69, 269.45, 4.69, 1.0)
    # Point 10 degrees away should be outside
    assert not coordinate_service.is_point_in_footprint(279.45, 4.69, 269.45, 4.69, 1.0)

if __name__ == "__main__":
    test_decimal_to_hms_dms()
    test_parse_coordinate_string()
    test_point_in_footprint()
    print("All coordinate tests passed!")
