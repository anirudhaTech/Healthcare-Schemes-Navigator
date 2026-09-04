from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.handwriting_ocr_service import HandwritingOCRService

router = APIRouter(prefix="/medical-report", tags=["Medical Report AI"])


class MedicalReportOCRResponse(BaseModel):
    text: str
    confidence: float | None = None
    word_count: int
    disclaimer: str = (
        "AI-extracted text may contain errors. Verify the extracted information "
        "before using it for healthcare scheme eligibility."
    )


@router.post("/analyze", response_model=MedicalReportOCRResponse)
async def analyze_medical_report(file: UploadFile = File(...)):
    """Recognize handwritten text in a medical report using Google Cloud Vision."""
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPG, PNG, or WebP image of the handwritten report.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")

    try:
        result = HandwritingOCRService.analyze_image(content)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Handwriting recognition failed: {str(exc)}",
        ) from exc
    finally:
        content = b""

    return result
