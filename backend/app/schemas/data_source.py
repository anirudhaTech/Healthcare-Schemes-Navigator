from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class DataSourceBase(BaseModel):
    name: str
    organization: str
    source_type: str = "provided_dataset" # official_api, official_dataset, official_document, provided_dataset
    url: Optional[str] = None
    description: Optional[str] = None
    status: str = "active"

class DataSourceCreate(DataSourceBase):
    pass

class DataSourceResponse(DataSourceBase):
    id: int
    record_count: int
    last_checked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class IngestionLogResponse(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    records_found: int
    records_created: int
    records_updated: int
    records_skipped: int
    records_failed: int
    error_message: Optional[str] = None
    summary_report: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class IngestionRefreshResponse(BaseModel):
    success: bool
    message: str
    hospitals_imported: int
    schemes_imported: int
    timestamp: datetime
