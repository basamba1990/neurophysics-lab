# app/database/supabase_client.py

from supabase import create_client, Client
from core.config import get_settings
from utils.logger import database_logger

class SupabaseClient:
    _instance: Client | None = None
    _admin_instance: Client | None = None

    @staticmethod
    def _create_client(url: str, key: str) -> Client:
        """Create a Supabase client with safe error handling."""
        try:
            client = create_client(url, key)

            # Quick connection test (non-blocking)
            client.table("profiles").select("*").limit(1).execute()

            return client
        except Exception as e:
            database_logger.error(f"Supabase client creation failed: {e}")
            raise

    @classmethod
    def get_client(cls) -> Client:
        """Lazy-loaded public client (anon key)."""
        if cls._instance is None:
            settings = get_settings()

            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                database_logger.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
                raise ValueError("Supabase environment variables not set")

            database_logger.info("Initializing Supabase public client…")
            cls._instance = cls._create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )

            database_logger.info("Supabase public client initialized successfully")

        return cls._instance

    @classmethod
    def get_admin_client(cls) -> Client:
        """Lazy-loaded admin client (service_role key)."""
        if cls._admin_instance is None:
            settings = get_settings()

            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
                database_logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
                raise ValueError("Admin Supabase environment variables not set")

            database_logger.info("Initializing Supabase admin client…")
            cls._admin_instance = cls._create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )

            database_logger.info("Supabase admin client initialized successfully")

        return cls._admin_instance


# ⛔️ IMPORTANT : ne pas créer le client ici !
# ❌ supabase = SupabaseClient.get_client()

# ✔️ À la place, exporter une fonction sûre
def get_supabase():
    return SupabaseClient.get_client()

def get_admin_supabase():
    return SupabaseClient.get_admin_client()
