import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Healthcare Schemes Navigator"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_jwt_key_healthcare_schemes_navigator_2026_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: Defaults to SQLite for immediate local execution, seamlessly supports PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./healthcare_navigator.db")
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Admin defaults
    ADMIN_EMAIL: str = "admin@healthcare.gov.in"
    ADMIN_PASSWORD: str = "admin123"
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
