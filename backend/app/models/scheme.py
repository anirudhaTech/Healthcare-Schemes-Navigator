from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), default="Hospitalization", nullable=True) # e.g. Hospitalization, Maternal, Child, General
    disease_focus = Column(String(255), nullable=True)
    short_description = Column(String(500), nullable=False)
    long_description = Column(Text, nullable=False)
    government_department = Column(String(255), nullable=False)
    scheme_type = Column(String(100), default="Central") # Central, State, Centrally Sponsored
    target_population = Column(String(255), nullable=False)
    
    # Geographic scope
    states_covered = Column(Text, default="All India")
    coverage_state = Column(String(100), default="All India", nullable=True)
    
    # Financial coverage & limits
    coverage_amount = Column(String(150), nullable=False)
    income_limit = Column(String(255), nullable=True)
    cashless = Column(Boolean, default=True)
    
    # Administration & Guidance
    application_process = Column(Text, nullable=False)
    application_mode = Column(String(100), default="Online / CSC / Hospital Helpdesk")
    application_url = Column(String(500), nullable=True)
    official_website = Column(String(255), nullable=False)
    helpline = Column(String(100), nullable=False)
    
    # Provenance & Verification
    source_file = Column(String(255), default="Pasted markdown.md", nullable=True, index=True)
    source_record_id = Column(Integer, nullable=True, index=True)
    data_source = Column(String(255), default="Provided scheme dataset", nullable=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True)
    verification_status = Column(String(50), default="source_provided") # source_provided, official_dataset, verified
    last_verified_date = Column(String(50), default="August 2026")
    official_source = Column(String(255), default="National & State Healthcare Schemes Catalog")
    
    is_active = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('source_file', 'source_record_id', name='uq_scheme_source_record'),
    )

    eligibility_rule = relationship("SchemeEligibilityRule", back_populates="scheme", uselist=False, cascade="all, delete-orphan")
    benefits = relationship("SchemeBenefit", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    hospital_mappings = relationship("HospitalScheme", back_populates="scheme", cascade="all, delete-orphan")


class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Demographics
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=120)
    gender = Column(String(50), default="All") # All, Female, Male
    
    # Socioeconomic thresholds
    max_annual_income = Column(Float, default=0.0)
    bpl_required = Column(Boolean, default=False)
    secc_required = Column(Boolean, default=False)
    ration_card_types = Column(String(255), default="All")
    allowed_social_categories = Column(String(255), default="All")
    allowed_occupations = Column(Text, default="All")
    rural_urban = Column(String(50), default="Both")
    
    # Family & Special Conditions
    requires_disability = Column(Boolean, default=False)
    requires_pregnancy = Column(Boolean, default=False)
    requires_lactating = Column(Boolean, default=False)
    requires_child = Column(Boolean, default=False)
    max_child_age_years = Column(Integer, default=18)
    requires_senior = Column(Boolean, default=False)
    requires_hospitalization = Column(Boolean, default=False)
    applicable_states = Column(String(255), default="All India")
    
    # Healthcare requirements covered
    healthcare_conditions = Column(Text, nullable=False)
    
    # Rule Evaluation Summary / Explanations
    match_reasons_template = Column(Text, nullable=True)
    verification_caveat_template = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="eligibility_rule")


class SchemeBenefit(Base):
    __tablename__ = "scheme_benefits"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    benefit_type = Column(String(100), default="Financial Coverage")
    amount = Column(Float, default=0.0)
    
    scheme = relationship("Scheme", back_populates="benefits")


class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)
    alternatives = Column(String(255), nullable=True)

    scheme = relationship("Scheme", back_populates="documents")
