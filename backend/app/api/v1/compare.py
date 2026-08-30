from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scheme import Scheme
from app.schemas.scheme import SchemeComparisonRequest, SchemeComparisonMatrix, SchemeDetailOut
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/compare", tags=["Scheme Comparison Matrix"])

@router.post("", response_model=SchemeComparisonMatrix)
def compare_schemes(payload: SchemeComparisonRequest, db: Session = Depends(get_db)):
    if len(payload.scheme_ids) < 2 or len(payload.scheme_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select between 2 and 4 schemes for comparison."
        )

    schemes = db.query(Scheme).filter(
        Scheme.id.in_(payload.scheme_ids),
        Scheme.is_active == True
    ).all()

    if len(schemes) < 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find sufficient active schemes with the provided IDs."
        )

    details = []
    for s in schemes:
        active_hosp_count = len([m for m in s.hospital_mappings if m.status == "ACTIVE"])
        d = SchemeDetailOut.model_validate(s)
        d.empanelled_hospitals_count = active_hosp_count
        details.append(d)

    AnalyticsService.track_event(
        db=db,
        event_type="compare",
        metadata_json=str(payload.scheme_ids)
    )

    return SchemeComparisonMatrix(schemes=details)
