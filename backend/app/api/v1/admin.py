from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.scheme import Scheme, SchemeEligibilityRule
from app.models.hospital import Hospital, HospitalScheme
from app.schemas.admin import (
    SchemeCreate,
    SchemeUpdate,
    HospitalCreate,
    HospitalUpdate,
    AnalyticsOverviewOut
)
from app.schemas.scheme import SchemeDetailOut, SchemeOut
from app.schemas.hospital import HospitalDetailOut, HospitalOut
from app.api.deps import get_current_admin
from app.services.analytics_service import AnalyticsService
from app.services.hospital_service import HospitalService

router = APIRouter(prefix="/admin", tags=["Admin Portal & Scheme Management"])

@router.get("/analytics", response_model=AnalyticsOverviewOut)
def get_admin_analytics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_overview(db=db)

# --- Scheme Management ---

@router.post("/schemes", response_model=SchemeDetailOut, status_code=status.HTTP_201_CREATED)
def create_scheme(
    payload: SchemeCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Scheme).filter(Scheme.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A scheme with this slug already exists.")

    data = payload.model_dump()
    # Extract rule fields
    rule_fields = [
        "min_age", "max_age", "gender", "max_annual_income", "bpl_required",
        "secc_required", "ration_card_types", "allowed_social_categories",
        "allowed_occupations", "rural_urban", "requires_disability",
        "requires_pregnancy", "requires_lactating", "requires_child",
        "max_child_age_years", "healthcare_conditions",
        "match_reasons_template", "verification_caveat_template"
    ]
    rule_data = {k: data.pop(k) for k in rule_fields if k in data}

    scheme = Scheme(**data)
    db.add(scheme)
    db.flush()

    rule = SchemeEligibilityRule(scheme_id=scheme.id, **rule_data)
    db.add(rule)
    db.commit()
    db.refresh(scheme)

    return SchemeDetailOut.model_validate(scheme)

@router.put("/schemes/{scheme_id}", response_model=SchemeDetailOut)
def update_scheme(
    scheme_id: int,
    payload: SchemeUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(scheme, k, v)

    db.commit()
    db.refresh(scheme)
    return SchemeDetailOut.model_validate(scheme)

@router.delete("/schemes/{scheme_id}", status_code=status.HTTP_200_OK)
def delete_scheme(
    scheme_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")

    scheme.is_active = False
    db.commit()
    return {"success": True, "message": f"Scheme '{scheme.name}' deactivated."}

# --- Hospital Management ---

@router.post("/hospitals", response_model=HospitalDetailOut, status_code=status.HTTP_201_CREATED)
def create_hospital(
    payload: HospitalCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    data = payload.model_dump()
    scheme_ids = data.pop("scheme_ids", [])

    hosp = Hospital(**data)
    db.add(hosp)
    db.flush()

    for s_id in scheme_ids:
        mapping = HospitalScheme(
            hospital_id=hosp.id,
            scheme_id=s_id,
            status="ACTIVE",
            official_source="Admin Entry"
        )
        db.add(mapping)

    db.commit()
    return HospitalService.get_hospital_detail(db=db, hospital_id=hosp.id)

@router.put("/hospitals/{hospital_id}", response_model=HospitalDetailOut)
def update_hospital(
    hospital_id: int,
    payload: HospitalUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found.")

    data = payload.model_dump(exclude_unset=True)
    scheme_ids = data.pop("scheme_ids", None)

    for k, v in data.items():
        setattr(hosp, k, v)

    if scheme_ids is not None:
        db.query(HospitalScheme).filter(HospitalScheme.hospital_id == hosp.id).delete()
        for s_id in scheme_ids:
            mapping = HospitalScheme(
                hospital_id=hosp.id,
                scheme_id=s_id,
                status="ACTIVE",
                official_source="Admin Update"
            )
            db.add(mapping)

    db.commit()
    return HospitalService.get_hospital_detail(db=db, hospital_id=hosp.id)

@router.delete("/hospitals/{hospital_id}", status_code=status.HTTP_200_OK)
def delete_hospital(
    hospital_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found.")

    hosp.is_active = False
    db.commit()
    return {"success": True, "message": f"Hospital '{hosp.name}' deactivated."}

@router.post("/hospitals/import-csv")
async def import_hospitals_csv(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    csv_text = content.decode("utf-8-sig", errors="ignore")
    result = HospitalService.import_hospitals_from_csv(db=db, csv_content=csv_text)
    return result
