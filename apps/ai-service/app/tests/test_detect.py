import io

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.factory import create_app
from app.services.detector_service import detector_service

client = TestClient(create_app(), raise_server_exceptions=False)


def _valid_png_bytes() -> bytes:
    """
    A real, validly-encoded 10x10 PNG generated via cv2 — not a
    hand-written byte string. The previous version of this fixture was
    a hardcoded "minimal PNG" with an invalid CRC checksum, so it never
    actually reached the code path it was meant to test; it failed at
    image decoding before the detector was ever invoked.
    """
    image = np.zeros((10, 10, 3), dtype=np.uint8)
    ok, buffer = cv2.imencode(".png", image)
    assert ok, "failed to encode test fixture image"
    return buffer.tobytes()


class _FakeBox:
    """Mimics the subset of an Ultralytics Boxes object that the /detect endpoint reads."""

    def __init__(self, xyxy: list[float], cls_idx: int, conf: float) -> None:
        self.xyxy = [xyxy]
        self.cls = [cls_idx]
        self.conf = [conf]


class _FakeResult:
    """Mimics the subset of an Ultralytics Results object that the /detect endpoint reads."""

    def __init__(self) -> None:
        self.boxes = [_FakeBox([1.0, 2.0, 3.0, 4.0], cls_idx=0, conf=0.87)]
        self.names = {0: "POTHOLE"}


def test_detect_endpoint_returns_predictions(monkeypatch) -> None:
    # Real model weights aren't staged in any environment yet (see
    # DetectorService's lazy-loading design in app/services/detector_service.py) —
    # so this mocks the detector at the same boundary the real code calls,
    # rather than depending on a trained model being present to test the
    # endpoint's request/response contract.
    detector_service._use_mock = False
    detector_service._model = None
    monkeypatch.setattr(detector_service, "predict", lambda image, confidence=None: [_FakeResult()])

    files = {"file": ("test.png", io.BytesIO(_valid_png_bytes()), "image/png")}
    response = client.post("/api/v1/detect?confidence=0.25", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["is_mock"] is False
    assert body["detections"] == [
        {
            "label": "POTHOLE",
            "confidence": 0.87,
            "bounding_box": {"x_min": 1.0, "y_min": 2.0, "x_max": 3.0, "y_max": 4.0},
        }
    ]
    assert "inference_time_ms" in body


def test_detect_endpoint_rejects_corrupted_image() -> None:
    files = {"file": ("corrupt.png", io.BytesIO(b"not-an-image"), "image/png")}
    response = client.post("/api/v1/detect", files=files)

    assert response.status_code == 400
    body = response.json()
    # FastAPI's HTTPException produces {"detail": "..."} — there's no
    # "success" key on this path, so check with .get() rather than
    # indexing directly (indexing a missing key would raise KeyError
    # before the `or` ever short-circuits, which is what the previous
    # version of this test did).
    assert body.get("success") is False or "detail" in body


def test_detect_endpoint_uses_labeled_mock_in_development() -> None:
    """
    Without MODEL_WEIGHTS_PATH configured, in development the endpoint
    falls back to placeholder detections rather than failing outright —
    useful for building/testing the rest of the platform before a real
    model is trained. Critically, the response must say so via
    `is_mock: true` — it must never be indistinguishable from a real
    detection, since a "detection" here can inform whether a city
    dispatches a repair crew.
    """
    detector_service._use_mock = False
    detector_service._model = None

    files = {"file": ("test.png", io.BytesIO(_valid_png_bytes()), "image/png")}
    response = client.post("/api/v1/detect", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["is_mock"] is True


def test_detect_endpoint_refuses_mock_fallback_in_production(monkeypatch) -> None:
    """
    The same missing-model scenario must fail loudly in production
    instead of silently fabricating detections — this is the safety
    guard in DetectorService._activate_mock_mode.
    """
    from app.config import settings as settings_module

    monkeypatch.setattr(settings_module.settings, "environment", "production")
    # Reset any mock state a prior test may have left on the shared singleton.
    detector_service._use_mock = False
    detector_service._model = None

    files = {"file": ("test.png", io.BytesIO(_valid_png_bytes()), "image/png")}
    response = client.post("/api/v1/detect", files=files)

    assert response.status_code == 500
    assert response.json()["success"] is False
