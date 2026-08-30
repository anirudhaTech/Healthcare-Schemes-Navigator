from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.core.database import Base

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True) # eligibility_check, scheme_view, hospital_view, search, scheme_save, compare
    scheme_id = Column(Integer, nullable=True, index=True)
    scheme_name = Column(String(255), nullable=True)
    hospital_id = Column(Integer, nullable=True, index=True)
    hospital_name = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    healthcare_category = Column(String(100), nullable=True)
    match_score = Column(Float, nullable=True)
    search_query = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
