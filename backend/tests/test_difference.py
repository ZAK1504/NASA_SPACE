import numpy as np
from app.services.difference_service import difference_service

def test_difference_calculation():
    # Epoch 1 and Epoch 2
    epoch1 = np.ones((20, 20)) * 10.0
    epoch2 = np.ones((20, 20)) * 15.0
    
    # Introduce a changed feature in epoch 2
    epoch2[10, 10] += 50.0

    diff, meta = difference_service.calculate_difference_image(epoch1, epoch2)
    assert diff.shape == (20, 20)
    assert diff[10, 10] > 40.0 # Changed pixel should show strong signal
    assert abs(diff[0, 0]) < 1.0  # Background should be cancelled out

if __name__ == "__main__":
    test_difference_calculation()
    print("All difference tests passed!")
