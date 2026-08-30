from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.location import State, District, Taluka
from app.schemas.location import StateOut, DistrictOut, TalukaOut, SimpleLocationItem

router = APIRouter(prefix="/locations", tags=["Locations Hierarchy"])

@router.get("/hierarchy", response_model=List[StateOut])
def get_full_location_hierarchy(db: Session = Depends(get_db)):
    states = db.query(State).options(
        joinedload(State.districts).joinedload(District.talukas)
    ).all()
    return states

@router.get("/states", response_model=List[SimpleLocationItem])
def get_states(db: Session = Depends(get_db)):
    states = db.query(State).order_by(State.name).all()
    return [SimpleLocationItem(id=s.id, name=s.name) for s in states]

@router.get("/states/{state_name}/districts", response_model=List[SimpleLocationItem])
def get_districts_by_state(state_name: str, db: Session = Depends(get_db)):
    state = db.query(State).filter(State.name.ilike(state_name)).first()
    if not state:
        return []
    districts = db.query(District).filter(District.state_id == state.id).order_by(District.name).all()
    return [SimpleLocationItem(id=d.id, name=d.name) for d in districts]

@router.get("/districts/{district_name}/talukas", response_model=List[TalukaOut])
def get_talukas_by_district(district_name: str, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.name.ilike(district_name)).first()
    if not district:
        return []
    talukas = db.query(Taluka).filter(Taluka.district_id == district.id).order_by(Taluka.name).all()
    return talukas
