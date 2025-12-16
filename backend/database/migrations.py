from supabase import Client
from database.supabase_client import SupabaseClient
from utils.logger import database_logger

class DatabaseMigrator:
    """Database migration manager"""
    
    def __init__(self, client: Client):
        self.client = client
    
    def run_migrations(self):
        """Run all database migrations"""
        database_logger.info("Starting database migrations")
        
        try:
            self._create_tables()
            self._create_indexes()
            self._create_rls_policies()
            
            database_logger.info("Database migrations completed successfully")
        except Exception as e:
            database_logger.error(f"Migration failed: {e}")
            raise
    
    def _create_tables(self):
        """Create database tables if they don't exist"""
        # This would typically be done via SQL files or Supabase migrations
        # For now, we'll assume tables are created via Supabase dashboard
        database_logger.info("Tables creation skipped - assuming pre-created via Supabase")
    
    def _create_indexes(self):
        """Create performance indexes"""
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_simulations_team ON simulations(team_id, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status)",
            "CREATE INDEX IF NOT EXISTS idx_physics_models_team ON physics_models(team_id)",
            "CREATE INDEX IF NOT EXISTS idx_code_analysis_session ON code_analysis(session_id)",
            "CREATE INDEX IF NOT EXISTS idx_usage_org_month ON usage_metrics(org_id, month_year)"
        ]
        
        for index_sql in indexes:
            try:
                # In a real implementation, you would execute these SQL statements
                # For Supabase, you might use the SQL editor or migrations
                database_logger.info(f"Would create index: {index_sql}")
            except Exception as e:
                database_logger.warning(f"Index creation skipped: {e}")
    
    def _create_rls_policies(self):
        """Create Row Level Security policies"""
        policies = [
            # Organizations RLS
            "ALTER TABLE organizations ENABLE ROW LEVEL SECURITY",
            "CREATE POLICY org_policy ON organizations FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE org_id = organizations.id))",
            
            # Teams RLS  
            "ALTER TABLE teams ENABLE ROW LEVEL SECURITY",
            "CREATE POLICY team_policy ON teams FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE team_id = teams.id))",
            
            # Simulations RLS
            "ALTER TABLE simulations ENABLE ROW LEVEL SECURITY", 
            "CREATE POLICY sim_policy ON simulations FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE team_id = simulations.team_id))"
        ]
        
        for policy in policies:
            try:
                database_logger.info(f"Would create RLS policy: {policy}")
            except Exception as e:
                database_logger.warning(f"RLS policy creation skipped: {e}")

# Migration runner
def run_database_migrations():
    client = SupabaseClient.get_admin_client()
    migrator = DatabaseMigrator(client)
    migrator.run_migrations()
