from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.scheme import Scheme
from app.models.user import User, SavedScheme
from app.schemas.scheme import SchemeOut, SchemeDetailOut
from app.api.deps import get_db, get_optional_user, get_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeOut])
def list_schemes(
    search: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    state: Optional[str] = Query(None, description="Filter by state coverage"),
    category: Optional[str] = Query(None, description="Filter by healthcare condition/category"),
    scheme_type: Optional[str] = Query(None, description="Central or State"),
    featured_only: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if featured_only:
        query = query.filter(Scheme.featured == True)

    if scheme_type:
        query = query.filter(Scheme.scheme_type.ilike(f"%{scheme_type}%"))

    if state and state.lower() not in ["all india", "all states"]:
        query = query.filter(
            or_(
                Scheme.states_covered.ilike(f"%{state}%"),
                Scheme.states_covered.ilike("%All India%"),
                Scheme.states_covered.ilike("%National%")
            )
        )

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Scheme.name.ilike(s),
                Scheme.short_description.ilike(s),
                Scheme.long_description.ilike(s),
                Scheme.target_population.ilike(s),
                Scheme.government_department.ilike(s)
            )
        )

    schemes = query.all()

    # If category filter requested, post-filter by eligibility condition text
    if category:
        c_lower = category.lower()
        schemes = [
            s for s in schemes
            if (s.eligibility_rule and c_lower in s.eligibility_rule.healthcare_conditions.lower())
            or c_lower in s.short_description.lower()
            or c_lower in s.long_description.lower()
        ]

    return schemes

@router.get("/{id_or_slug}", response_model=SchemeDetailOut)
def get_scheme_by_id_or_slug(
    id_or_slug: str,
    db: Session = Depends(get_db)
):
    if id_or_slug.isdigit():
        scheme = db.query(Scheme).filter(Scheme.id == int(id_or_slug), Scheme.is_active == True).first()
    else:
        scheme = db.query(Scheme).filter(Scheme.slug == id_or_slug, Scheme.is_active == True).first()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested healthcare scheme was not found or is currently inactive."
        )

    active_hosp_count = len([m for m in scheme.hospital_mappings if m.status == "ACTIVE"])
    detail = SchemeDetailOut.model_validate(scheme)
    detail.empanelled_hospitals_count = active_hosp_count

    # Track view event
    AnalyticsService.track_event(
        db=db,
        event_type="scheme_view",
        scheme_id=scheme.id,
        scheme_name=scheme.name
    )

    return detail

@router.post("/{scheme_id}/save", status_code=status.HTTP_200_OK)
def save_scheme_bookmark(
    scheme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    existing = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()

    if not existing:
        saved = SavedScheme(user_id=current_user.id, scheme_id=scheme_id)
        db.add(saved)
        db.commit()
        AnalyticsService.track_event(
            db=db,
            event_type="scheme_save",
            scheme_id=scheme.id,
            scheme_name=scheme.name
        )

    return {"success": True, "message": f"{scheme.name} saved to your dashboard."}

@router.delete("/{scheme_id}/save", status_code=status.HTTP_200_OK)
def remove_saved_scheme(
    scheme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    return {"success": True, "message": "Scheme removed from saved list."}
