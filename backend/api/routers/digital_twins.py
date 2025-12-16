from fastapi import APIRouter, Depends
from typing import List, Dict, Any

from api.dependencies import CurrentUser, RepoFactory
from models.pydantic_models import DigitalTwinCreate, DigitalTwinResponse, OptimizationRequest

router = APIRouter()

@router.post("/digital-twins", response_model=DigitalTwinResponse)
async def create_digital_twin(
    twin_data: DigitalTwinCreate,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    team_id = "team_123"  # From current_user
    
    digital_twin = await repo_factory.digital_twins.create(
        twin_data, 
        team_id
    )
    
    return DigitalTwinResponse(**digital_twin.__dict__)

@router.get("/digital-twins", response_model=List[DigitalTwinResponse])
async def get_digital_twins(
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    team_id = "team_123"  # From current_user
    twins = await repo_factory.digital_twins.get_by_team(team_id)
    return [DigitalTwinResponse(**twin.__dict__) for twin in twins]

@router.post("/optimize")
async def run_optimization(
    request: OptimizationRequest,
    current_user: CurrentUser
):
    from services.optimization_engine.optimization_solver import OptimizationSolver
    
    try:
        solver = OptimizationSolver()
        result = await solver.optimize_system(request)
        
        return result
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@router.get("/digital-twins/{twin_id}/performance")
async def get_twin_performance(twin_id: str, current_user: CurrentUser):
    from services.optimization_engine.performance_monitor import PerformanceMonitor
    
    try:
        monitor = PerformanceMonitor()
        metrics = await monitor.get_performance_metrics(twin_id)
        
        return metrics
    except Exception as e:
        return {
            "error": f"Failed to get performance metrics: {str(e)}"
        }

@router.get("/optimization-methods")
async def get_optimization_methods():
    return {
        "methods": [
            {
                "name": "Genetic Algorithm",
                "type": "global",
                "suitable_for": "Multi-objective, non-convex problems"
            },
            {
                "name": "Gradient Descent", 
                "type": "local",
                "suitable_for": "Convex problems with smooth gradients"
            },
            {
                "name": "Bayesian Optimization",
                "type": "global", 
                "suitable_for": "Expensive black-box functions"
            },
            {
                "name": "Particle Swarm",
                "type": "global",
                "suitable_for": "Non-smooth, multi-modal problems"
            }
        ]
    }
