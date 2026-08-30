import pytest
from app.services.hospital_service import HospitalService

def test_haversine_distance_calculation():
    # Kolhapur center (16.7050, 74.2433) to CPR Hospital (16.6985, 74.2285)
    dist = HospitalService.calculate_haversine_distance(16.7050, 74.2433, 16.6985, 74.2285)
    assert 1.0 <= dist <= 3.0, f"Expected distance ~1.7km, got {dist}"

    # Distance to identical point is 0
    zero_dist = HospitalService.calculate_haversine_distance(16.7050, 74.2433, 16.7050, 74.2433)
    assert zero_dist == 0.0

    # Pune to Kolhapur (~220-240 km)
    pune_dist = HospitalService.calculate_haversine_distance(18.5204, 73.8567, 16.7050, 74.2433)
    assert 200.0 <= pune_dist <= 260.0
