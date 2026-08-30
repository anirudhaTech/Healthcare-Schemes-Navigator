from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TalukaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pincode: Optional[str] = None

class DistrictOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    talukas: List[TalukaOut] = []

class StateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: Optional[str] = None
    districts: List[DistrictOut] = []

class SimpleLocationItem(BaseModel):
    id: int
    name: str

# Compatibility aliases
StateResponse = StateOut
DistrictResponse = DistrictOut
TalukaResponse = TalukaOut
LocationHierarchyResponse = StateOut
