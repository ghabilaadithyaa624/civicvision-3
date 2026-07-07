from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    success: bool = True
    message: str = "CivicVision AI Service Running"
    version: str
    uptime: str
    environment: str
    model_loaded: bool = Field(
        description="Whether the YOLO detection model has been loaded into memory yet. "
        "False on a fresh boot is expected — the model loads lazily on first inference "
        "request, not at startup.",
    )


class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float


class Detection(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    bounding_box: BoundingBox


class DetectionResponse(BaseModel):
    """Response from the YOLOv11 inference endpoint (POST /api/v1/detect)."""

    success: bool = True
    detections: list[Detection]
    inference_time_ms: float
    is_mock: bool = Field(
        default=False,
        description="True when no real model was available and these are "
        "deterministic placeholder detections, not real inference. Never "
        "true in production — see DetectorService.",
    )
