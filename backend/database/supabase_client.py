from supabase import create_client, Client
from core.config import get_settings
from utils.logger import database_logger

settings = get_settings()

class SupabaseClient:
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            try:
                cls._instance = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                # Test connection
                cls._instance.table('profiles').select('*').limit(1).execute()
                database_logger.info("Supabase client initialized successfully")
            except Exception as e:
                database_logger.error(f"Supabase initialization error: {e}")
                raise
        return cls._instance
    
    @classmethod
    def get_admin_client(cls) -> Client:
        """Admin client for privileged operations"""
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )

# Global client instance
supabase = SupabaseClient.get_client()
