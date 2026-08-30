from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    email: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluka: Optional[str] = None
    city_village: Optional[str] = None
    pincode: Optional[str] = None
    area_type: Optional[str] = "Urban"
    annual_income: Optional[float] = 0.0
    income_bracket: Optional[str] = None
    occupation: Optional[str] = None
    bpl_status: Optional[bool] = False
    ration_card_type: Optional[str] = None
    social_category: Optional[str] = None
    family_size: Optional[int] = 1
    children_count: Optional[int] = 0
    elderly_count: Optional[int] = 0
    dependents_count: Optional[int] = 0
    has_disability: Optional[bool] = False
    disability_percentage: Optional[float] = 0.0
    healthcare_requirement: Optional[str] = None
    has_chronic_illness: Optional[bool] = False
    chronic_conditions: Optional[str] = None
    is_pregnant: Optional[bool] = False
    is_lactating: Optional[bool] = False
    child_age_months: Optional[int] = None
    hospitalization_needed: Optional[bool] = False
    has_existing_insurance: Optional[bool] = False

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    mobile: Optional[str] = None
    role: str
    is_active: bool
    profile: Optional[UserProfileSchema] = None

# Backward compatibility aliases
UserResponse = UserOut
TokenResponse = Token
UserProfileResponse = UserProfileSchema
UserProfileUpdate = UserProfileSchema
