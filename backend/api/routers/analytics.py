# backend/api/routers/analytics.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from models.pydantic_models import UsageMetricsResponse, PerformanceAnalyticsResponse
from core.security import get_current_active_user
# Importation simulée du service d'analyse
# from backend.services.analytics.pinn_performance_dashboard import AnalyticsService 

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
    # Dépendance simulée pour l'utilisateur
    # dependencies=[Depends(get_current_active_user)], 
    responses={404: {"description": "Not found"}},
)

# Initialisation du service d'analyse (simulé)
# analytics_service = AnalyticsService()

# Simulation de l'utilisateur et des données pour éviter les dépendances non résolues
class MockUser:
    def __init__(self, organization_id="org_a"):
        self.organization_id = organization_id

def get_mock_user():
    return MockUser()

@router.get("/usage", response_model=UsageMetricsResponse)
async def get_usage_metrics(current_user: Any = Depends(get_mock_user)):
    """
    Récupère les métriques d'utilisation pour l'organisation de l'utilisateur.
    """
    # Remplacement par des données simulées
    return UsageMetricsResponse(
        pinn_simulations_this_month=15,
        copilot_requests_this_month=45,
        storage_used_mb=125.5,
        subscription_usage={
            "used": 15,
            "total": 100,
            "percentage": 15
        }
    )

@router.get("/performance", response_model=PerformanceAnalyticsResponse)
async def get_performance_analytics(current_user: Any = Depends(get_mock_user)):
    """
    Récupère les analyses de performance des simulations PINN.
    """
    # Remplacement par des données simulées
    return PerformanceAnalyticsResponse(
        average_simulation_time=45.2,
        success_rate=0.92,
        most_used_physics_models=["navier_stokes", "heat_transfer", "structural"],
        resource_utilization={
            "cpu_percent": 65.5,
            "memory_percent": 72.3,
            "gpu_utilization": 45.8
        }
    )

@router.get("/simulation-history/{simulation_id}")
async def get_simulation_history(simulation_id: str, current_user: Any = Depends(get_mock_user)):
    """
    Récupère l'historique détaillé d'une simulation spécifique.
    """
    # Remplacement par des données simulées
    if simulation_id == "sim_001":
        return {
            "simulation_id": simulation_id,
            "status": "COMPLETED",
            "history": [
                {"timestamp": "2025-11-26T10:00:00Z", "event": "Simulation started"},
                {"timestamp": "2025-11-26T10:30:00Z", "event": "Loss reduced to 1e-3"},
                {"timestamp": "2025-11-26T11:00:00Z", "event": "Simulation COMPLETED"}
            ]
        }
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Historique de simulation non trouvé.")
