from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SchemeCreate(BaseModel):
    slug: str
    name: str
    short_description: str
    long_description: str
    government_department: str
    scheme_type: str = "Central"
    target_population: str
    states_covered: str = "All India"
    coverage_amount: str
    cashless: bool = True
    application_process: str
    application_mode: str = "Online / CSC / Hospital Helpdesk"
    official_website: str
    helpline: str
    last_verified_date: str = "August 2026"
    official_source: str = "Ministry of Health & Family Welfare"
    featured: bool = False
    
    # Eligibility rule inputs
    min_age: int = 0
    max_age: int = 120
    gender: str = "All"
    max_annual_income: float = 0.0
    bpl_required: bool = False
    secc_required: bool = False
    ration_card_types: str = "All"
    allowed_social_categories: str = "All"
    allowed_occupations: str = "All"
    rural_urban: str = "Both"
    requires_disability: bool = False
    requires_pregnancy: bool = False
    requires_lactating: bool = False
    requires_child: bool = False
    max_child_age_years: int = 18
    healthcare_conditions: str
    match_reasons_template: Optional[str] = None
    verification_caveat_template: Optional[str] = None

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    government_department: Optional[str] = None
    scheme_type: Optional[str] = None
    target_population: Optional[str] = None
    states_covered: Optional[str] = None
    coverage_amount: Optional[str] = None
    cashless: Optional[bool] = None
    application_process: Optional[str] = None
    application_mode: Optional[str] = None
    official_website: Optional[str] = None
    helpline: Optional[str] = None
    last_verified_date: Optional[str] = None
    official_source: Optional[str] = None
    is_active: Optional[bool] = None
    featured: Optional[bool] = None

class HospitalCreate(BaseModel):
    name: str
    hospital_type: str
    is_government: bool = True
    state: str
    district_name: str
    taluka_name: str
    city_village: Optional[str] = None
    pincode: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    facilities: Optional[str] = None
    has_emergency_24x7: bool = True
    bed_count: int = 50
    verification_status: str = "Verified"
    last_verified_date: str = "August 2026"
    official_source: str = "NHA Empanelled Registry"
    scheme_ids: List[int] = []

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    hospital_type: Optional[str] = None
    is_government: Optional[bool] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    specialties: Optional[str] = None
    facilities: Optional[str] = None
    has_emergency_24x7: Optional[bool] = None
    verification_status: Optional[str] = None
    last_verified_date: Optional[str] = None
    scheme_ids: Optional[List[int]] = None

class AnalyticsOverviewOut(BaseModel):
    total_users: int
    total_schemes: int
    total_hospitals: int
    total_eligibility_checks: int
    top_recommended_schemes: List[Dict[str, Any]]
    popular_healthcare_categories: List[Dict[str, Any]]
    state_wise_activity: List[Dict[str, Any]]
    recent_checks_trend: List[Dict[str, Any]]

class HospitalCSVImportResult(BaseModel):
    success: bool
    created_count: int
    errors: List[str] = []

# Compatibility aliases
AnalyticsOverview = AnalyticsOverviewOut
SchemeCreateAdmin = SchemeCreate
