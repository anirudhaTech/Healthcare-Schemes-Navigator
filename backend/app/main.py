from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.seeds.seed_data import seed_database
from app.services.ingestion_service import IngestionService
from app.api.v1.auth import router as auth_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.eligibility import router as eligibility_router
from app.api.v1.hospitals import router as hospitals_router
from app.api.v1.locations import router as locations_router
from app.api.v1.compare import router as compare_router
from app.api.v1.chat import router as chat_router
from app.api.v1.user import router as user_router
from app.api.v1.admin import router as admin_router
from app.api.v1.data_sources import router as data_sources_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed users and location structures
        seed_database(db)
        # Ingest and sync real Maharashtra hospitals and schemes datasets
        IngestionService.sync_all(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Public Healthcare Scheme Discovery, Rule-Based Eligibility Engine & Hospital Navigator",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(schemes_router, prefix=settings.API_V1_STR)
app.include_router(eligibility_router, prefix=settings.API_V1_STR)
app.include_router(hospitals_router, prefix=settings.API_V1_STR)
app.include_router(locations_router, prefix=settings.API_V1_STR)
app.include_router(compare_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(data_sources_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "message": "Healthcare Schemes Navigator API is running with real dataset ingestion.",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
