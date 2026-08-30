from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.scheme import SchemeOut

class EligibilityInput(BaseModel):
    # Personal
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., description="Male, Female, Other")
    marital_status: Optional[str] = "Single"
    
    # Location
    state: str = Field(..., description="State name, e.g., Maharashtra")
    district: Optional[str] = None
    taluka: Optional[str] = None
    city_village: Optional[str] = None
    pincode: Optional[str] = None
    area_type: Optional[str] = "Urban"
    
    # Socioeconomic
    annual_income: float = Field(0.0, ge=0.0)
    income_bracket: Optional[str] = None
    occupation: Optional[str] = "Other"
    bpl_status: bool = False
    ration_card_type: Optional[str] = "None"
    social_category: Optional[str] = "General"
    
    # Family
    family_size: int = Field(1, ge=1)
    children_count: int = Field(0, ge=0)
    elderly_count: int = Field(0, ge=0)
    dependents_count: int = Field(0, ge=0)
    has_disability: bool = False
    disability_percentage: Optional[float] = 0.0
    
    # Healthcare requirements
    healthcare_requirement: str = Field(..., description="Hospitalization, Maternal / Child, Surgery, Critical Illness, General Care, Preventive, Diagnostic")
    has_chronic_illness: bool = False
    chronic_conditions: Optional[str] = None
    is_pregnant: bool = False
    is_lactating: bool = False
    child_age_months: Optional[int] = None
    hospitalization_needed: bool = False
    has_existing_insurance: bool = False
    
    # Guest session identifier
    guest_session_id: Optional[str] = None


class RuleEvaluationDetail(BaseModel):
    status: str
    matched_criteria: List[str] = []
    unmatched_criteria: List[str] = []
    verification_caveats: List[str] = []
    summary: str


class RecommendationScoreBreakdown(BaseModel):
    rule_score: float
    healthcare_need_score: float
    demographic_score: float
    location_score: float
    socioeconomic_score: float
    total_score: float
    match_level: str


class RecommendedSchemeOut(BaseModel):
    scheme: SchemeOut
    eligibility_status: str
    match_score: float
    match_level: str
    rule_evaluation: RuleEvaluationDetail
    score_breakdown: RecommendationScoreBreakdown
    why_recommended: List[str]
    verification_warning: str
    nearby_hospitals_count: Optional[int] = 0


class EligibilityResponse(BaseModel):
    total_schemes_evaluated: int
    eligible_count: int
    potentially_eligible_count: int
    recommendations: List[RecommendedSchemeOut]
    disclaimer: str = "This eligibility result is an informational assessment based on public scheme guidelines. Final eligibility and benefit disbursement are subject to official verification by the competent government authority."

# Compatibility aliases
EligibilityCheckRequest = EligibilityInput
RecommendedSchemeResponse = RecommendedSchemeOut
ScoreBreakdown = RecommendationScoreBreakdown
