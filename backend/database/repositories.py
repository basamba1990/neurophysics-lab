from typing import List, Optional, Dict, Any
from supabase import Client
from models.domain_models import User, Organization, Team, PhysicsModel, Simulation, CodeAnalysis, DigitalTwin, UsageMetrics
from models.pydantic_models import PhysicsModelCreate, SimulationCreate, DigitalTwinCreate, UserCreate
from core.exceptions import ResourceNotFoundError, AuthenticationError
from utils.logger import database_logger

class BaseRepository:
    def __init__(self, client: Client, table_name: str):
        self.client = client
        self.table_name = table_name

class UserRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "profiles")
    
    async def get_by_id(self, user_id: str) -> Optional[User]:
        response = self.client.table(self.table_name).select("*").eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        return None
    
    async def get_by_email(self, email: str) -> Optional[User]:
        response = self.client.table(self.table_name).select("*").eq("email", email).execute()
        if response.data:
            return User(**response.data[0])
        return None
    
    async def create(self, user_data: UserCreate, user_id: str) -> User:
        data = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": "engineer",
            "expertise_area": user_data.expertise_area or {}
        }
        
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            database_logger.info(f"User created: {user_data.email}")
            return User(**response.data[0])
        raise AuthenticationError("Failed to create user profile")
    
    async def update(self, user_id: str, update_data: Dict[str, Any]) -> User:
        response = self.client.table(self.table_name).update(update_data).eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        raise ResourceNotFoundError("User not found")

class OrganizationRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "organizations")
    
    async def create(self, org_data: Dict[str, Any]) -> Organization:
        response = self.client.table(self.table_name).insert(org_data).execute()
        if response.data:
            return Organization(**response.data[0])
        raise ResourceNotFoundError("Failed to create organization")
    
    async def get_by_id(self, org_id: str) -> Optional[Organization]:
        response = self.client.table(self.table_name).select("*").eq("id", org_id).execute()
        if response.data:
            return Organization(**response.data[0])
        return None

class PhysicsModelRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "physics_models")
    
    async def create(self, model_data: PhysicsModelCreate, team_id: str) -> PhysicsModel:
        data = {
            **model_data.dict(),
            "team_id": team_id
        }
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            database_logger.info(f"Physics model created: {model_data.name}")
            return PhysicsModel(**response.data[0])
        raise ResourceNotFoundError("Failed to create physics model")
    
    async def get_by_id(self, model_id: str) -> Optional[PhysicsModel]:
        response = self.client.table(self.table_name).select("*").eq("id", model_id).execute()
        if response.data:
            return PhysicsModel(**response.data[0])
        return None
    
    async def get_by_team(self, team_id: str) -> List[PhysicsModel]:
        response = self.client.table(self.table_name).select("*").eq("team_id", team_id).execute()
        return [PhysicsModel(**item) for item in response.data]

class SimulationRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "simulations")
    
    async def create(self, simulation_data: SimulationCreate, team_id: str) -> Simulation:
        data = {
            **simulation_data.dict(),
            "team_id": team_id,
            "status": "pending"
        }
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            database_logger.info(f"Simulation created: {simulation_data.name}")
            return Simulation(**response.data[0])
        raise ResourceNotFoundError("Failed to create simulation")
    
    async def get_by_id(self, simulation_id: str) -> Optional[Simulation]:
        response = self.client.table(self.table_name).select("*").eq("id", simulation_id).execute()
        if response.data:
            return Simulation(**response.data[0])
        return None
    
    async def get_by_team(self, team_id: str) -> List[Simulation]:
        response = self.client.table(self.table_name).select("*").eq("team_id", team_id).order("created_at", desc=True).execute()
        return [Simulation(**item) for item in response.data]
    
    async def update_status(self, simulation_id: str, status: str, results: Dict[str, Any] = None):
        update_data = {"status": status}
        if results:
            update_data.update(results)
        
        response = self.client.table(self.table_name).update(update_data).eq("id", simulation_id).execute()
        if not response.data:
            raise ResourceNotFoundError(f"Simulation {simulation_id} not found")

class CodeAnalysisRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "code_analysis")
    
    async def save_analysis(self, session_id: str, analysis_data: Dict[str, Any]) -> CodeAnalysis:
        data = {
            "session_id": session_id,
            **analysis_data
        }
        response = self.client.table(self.table_name).insert(data).execute()
        
        if response.data:
            return CodeAnalysis(**response.data[0])
        raise ResourceNotFoundError("Failed to save code analysis")

class DigitalTwinRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "digital_twins")
    
    async def create(self, twin_data: DigitalTwinCreate, team_id: str) -> DigitalTwin:
        data = {
            **twin_data.dict(),
            "team_id": team_id,
            "surrogate_model_config": {},
            "current_performance_metrics": {}
        }
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            database_logger.info(f"Digital twin created: {twin_data.name}")
            return DigitalTwin(**response.data[0])
        raise ResourceNotFoundError("Failed to create digital twin")
    
    async def get_by_team(self, team_id: str) -> List[DigitalTwin]:
        response = self.client.table(self.table_name).select("*").eq("team_id", team_id).execute()
        return [DigitalTwin(**item) for item in response.data]

class UsageMetricsRepository(BaseRepository):
    def __init__(self, client: Client):
        super().__init__(client, "usage_metrics")
    
    async def record_usage(self, org_id: str, metrics: Dict[str, Any]) -> UsageMetrics:
        data = {
            "org_id": org_id,
            **metrics
        }
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            return UsageMetrics(**response.data[0])
        raise ResourceNotFoundError("Failed to record usage metrics")

# Repository Factory
class RepositoryFactory:
    def __init__(self, client: Client):
        self.client = client
    
    @property
    def users(self) -> UserRepository:
        return UserRepository(self.client)
    
    @property
    def organizations(self) -> OrganizationRepository:
        return OrganizationRepository(self.client)
    
    @property
    def physics_models(self) -> PhysicsModelRepository:
        return PhysicsModelRepository(self.client)
    
    @property
    def simulations(self) -> SimulationRepository:
        return SimulationRepository(self.client)
    
    @property
    def code_analysis(self) -> CodeAnalysisRepository:
        return CodeAnalysisRepository(self.client)
    
    @property
    def digital_twins(self) -> DigitalTwinRepository:
        return DigitalTwinRepository(self.client)
    
    @property
    def usage_metrics(self) -> UsageMetricsRepository:
        return UsageMetricsRepository(self.client)
