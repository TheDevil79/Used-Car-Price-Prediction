"""
Tests for prediction logic, input validation, boundaries, unknown categories, and response schemas.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.model_service import model_service


@pytest.fixture
def client():
    model_service.load_artifacts()
    with TestClient(app) as c:
        yield c


def test_successful_prediction(client):
    """Test valid vehicle input produces positive price and factors."""
    payload = {
        "make": "Ford",
        "year": 2019,
        "odometer": 42000.0,
        "condition": "excellent",
        "cylinders": "6 cylinders",
        "drive": "4wd",
        "fuel": "gas",
        "transmission": "automatic",
        "type": "SUV",
        "title_status": "clean",
        "paint_color": "black"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "predicted_price" in data
    assert isinstance(data["predicted_price"], (int, float))
    assert data["predicted_price"] > 0
    assert data["currency"] == "USD ($)"
    assert "$" in data["formatted_price"]
    assert "top_contributing_factors" in data
    assert len(data["top_contributing_factors"]) > 0
    assert data["vehicle_summary"]["make"] == "Ford"
    assert data["vehicle_summary"]["year"] == 2019


def test_unknown_categories_handling(client):
    """Test pipeline gracefully handles never-before-seen categorical values."""
    payload = {
        "make": "MartianRoverSpecial",
        "year": 2021,
        "odometer": 25000.0,
        "condition": "alien_condition",
        "cylinders": "quantum_fusion",
        "drive": "hover_drive",
        "fuel": "hydrogen_plasma",
        "transmission": "hyperdrive",
        "type": "spacecraft",
        "title_status": "intergalactic_clean",
        "paint_color": "cosmic_violet"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_price"] >= 0
    assert "top_contributing_factors" in data


def test_missing_required_fields(client):
    """Missing required fields must return 422 Unprocessable Entity."""
    # Missing make and year
    invalid_payload = {
        "odometer": 50000.0
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422


def test_numeric_boundaries_year(client):
    """Test year lower and upper boundaries."""
    # Valid boundary year 1950
    valid_payload = {
        "make": "Chevrolet",
        "year": 1950,
        "odometer": 80000.0
    }
    assert client.post("/predict", json=valid_payload).status_code == 200

    # Invalid year below 1950
    invalid_past = {
        "make": "Chevrolet",
        "year": 1940,
        "odometer": 80000.0
    }
    assert client.post("/predict", json=invalid_past).status_code == 422

    # Invalid future year beyond 2026
    invalid_future = {
        "make": "Chevrolet",
        "year": 2035,
        "odometer": 10000.0
    }
    assert client.post("/predict", json=invalid_future).status_code == 422


def test_numeric_boundaries_odometer(client):
    """Test odometer lower (non-negative) and upper boundaries."""
    # Negative odometer
    negative_odo = {
        "make": "Honda",
        "year": 2020,
        "odometer": -500.0
    }
    assert client.post("/predict", json=negative_odo).status_code == 422

    # Zero odometer (brand new)
    zero_odo = {
        "make": "Honda",
        "year": 2024,
        "odometer": 0.0
    }
    resp = client.post("/predict", json=zero_odo)
    assert resp.status_code == 200
    assert resp.json()["predicted_price"] > 0

    # Extremely high mileage beyond 2,000,000 miles
    too_high_odo = {
        "make": "Honda",
        "year": 2005,
        "odometer": 5000000.0
    }
    assert client.post("/predict", json=too_high_odo).status_code == 422


def test_prediction_response_schema(client):
    """Verify strict adherence to PredictionResponse schema contract."""
    payload = {
        "make": "Toyota",
        "year": 2017,
        "odometer": 65000.0,
        "condition": "good",
        "type": "sedan"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    required_keys = [
        "predicted_price", "formatted_price", "currency", 
        "model_version", "algorithm", "vehicle_summary", 
        "top_contributing_factors", "disclaimer"
    ]
    for key in required_keys:
        assert key in data

    factor = data["top_contributing_factors"][0]
    for factor_key in ["feature", "display_name", "value", "relative_importance_pct", "impact_direction", "insight"]:
        assert factor_key in factor
