import numpy as np
from app.services.image_processing_service import image_processing_service

def test_image_normalization_and_base64():
    # Create simple synthetic test array
    data = np.arange(100).reshape((10, 10)).astype(float)
    b64, meta = image_processing_service.render_image_to_base64(
        image_data=data,
        stretch="asinh",
        lower_percentile=1.0,
        upper_percentile=99.0,
        colormap="inferno"
    )
    assert b64.startswith("data:image/png;base64,")
    assert meta["stretch"] == "asinh"
    assert meta["colormap"] == "inferno"
    assert meta["dimensions"] == [10, 10]

if __name__ == "__main__":
    test_image_normalization_and_base64()
    print("All processing tests passed!")
