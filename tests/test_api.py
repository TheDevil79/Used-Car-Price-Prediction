"""
Tests for API endpoints: /health, /model-info, and missing model behavior.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.model_service import model_service


@pytest.fixture
def client():
    # Ensure artifacts are loaded
    model_service.load_artifacts()
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    """Verify GET /health returns expected fields and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["healthy", "degraded"]
    assert "model_loaded" in data
    assert "artifacts_available" in data
    assert "llm_configured" in data
    assert "app_version" in data


def test_model_info_endpoint(client):
    """Verify GET /model-info returns algorithm, features, domains, and metrics."""
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "1.0.0"
    assert "DecisionTree" in data["algorithm"]
    assert data["currency"] == "USD ($)"
    assert "year" in data["numeric_features"]
    assert "odometer" in data["numeric_features"]
    assert "make" in data["categorical_features"]
    assert "evaluation_metrics" in data
    assert "production_model" in data["evaluation_metrics"]
    assert "baseline_model" in data["evaluation_metrics"]
    assert "feature_importances" in data
    assert "overfitting_analysis" in data


def test_missing_model_behavior():
    """Verify behavior when model artifact is missing or unloaded."""
    from unittest.mock import patch
    original_model = model_service.model
    original_loaded = model_service.is_loaded

    with patch.object(model_service, "load_artifacts", return_value=False):
        model_service.model = None
        model_service.is_loaded = False
        with TestClient(app) as test_c:
            # Health should report degraded/false
            health_resp = test_c.get("/health")
            assert health_resp.status_code == 200
            assert health_resp.json()["model_loaded"] is False

            # /predict should return 503 Service Unavailable
            sample_payload = {
                "make": "Toyota",
                "year": 2018,
                "odometer": 50000.0,
                "condition": "good"
            }
            pred_resp = test_c.post("/predict", json=sample_payload)
            assert pred_resp.status_code == 503
            assert "not loaded" in pred_resp.json()["detail"].lower()

    # Restore
    model_service.model = original_model
    model_service.is_loaded = original_loaded
