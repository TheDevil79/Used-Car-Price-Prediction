"""
Tests for AI explanation assistant: rule-based generation, disclaimer checks, and LLM fallback handling.
"""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.model_service import model_service


@pytest.fixture
def client():
    model_service.load_artifacts()
    with TestClient(app) as c:
        yield c


def test_rule_based_explanation_without_api_key(client):
    """Verify grounded rule-based explanation when no LLM API key is configured."""
    payload = {
        "vehicle": {
            "make": "Toyota",
            "year": 2018,
            "odometer": 55000.0,
            "condition": "excellent",
            "cylinders": "4 cylinders",
            "drive": "fwd",
            "fuel": "gas",
            "transmission": "automatic",
            "type": "sedan",
            "title_status": "clean",
            "paint_color": "silver"
        },
        "predicted_price": 14500.0
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["predicted_price"] == 14500.0
    assert data["formatted_price"] == "$14,500.00"
    assert data["explanation_source"] == "rule_based_engine"
    assert "Toyota" in data["summary"]
    assert len(data["key_factors"]) >= 2
    assert "statistical" in data["valuation_context"].lower()
    assert len(data["practical_checks"]) >= 4
    assert any("inspection" in check.lower() for check in data["practical_checks"])
    assert "disclaimer" in data


def test_explanation_user_question_follow_up(client):
    """Verify explanation assistant addresses specific user question."""
    payload = {
        "vehicle": {
            "make": "Ford",
            "year": 2016,
            "odometer": 120000.0,
            "condition": "good",
            "title_status": "clean"
        },
        "predicted_price": 9200.0,
        "user_question": "How does the mileage impact my resale value?"
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "mileage" in data["summary"].lower()


def test_llm_provider_failure_fallback(client):
    """Verify that when an LLM provider throws an exception, system transparently falls back to rule-based engine."""
    payload = {
        "vehicle": {
            "make": "BMW",
            "year": 2021,
            "odometer": 28000.0,
            "condition": "like new"
        },
        "predicted_price": 32000.0,
        "user_question": "Is this a fair dealer asking price?"
    }

    # Mock LLM generator throwing network/API error
    with patch("app.services.explanation_service.generate_llm_explanation", side_effect=RuntimeError("Simulated LLM API Timeout")):
        response = client.post("/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["explanation_source"] == "rule_based_engine"
        assert "BMW" in data["summary"]
        assert len(data["practical_checks"]) > 0
