import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "R&D Accelerator API"
    VERSION: str = "1.0.0"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "http://localhost:54321")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "dummy_key")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "dummy_key")

settings = Settings()
