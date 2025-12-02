# core/config.py

from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "R&D Accelerator Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Supabase
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_KEY: str = "your-supabase-key"
    SUPABASE_SERVICE_KEY: str = "your-service-key"
    
    # OpenAI
    OPENAI_API_KEY: str = "your-openai-key"
    OPENAI_ORGANIZATION: Optional[str] = None
    
    # Models
    MODEL_CACHE_DIR: str = "./data/pre_trained_models"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://yourapp.vercel.app"
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "./data/uploads"
    
    # Redis / WebSockets cache
    REDIS_URL: str = "redis://localhost:6379"
    
    # Cloud providers
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings():
    return Settings()
