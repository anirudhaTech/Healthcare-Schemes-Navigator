from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.hospital import HospitalResponse, DistrictCountResponse
from app.services.hospital_service import HospitalService
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/hospitals", tags=["Location-Based Hospital & Scheme Navigator"])

@router.get("/districts", response_model=List[DistrictCountResponse])
def list_hospital_districts(
    state: str = Query("Maharashtra", description="State name"),
    db: Session = Depends(get_db)
):
    """
    Returns list of all districts with hospital counts from the real imported database.
    """
    return HospitalService.get_districts(db=db, state=state)

@router.get("/search", response_model=List[HospitalResponse])
def search_hospitals_by_query(
    q: str = Query(..., min_length=1, description="Hospital name or keyword query"),
    district: Optional[str] = Query(None, description="Optional district filter"),
    db: Session = Depends(get_db)
):
    """
    Free text search across real imported hospitals.
    """
    return HospitalService.get_hospitals(
        db=db,
        search=q,
        district=district
    )

@router.get("", response_model=List[HospitalResponse])
def list_or_filter_hospitals(
    state: Optional[str] = Query(None, description="State name, e.g. Maharashtra"),
    district: Optional[str] = Query(None, description="District name, e.g. Kolhapur"),
    taluka: Optional[str] = Query(None, description="Taluka name, e.g. Karvir"),
    pincode: Optional[str] = Query(None, description="PIN code"),
    scheme_slug: Optional[str] = Query(None, description="Filter hospitals empanelled for scheme slug"),
    hospital_type: Optional[str] = Query(None, description="Government Hospital, Private Hospital, etc."),
    is_government: Optional[bool] = Query(None),
    has_emergency: Optional[bool] = Query(None),
    search: Optional[str] = Query(None, description="Free text search query"),
    q: Optional[str] = Query(None, description="Alias for search query"),
    user_lat: Optional[float] = Query(None, description="User GPS latitude for distance calculation"),
    user_lng: Optional[float] = Query(None, description="User GPS longitude for distance calculation"),
    max_distance_km: Optional[float] = Query(100.0, description="Max radius in km"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Lists or filters verified hospital records with case-insensitive district filtering.
    """
    query_text = search or q

    hospitals = HospitalService.get_hospitals(
        db=db,
        state=state,
        district=district,
        taluka=taluka,
        pincode=pincode,
        scheme_slug=scheme_slug,
        hospital_type=hospital_type,
        is_government=is_government,
        has_emergency=has_emergency,
        search=query_text,
        user_lat=user_lat,
        user_lng=user_lng,
        max_distance_km=max_distance_km,
        skip=skip,
        limit=limit
    )

    if state or district:
        AnalyticsService.track_event(
            db=db,
            event_type="hospital_search",
            state=state,
            district=district,
            search_query=query_text
        )

    return hospitals

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital_detail(hospital_id: int, db: Session = Depends(get_db)):
    """
    Retrieves complete hospital profile with source provenance.
    """
    detail = HospitalService.get_hospital_detail(db=db, hospital_id=hospital_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found in the verified registry."
        )

    AnalyticsService.track_event(
        db=db,
        event_type="hospital_view",
        hospital_id=detail.id,
        hospital_name=detail.name,
        state=detail.state,
        district=detail.district_name
    )

    return detail

@router.get("/by-scheme/{scheme_slug}", response_model=List[HospitalResponse])
def get_hospitals_by_scheme(
    scheme_slug: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    taluka: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    db: Session = Depends(get_db)
):
    return HospitalService.get_hospitals(
        db=db,
        scheme_slug=scheme_slug,
        state=state,
        district=district,
        taluka=taluka,
        user_lat=user_lat,
        user_lng=user_lng
    )
