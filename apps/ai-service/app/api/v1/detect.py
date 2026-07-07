import time

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.models.schemas import BoundingBox, Detection, DetectionResponse
from app.services.detector_service import detector_service
from app.utils.image_utils import decode_image_bytes

router = APIRouter()


@router.post("/detect", response_model=DetectionResponse)
async def detect_issues(
    file: UploadFile = File(...), confidence: float | None = Query(None, ge=0.0, le=1.0)
) -> DetectionResponse:
    try:
        content = await file.read()
        image = decode_image_bytes(content)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading upload data: {e}",
        ) from e

    start_time = time.monotonic()
    results = detector_service.predict(image, confidence)
    inference_time = (time.monotonic() - start_time) * 1000

    detections = []
    # results is a list of results (we run on a single image, so len is 1)
    for result in results:
        for box in result.boxes:
            xyxy = box.xyxy[0]
            if hasattr(xyxy, "tolist"):
                xyxy = xyxy.tolist()

            cls_idx = int(box.cls[0].item() if hasattr(box.cls[0], "item") else box.cls[0])
            conf = float(box.conf[0].item() if hasattr(box.conf[0], "item") else box.conf[0])

            label = result.names.get(cls_idx, "OTHER")

            detections.append(
                Detection(
                    label=label,
                    confidence=conf,
                    bounding_box=BoundingBox(
                        x_min=xyxy[0], y_min=xyxy[1], x_max=xyxy[2], y_max=xyxy[3]
                    ),
                )
            )

    return DetectionResponse(
        success=True,
        detections=detections,
        inference_time_ms=inference_time,
        is_mock=detector_service.is_using_mock(),
    )
