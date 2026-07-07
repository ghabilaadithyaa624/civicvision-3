from fastapi.testclient import TestClient

from app.factory import create_app

client = TestClient(create_app())


def test_health_returns_200_with_expected_shape() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "CivicVision AI Service Running"
    assert "version" in body
    assert "uptime" in body
    assert "environment" in body
    assert body["model_loaded"] is False


def test_health_includes_request_id_header() -> None:
    response = client.get("/health")
    assert "x-request-id" in response.headers


def test_unknown_route_returns_404() -> None:
    response = client.get("/does-not-exist")
    assert response.status_code == 404
