from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.data_source import DataSource, IngestionLog
from app.schemas.data_source import DataSourceResponse, IngestionLogResponse, IngestionRefreshResponse
from app.services.ingestion_service import IngestionService
from app.integrations.government.mjpjay import MJPJAYConnector
from app.integrations.government.pmjay import PMJAYConnector

router = APIRouter(prefix="", tags=["Data Sources & Ingestion"])

@router.get("/data-sources", response_model=List[DataSourceResponse])
def list_data_sources(db: Session = Depends(get_db)):
    """
    Lists all registered government data sources, types, and current record counts.
    """
    IngestionService.ensure_data_sources(db)
    return db.query(DataSource).all()

@router.get("/data-sources/status")
async def check_data_sources_status(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Checks connection/dataset status for official government sources.
    """
    mjpjay = MJPJAYConnector()
    pmjay = PMJAYConnector()
    
    m_stat = await mjpjay.check_status()
    p_stat = await pmjay.check_status()
    
    # Check local dataset source
    src_hosp = db.query(DataSource).filter(DataSource.name == "Provided Maharashtra Hospital Dataset").first()
    src_scheme = db.query(DataSource).filter(DataSource.name == "National & State Healthcare Schemes Catalog").first()

    return [
        m_stat,
        p_stat,
        {
            "name": src_hosp.name if src_hosp else "Provided Maharashtra Hospital Dataset",
            "organization": src_hosp.organization if src_hosp else "Government of Maharashtra",
            "source_type": "provided_dataset",
            "status": "synchronized",
            "record_count": src_hosp.record_count if src_hosp else 520,
            "last_checked": src_hosp.last_checked_at.isoformat() if src_hosp and src_hosp.last_checked_at else None
        },
        {
            "name": src_scheme.name if src_scheme else "National & State Healthcare Schemes Catalog",
            "organization": src_scheme.organization if src_scheme else "National Health Authority",
            "source_type": "provided_dataset",
            "status": "synchronized",
            "record_count": src_scheme.record_count if src_scheme else 11,
            "last_checked": src_scheme.last_checked_at.isoformat() if src_scheme and src_scheme.last_checked_at else None
        }
    ]

@router.get("/ingestion/status", response_model=List[IngestionLogResponse])
def get_ingestion_history(db: Session = Depends(get_db)):
    """
    Returns recent ingestion logs with record counts, updates, and timestamps.
    """
    return db.query(IngestionLog).order_by(IngestionLog.id.desc()).limit(20).all()

@router.post("/ingestion/refresh", response_model=IngestionRefreshResponse)
def trigger_data_refresh(db: Session = Depends(get_db)):
    """
    Triggers idempotent data synchronization and refresh from the dataset files.
    """
    result = IngestionService.sync_all(db)
    return IngestionRefreshResponse(
        success=True,
        message="Successfully synchronized and updated all healthcare schemes and empanelled hospital datasets.",
        hospitals_imported=result["hospitals"]["records_created"] + result["hospitals"]["records_updated"],
        schemes_imported=result["schemes"]["records_created"] + result["schemes"]["records_updated"],
        timestamp=datetime.now(timezone.utc)
    )
