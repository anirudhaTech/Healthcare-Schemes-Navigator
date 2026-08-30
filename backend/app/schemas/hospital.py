from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class HospitalSchemeMappingResponse(BaseModel):
    scheme_id: int
    scheme_name: str
    scheme_slug: str
    status: str
    empanelment_number: Optional[str] = None
    services_covered: Optional[str] = None
    last_verified_date: Optional[str] = "August 2026"
    official_source: Optional[str] = "State Health Agency (SHA)"
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class HospitalBase(BaseModel):
    name: str
    hospital_type: Optional[str] = "Empanelled Hospital"
    is_government: bool = False
    state: str = "Maharashtra"
    district_name: str
    taluka_name: Optional[str] = None
    city_village: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    facilities: Optional[str] = None
    has_emergency_24x7: bool = False
    bed_count: Optional[int] = None
    verification_status: str = "source_provided"
    last_verified_date: str = "August 2026"
    official_source: str = "Provided Maharashtra Hospital Dataset"
    data_source: Optional[str] = "Provided hospital dataset"
    source_file: Optional[str] = "Pasted text (2).txt"
    source_record_id: Optional[int] = None


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    hospital_type: Optional[str] = None
    is_government: Optional[bool] = None
    state: Optional[str] = None
    district_name: Optional[str] = None
    taluka_name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    has_emergency_24x7: Optional[bool] = None
    bed_count: Optional[int] = None
    verification_status: Optional[str] = None


class HospitalResponse(HospitalBase):
    id: int
    is_active: bool
    distance_km: Optional[float] = None
    recommendation_score: Optional[float] = None
    available_schemes: List[HospitalSchemeMappingResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class DistrictCountResponse(BaseModel):
    district: str
    hospital_count: int
    state: str = "Maharashtra"


class HospitalSearchQuery(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    taluka: Optional[str] = None
    pincode: Optional[str] = None
    scheme_id: Optional[int] = None
    scheme_slug: Optional[str] = None
    hospital_type: Optional[str] = None
    is_government: Optional[bool] = None
    has_emergency: Optional[bool] = None
    search: Optional[str] = None
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    max_distance_km: Optional[float] = 100.0
    skip: int = 0
    limit: int = 100


class HospitalCSVImportRow(BaseModel):
    hospital_name: str
    hospital_type: Optional[str] = "Government Hospital"
    state: str = "Maharashtra"
    district: str = "Kolhapur"
    taluka: Optional[str] = "Karvir"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    specialties: Optional[str] = None
    facilities: Optional[str] = None


# Backward compatibility aliases
HospitalOut = HospitalResponse
HospitalDetailOut = HospitalResponse
HospitalFilterParams = HospitalSearchQuery
HospitalSchemeMappingOut = HospitalSchemeMappingResponse
