from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class SchemeEligibilityRuleBase(BaseModel):
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
    requires_senior: bool = False
    requires_hospitalization: bool = False
    applicable_states: str = "All India"
    healthcare_conditions: str
    match_reasons_template: Optional[str] = None
    verification_caveat_template: Optional[str] = None


class SchemeEligibilityRuleResponse(SchemeEligibilityRuleBase):
    id: int
    scheme_id: int
    model_config = ConfigDict(from_attributes=True)


class SchemeBenefitBase(BaseModel):
    title: str
    description: str
    benefit_type: str = "Financial Coverage"
    amount: float = 0.0


class SchemeBenefitResponse(SchemeBenefitBase):
    id: int
    scheme_id: int
    model_config = ConfigDict(from_attributes=True)


class SchemeDocumentBase(BaseModel):
    name: str
    is_mandatory: bool = True
    description: Optional[str] = None
    alternatives: Optional[str] = None


class SchemeDocumentResponse(SchemeDocumentBase):
    id: int
    scheme_id: int
    model_config = ConfigDict(from_attributes=True)


class SchemeBase(BaseModel):
    slug: str
    name: str
    category: Optional[str] = "Hospitalization"
    disease_focus: Optional[str] = None
    short_description: str
    long_description: str
    government_department: str
    scheme_type: str = "Central"
    target_population: str
    states_covered: str = "All India"
    coverage_state: Optional[str] = "All India"
    coverage_amount: str
    income_limit: Optional[str] = None
    cashless: bool = True
    application_process: str
    application_mode: str = "Online / CSC / Hospital Helpdesk"
    application_url: Optional[str] = None
    official_website: str
    helpline: str
    last_verified_date: str = "August 2026"
    official_source: str = "National & State Healthcare Schemes Catalog"
    data_source: Optional[str] = "Provided scheme dataset"
    source_file: Optional[str] = "Pasted markdown.md"
    source_record_id: Optional[int] = None
    featured: bool = False


class SchemeCreate(SchemeBase):
    pass


class SchemeResponse(SchemeBase):
    id: int
    is_active: bool
    eligibility_rule: Optional[SchemeEligibilityRuleResponse] = None
    benefits: List[SchemeBenefitResponse] = []
    documents: List[SchemeDocumentResponse] = []
    empanelled_hospitals_count: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)


class SchemeComparisonRequest(BaseModel):
    scheme_ids: List[int]


class SchemeComparisonMatrix(BaseModel):
    schemes: List[SchemeResponse]


# Backward compatibility aliases
SchemeOut = SchemeResponse
SchemeDetailOut = SchemeResponse
SchemeEligibilityRuleOut = SchemeEligibilityRuleResponse
SchemeBenefitOut = SchemeBenefitResponse
SchemeDocumentOut = SchemeDocumentResponse
SchemeFilterParams = BaseModel
