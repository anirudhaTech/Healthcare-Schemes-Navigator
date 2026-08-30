from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserProfile, SavedScheme, EligibilityCheckRecord
from app.models.scheme import Scheme
from app.schemas.auth import UserProfileSchema, UserOut
from app.schemas.scheme import SchemeOut
from app.api.deps import get_current_user
from app.services.recommendation_service import RecommendationService
from app.schemas.eligibility import EligibilityInput

router = APIRouter(prefix="/user", tags=["User Profile & Dashboard"])

@router.get("/profile", response_model=UserProfileSchema)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=UserProfileSchema)
def update_profile(
    payload: UserProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/saved-schemes", response_model=List[SchemeOut])
def get_saved_schemes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == current_user.id).all()
    schemes = [s.scheme for s in saved if s.scheme and s.scheme.is_active]
    return schemes

@router.get("/dashboard")
def get_user_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == current_user.id).all()
    checks = db.query(EligibilityCheckRecord).filter(EligibilityCheckRecord.user_id == current_user.id).order_by(EligibilityCheckRecord.created_at.desc()).all()

    # Calculate Profile Completion percentage
    completion_fields = [
        profile.age, profile.gender, profile.state, profile.district,
        profile.annual_income, profile.occupation, profile.ration_card_type,
        profile.healthcare_requirement
    ] if profile else []
    filled_count = sum(1 for f in completion_fields if f is not None and f != "" and f != 0.0)
    completion_pct = int((filled_count / max(len(completion_fields), 1)) * 100) if completion_fields else 15

    # Run quick recommendation if profile has baseline location & age
    recommended_count = 0
    top_recommendation = None
    if profile and profile.age and profile.state:
        all_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        u_input = EligibilityInput(
            age=profile.age,
            gender=profile.gender or "Male",
            state=profile.state,
            district=profile.district,
            annual_income=profile.annual_income or 0.0,
            bpl_status=profile.bpl_status or False,
            healthcare_requirement=profile.healthcare_requirement or "General Care",
            is_pregnant=profile.is_pregnant or False,
            hospitalization_needed=profile.hospitalization_needed or False
        )
        rec_results = RecommendationService.generate_recommendations(user_input=u_input, all_schemes=all_schemes)
        recommended_count = rec_results.eligible_count + rec_results.potentially_eligible_count
        if rec_results.recommendations:
            top_recommendation = {
                "name": rec_results.recommendations[0].scheme.name,
                "score": rec_results.recommendations[0].match_score,
                "level": rec_results.recommendations[0].match_level,
                "slug": rec_results.recommendations[0].scheme.slug
            }

    return {
        "user_name": current_user.full_name,
        "email": current_user.email,
        "profile_completion": completion_pct,
        "saved_schemes_count": len(saved),
        "saved_schemes": [SchemeOut.model_validate(s.scheme) for s in saved if s.scheme],
        "eligibility_checks_count": len(checks),
        "recommended_schemes_count": recommended_count,
        "top_recommendation": top_recommendation,
        "recent_checks": [
            {
                "id": c.id,
                "created_at": c.created_at.strftime("%b %d, %Y") if c.created_at else "Recent",
                "top_scheme": c.top_recommended_scheme,
                "match_score": c.top_match_score,
                "matched_count": c.matched_schemes_count
            }
            for c in checks[:5]
        ]
    }
