from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile = Column(String(20), index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user") # 'user' or 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_schemes = relationship("SavedScheme", back_populates="user", cascade="all, delete-orphan")
    eligibility_checks = relationship("EligibilityCheckRecord", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Demographics
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True) # Male, Female, Other
    marital_status = Column(String(50), nullable=True)
    
    # Location
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    taluka = Column(String(100), nullable=True)
    city_village = Column(String(150), nullable=True)
    pincode = Column(String(20), nullable=True)
    area_type = Column(String(20), default="Urban") # Rural, Urban
    
    # Socioeconomic
    annual_income = Column(Float, default=0.0)
    income_bracket = Column(String(50), nullable=True) # Below 1L, 1L-2.5L, 2.5L-5L, Above 5L
    occupation = Column(String(100), nullable=True) # Daily Wage Worker, Farmer, Self Employed, Salaried, Unemployed, Senior Citizen, Student, Other
    bpl_status = Column(Boolean, default=False)
    ration_card_type = Column(String(50), nullable=True) # Antyodaya (AAY), BPL / Yellow, Priority Household (PHH) / Orange, White / Non-BPL
    social_category = Column(String(50), nullable=True) # General, OBC, SC, ST, EWS
    
    # Family
    family_size = Column(Integer, default=1)
    children_count = Column(Integer, default=0)
    elderly_count = Column(Integer, default=0)
    dependents_count = Column(Integer, default=0)
    has_disability = Column(Boolean, default=False)
    disability_percentage = Column(Float, default=0.0)
    
    # Healthcare Needs
    healthcare_requirement = Column(String(100), nullable=True) # Hospitalization, Critical Illness, Maternal / Child, General Care, Surgery, Diagnostic, Preventive
    has_chronic_illness = Column(Boolean, default=False)
    chronic_conditions = Column(Text, nullable=True) # e.g. "Diabetes, Hypertension"
    is_pregnant = Column(Boolean, default=False)
    is_lactating = Column(Boolean, default=False)
    child_age_months = Column(Integer, nullable=True)
    hospitalization_needed = Column(Boolean, default=False)
    has_existing_insurance = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="saved_schemes")
    scheme = relationship("Scheme")


class EligibilityCheckRecord(Base):
    __tablename__ = "eligibility_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # Nullable for guest checks
    guest_session_id = Column(String(100), nullable=True)
    
    # Captured input snapshot (JSON-serialized or columns)
    input_snapshot = Column(Text, nullable=False)
    matched_schemes_count = Column(Integer, default=0)
    top_recommended_scheme = Column(String(255), nullable=True)
    top_match_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="eligibility_checks")
