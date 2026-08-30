import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.seeds.seed_data import seed_database
from app.services.ingestion_service import IngestionService

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Drop and recreate all tables for a clean test schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        IngestionService.sync_all(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
