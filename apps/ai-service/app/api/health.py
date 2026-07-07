import time

from fastapi import APIRouter

from app.config.settings import settings
from app.models.schemas import HealthResponse
from app.services.detector_service import detector_service
from app.utils.uptime import format_uptime

router = APIRouter()

_start_time = time.monotonic()


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Liveness check for the AI service. Deliberately does NOT trigger
    model loading — reporting `model_loaded: false` on a fresh boot is
    expected and correct, not a failure (see DetectorService's lazy-load
    rationale).
    """
    return HealthResponse(
        version=settings.app_version,
        uptime=format_uptime(time.monotonic() - _start_time),
        environment=settings.environment,
        model_loaded=detector_service.is_loaded(),
    )
