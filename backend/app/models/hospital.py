from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    hospital_type = Column(String(100), nullable=True, default="Empanelled Hospital") # Government Hospital, Private Hospital, etc.
    is_government = Column(Boolean, default=False)
    
    # Location
    state = Column(String(100), default="Maharashtra", nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="SET NULL"), nullable=True, index=True)
    district_name = Column(String(100), nullable=False, index=True)
    taluka_id = Column(Integer, ForeignKey("talukas.id", ondelete="SET NULL"), nullable=True, index=True)
    taluka_name = Column(String(100), nullable=True, index=True)
    city_village = Column(String(150), nullable=True)
    pincode = Column(String(20), nullable=True, index=True)
    address = Column(Text, nullable=True)
    
    # Geo Coordinates (Nullable - Do not fake coordinates)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    coordinate_source = Column(String(100), nullable=True)
    coordinate_verified_at = Column(DateTime, nullable=True)
    
    # Contact & Info
    phone = Column(String(100), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    email = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Medical Capabilities
    specialties = Column(Text, nullable=True)
    facilities = Column(Text, nullable=True)
    has_emergency_24x7 = Column(Boolean, default=False)
    bed_count = Column(Integer, nullable=True)
    
    # Data Provenance & Verification
    source_file = Column(String(255), default="Pasted text (2).txt", nullable=True, index=True)
    source_record_id = Column(Integer, nullable=True, index=True)
    data_source = Column(String(255), default="Provided hospital dataset", nullable=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True)
    verification_status = Column(String(50), default="source_provided") # source_provided, official_dataset, verified
    last_verified_date = Column(String(50), default="August 2026")
    official_source = Column(String(255), default="Provided Maharashtra Hospital Dataset")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('source_file', 'source_record_id', name='uq_hospital_source_record'),
    )

    district = relationship("District", back_populates="hospitals")
    taluka = relationship("Taluka", back_populates="hospitals")
    scheme_mappings = relationship("HospitalScheme", back_populates="hospital", cascade="all, delete-orphan")


class HospitalScheme(Base):
    __tablename__ = "hospital_schemes"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Empanelment & Status
    status = Column(String(50), default="ACTIVE") # ACTIVE, INACTIVE, PENDING_VERIFICATION, UNKNOWN
    empanelment_number = Column(String(100), nullable=True)
    services_covered = Column(Text, nullable=True)
    
    # Provenance
    source_file = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    last_verified_date = Column(String(50), default="August 2026")
    official_source = Column(String(255), default="Empanelled Network Registry")
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="scheme_mappings")
    scheme = relationship("Scheme", back_populates="hospital_mappings")
