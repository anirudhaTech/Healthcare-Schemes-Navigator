from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True) # e.g. "MJPJAY Hospital Directory", "National Scheme Catalog"
    organization = Column(String(255), nullable=False) # e.g. "Government of Maharashtra", "Ministry of Health & Family Welfare"
    source_type = Column(String(100), default="provided_dataset") # official_api, official_dataset, official_document, provided_dataset
    url = Column(String(500), nullable=True) # official URL or dataset endpoint
    description = Column(Text, nullable=True)
    last_checked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="active") # active, synchronized, offline, error
    record_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    ingestion_logs = relationship("IngestionLog", back_populates="source", cascade="all, delete-orphan")


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    source_name = Column(String(255), nullable=False)
    
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="RUNNING") # RUNNING, SUCCESS, PARTIAL, FAILED
    records_found = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    
    error_message = Column(Text, nullable=True)
    summary_report = Column(Text, nullable=True)

    source = relationship("DataSource", back_populates="ingestion_logs")


class DataChangeLog(Base):
    __tablename__ = "data_change_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True) # hospital, scheme
    entity_id = Column(Integer, nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    source_id = Column(Integer, nullable=True)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
