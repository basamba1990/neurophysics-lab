# backend/models/pydantic_models.py

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PhysicsType(str, Enum):
    NAVIER_STOKES = "navier_stokes"
    HEAT_TRANSFER = "heat_transfer"
    STRUCTURAL = "structural"
    TURBULENCE = "turbulence"
    MULTIPHYSICS = "multiphysics"

class SimulationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class UserRole(str, Enum):
    ADMIN = "admin"
    LEAD = "lead"
    ENGINEER = "engineer"
    VIEWER = "viewer"

# Physics Models
class PhysicsModelCreate(BaseModel):
    name: str = Field(..., description="Physics model name")
    physics_type: PhysicsType
    equations: Dict[str, Any]
    boundary_conditions: Dict[str, Any]
    mesh_config: Optional[Dict[str, Any]] = None

class PhysicsModelResponse(BaseModel):
    id: str
    name: str
    physics_type: PhysicsType
    equations: Dict[str, Any]
    boundary_conditions: Dict[str, Any]
    mesh_config: Optional[Dict[str, Any]] = None
    created_at: datetime

class SimulationCreate(BaseModel):
    physics_model_id: str
    name: str
    input_parameters: Dict[str, Any]
    geometry_data: Optional[Dict[str, Any]] = None

class SimulationResponse(BaseModel):
    id: str
    name: str
    status: SimulationStatus
    input_parameters: Dict[str, Any]
    pinn_predictions: Optional[Dict[str, Any]] = None
    convergence_metrics: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime]

# Scientific Copilot Models
class CodeAnalysisRequest(BaseModel):
    code: str = Field(..., description="Source code to analyze")
    language: str = Field(..., description="Programming language")
    context: Optional[Dict[str, Any]] = Field(None, description="Physics context")
    analysis_type: str = Field("modernization", description="Analysis type")

class CodeSuggestion(BaseModel):
    original_code: str
    suggested_code: str
    explanation: str
    confidence_score: float
    boundary_conditions_check: Optional[Dict[str, Any]] = None

class CodeAnalysisResponse(BaseModel):
    suggestions: List[CodeSuggestion]
    warnings: List[str]
    performance_metrics: Optional[Dict[str, Any]] = None

# Digital Twins Models
class DigitalTwinCreate(BaseModel):
    name: str
    system_type: str
    optimization_objectives: Dict[str, str]
    constraints: Dict[str, Any]
    parameters_space: Dict[str, Any]

class DigitalTwinResponse(BaseModel):
    id: str
    name: str
    system_type: str
    optimization_objectives: Dict[str, str]
    constraints: Dict[str, Any]
    parameters_space: Dict[str, Any]
    created_at: datetime

class OptimizationRequest(BaseModel):
    digital_twin_id: str
    parameters: Dict[str, Any]
    objectives: List[str]

# Authentication and Organization Models
class UserCreate(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=8)
    full_name: str
    expertise_area: Optional[Dict[str, str]] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    expertise_area: Optional[Dict[str, str]] = None
    created_at: datetime

class OrganizationCreate(BaseModel):
    name: str
    subscription_tier: str = "freemium"

class OrganizationResponse(BaseModel):
    id: str
    name: str
    subscription_tier: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Analytics Models
class UsageMetricsResponse(BaseModel):
    pinn_simulations_this_month: int
    copilot_requests_this_month: int
    storage_used_mb: float
    subscription_usage: Dict[str, Any]

class PerformanceAnalyticsResponse(BaseModel):
    average_simulation_time: float
    success_rate: float
    most_used_physics_models: List[str]
    resource_utilization: Dict[str, float]

# Ajout des modèles pour l'optimisation
class OptimizationParameter(BaseModel):
    """Définit un paramètre à optimiser."""
    name: str
    initial_value: float
    bounds: List[float] = Field(..., min_items=2, max_items=2, description="Bornes [min, max].")
    unit: Optional[str] = None

class OptimizationObjective(BaseModel):
    """Définit un objectif d'optimisation."""
    name: str
    target: str = Field(..., description="'minimize' ou 'maximize'.")
    weight: float = 1.0
    # L'expression réelle de l'objectif serait gérée en interne

class OptimizationConstraint(BaseModel):
    """Définit une contrainte d'optimisation."""
    name: str
    type: str = Field(..., description="'inequality' (<=) ou 'equality' (=).")
    expression: str = Field(..., description="Expression mathématique de la contrainte.")
    bound: float

class OptimizationRequest(BaseModel):
    """Modèle pour une nouvelle requête d'optimisation."""
    simulation_id: str = Field(..., description="ID de la simulation de base pour l'optimisation.")
    method: str = Field(..., description="Méthode d'optimisation (e.g., 'SLSQP', 'Bayesian').")
    parameters_to_optimize: List[OptimizationParameter]
    objectives: List[OptimizationObjective]
    constraints: List[OptimizationConstraint]
    config: Dict[str, Any] = Field(..., description="Configuration spécifique à la méthode (e.g., max_iterations).")

class OptimizationResult(BaseModel):
    """Modèle pour les résultats d'optimisation."""
    optimization_id: str
    status: str
    optimal_parameters: Dict[str, float]
    optimal_objective_value: float
    report: Dict[str, Any]
