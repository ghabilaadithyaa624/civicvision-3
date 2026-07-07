from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.config.logging import logger
from app.config.settings import settings

if TYPE_CHECKING:
    from ultralytics import YOLO


class MockBox:
    def __init__(self, xyxy: list[float], cls: float, conf: float) -> None:
        self.xyxy = [xyxy]
        self.cls = [cls]
        self.conf = [conf]


class MockResult:
    def __init__(self, boxes: list[MockBox], names: dict[int, str]) -> None:
        self.boxes = boxes
        self.names = names


class DetectorService:
    """
    Wraps YOLOv11 model loading and inference. Constructing this class
    does nothing expensive — the actual model (and the heavy `ultralytics`/
    `torch` import) is deferred until `get_model()` is first called.

    This means:
    - The FastAPI app can start and serve /health instantly, even if
      model weights aren't staged yet or PyTorch is still being installed.
    - A missing/misconfigured model surfaces as a clear error on the
      first detection request, not as a boot-time crash.
    """

    def __init__(self) -> None:
        self._model: YOLO | None = None
        self._use_mock: bool = False

    def is_loaded(self) -> bool:
        return self._model is not None or self._use_mock

    def is_using_mock(self) -> bool:
        """
        True if this instance is currently fabricating placeholder
        detections instead of running real inference. The /detect
        endpoint uses this to mark responses with `is_mock: true` so
        no caller can mistake a placeholder for a real classification —
        which matters here specifically because a "detection" can
        inform whether a city dispatches a real repair crew.
        """
        return self._use_mock

    def get_model(self) -> YOLO:
        if self._use_mock:
            raise RuntimeError("Using mock detector service.")

        if self._model is None:
            if not settings.model_weights_path:
                self._activate_mock_mode(
                    "MODEL_WEIGHTS_PATH is not configured. Falling back to mock predictions."
                )
                raise RuntimeError("Mock mode activated")

            logger.info(f"Loading YOLO model from {settings.model_weights_path}")
            try:
                from ultralytics import YOLO  # deferred: heavy import, only needed here

                self._model = YOLO(settings.model_weights_path)
                logger.info("YOLO model loaded successfully")
            except Exception as e:
                self._activate_mock_mode(
                    f"Failed to load YOLO model: {e}. Falling back to mock predictions."
                )
                raise RuntimeError("Mock mode activated") from e

        return self._model

    def _activate_mock_mode(self, reason: str) -> None:
        # Mock fallback exists for local development convenience — testing
        # the API contract or building the frontend without a trained
        # model staged yet. It must never activate silently in production:
        # a civic-issue detection can inform whether a repair crew gets
        # dispatched, so a broken/missing model should fail loudly (the
        # caller gets a clear 500) rather than quietly fabricate results
        # that look like real AI analysis.
        if settings.environment == "production":
            logger.error(f"{reason} Refusing to fall back to mock predictions in production.")
            raise RuntimeError(
                "Detection model is not available and mock fallback is disabled in production. "
                "Configure MODEL_WEIGHTS_PATH with a valid model."
            )
        logger.warning(reason)
        self._use_mock = True

    def _get_mock_predictions(
        self, image: Any, confidence: float | None = None
    ) -> list[MockResult]:
        """Generates mock predictions based on image dimensions."""
        h, w = 480, 640
        if hasattr(image, "shape"):
            h, w = image.shape[:2]

        conf_thresh = confidence if confidence is not None else settings.yolo_confidence_threshold
        # Return a simulated pothole if the confidence threshold allows it
        boxes = []
        if 0.85 >= conf_thresh:
            # Let's mock a Pothole in the lower middle of the image
            boxes.append(MockBox(xyxy=[w * 0.25, h * 0.6, w * 0.75, h * 0.95], cls=0.0, conf=0.85))
        if 0.72 >= conf_thresh:
            # Let's mock Garbage on the right side
            boxes.append(MockBox(xyxy=[w * 0.65, h * 0.4, w * 0.9, h * 0.8], cls=1.0, conf=0.72))

        names = {
            0: "POTHOLE",
            1: "GARBAGE",
            2: "STREETLIGHT",
            3: "WATER_LEAKAGE",
            4: "DAMAGED_SIGNAGE",
            5: "OTHER",
        }

        return [MockResult(boxes=boxes, names=names)]

    def predict(self, image: Any, confidence: float | None = None) -> Any:
        """
        Runs inference on a single image. Falls back to mock predictions
        only in non-production environments when no real model is
        available — see _activate_mock_mode for why this never happens
        silently in production.
        """
        if self._use_mock:
            return self._get_mock_predictions(image, confidence)

        try:
            model = self.get_model()
            conf = confidence if confidence is not None else settings.yolo_confidence_threshold
            return model(image, conf=conf, verbose=False)
        except RuntimeError as e:
            if self._use_mock:
                # Expected signal from _activate_mock_mode (non-production only)
                return self._get_mock_predictions(image, confidence)
            # Production guard tripped, or a genuine model error — propagate
            # rather than silently fabricating a result.
            raise e


# Module-level singleton
detector_service = DetectorService()
