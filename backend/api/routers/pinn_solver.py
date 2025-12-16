from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import List
import asyncio

from api.dependencies import CurrentUser, RepoFactory
from models.pydantic_models import (
    PhysicsModelCreate, PhysicsModelResponse, 
    SimulationCreate, SimulationResponse
)
from services.pinns_solver.prediction_service import PinnPredictionService
from services.pinns_solver.training_manager import TrainingManager
from utils.validators import PhysicsValidator
from core.exceptions import PhysicsValidationError, SimulationError

router = APIRouter()

@router.post("/physics-models", response_model=PhysicsModelResponse)
async def create_physics_model(
    model_data: PhysicsModelCreate,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    # Validate physics parameters
    if model_data.physics_type == "navier_stokes":
        PhysicsValidator.validate_navier_stokes_params(model_data.equations)
    elif model_data.physics_type == "heat_transfer":
        PhysicsValidator.validate_heat_transfer_params(model_data.equations)
    
    PhysicsValidator.validate_boundary_conditions(model_data.boundary_conditions)
    
    if model_data.mesh_config:
        PhysicsValidator.validate_mesh_config(model_data.mesh_config)
    
    # Create model in database
    # Note: In a real implementation, you'd get the user's team_id
    team_id = "team_123"  # This would come from current_user
    
    physics_model = await repo_factory.physics_models.create(
        model_data, 
        team_id
    )
    
    return PhysicsModelResponse(**physics_model.__dict__)

@router.get("/physics-models", response_model=List[PhysicsModelResponse])
async def get_physics_models(
    current_user: CurrentUser, 
    repo_factory: RepoFactory
):
    team_id = "team_123"  # From current_user
    models = await repo_factory.physics_models.get_by_team(team_id)
    return [PhysicsModelResponse(**model.__dict__) for model in models]

@router.post("/simulations", response_model=SimulationResponse)
async def create_simulation(
    simulation_data: SimulationCreate,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    try:
        # Verify physics model exists
        physics_model = await repo_factory.physics_models.get_by_id(
            simulation_data.physics_model_id
        )
        if not physics_model:
            raise PhysicsValidationError("Physics model not found")
        
        # Create simulation in database
        team_id = "team_123"  # From current_user
        simulation = await repo_factory.simulations.create(
            simulation_data, 
            team_id
        )
        
        # Launch simulation in background
        background_tasks.add_task(
            run_pinn_simulation,
            simulation.id,
            simulation_data,
            repo_factory
        )
        
        return SimulationResponse(**simulation.__dict__)
        
    except Exception as e:
        raise SimulationError(f"Failed to create simulation: {str(e)}")

@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: str, 
    repo_factory: RepoFactory
):
    simulation = await repo_factory.simulations.get_by_id(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return SimulationResponse(**simulation.__dict__)

@router.get("/simulations", response_model=List[SimulationResponse])
async def get_simulations(
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    team_id = "team_123"  # From current_user
    simulations = await repo_factory.simulations.get_by_team(team_id)
    return [SimulationResponse(**sim.__dict__) for sim in simulations]

async def run_pinn_simulation(
    simulation_id: str, 
    simulation_data: SimulationCreate, 
    repo_factory: RepoFactory
):
    """Run PINN simulation in background"""
    try:
        # Update status to running
        await repo_factory.simulations.update_status(simulation_id, "running")
        
        # Initialize PINN service
        pinn_service = PinnPredictionService()
        
        # Run simulation
        results = await pinn_service.run_simulation(simulation_data)
        
        # Save results
        await repo_factory.simulations.update_status(
            simulation_id, 
            "completed", 
            results
        )
        
    except Exception as e:
        # Update status to failed
        await repo_factory.simulations.update_status(simulation_id, "failed")
        
        # Log error
        print(f"Simulation {simulation_id} failed: {e}")
