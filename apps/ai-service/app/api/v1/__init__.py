from fastapi import APIRouter

from app.api.v1.detect import router as detect_router

router = APIRouter()
router.include_router(detect_router, tags=["detect"])
