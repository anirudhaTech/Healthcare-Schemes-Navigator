import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scheme import Scheme
from app.models.user import User, EligibilityCheckRecord
from app.schemas.eligibility import EligibilityInput, EligibilityResponse
from app.services.recommendation_service import RecommendationService
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_optional_user

router = APIRouter(prefix="/eligibility", tags=["Eligibility & Recommendation Engine"])

@router.post("/check", response_model=EligibilityResponse)
def check_eligibility_and_recommend(
    payload: EligibilityInput,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    if not schemes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Healthcare schemes database is currently empty. Please initialize database seeds."
        )

    # Run 2-Tier Rule Engine + AI Recommendation Model
    results = RecommendationService.generate_recommendations(user_input=payload, all_schemes=schemes)

    # Record check snapshot in database
    top_scheme_name = results.recommendations[0].scheme.name if results.recommendations else None
    top_score = results.recommendations[0].match_score if results.recommendations else 0.0

    record = EligibilityCheckRecord(
        user_id=current_user.id if current_user else None,
        guest_session_id=payload.guest_session_id,
        input_snapshot=json.dumps(payload.model_dump()),
        matched_schemes_count=results.eligible_count + results.potentially_eligible_count,
        top_recommended_scheme=top_scheme_name,
        top_match_score=top_score
    )
    db.add(record)
    db.commit()

    # Track Analytics
    AnalyticsService.track_event(
        db=db,
        event_type="eligibility_check",
        scheme_name=top_scheme_name,
        state=payload.state,
        district=payload.district,
        healthcare_category=payload.healthcare_requirement,
        match_score=top_score
    )

    return results
