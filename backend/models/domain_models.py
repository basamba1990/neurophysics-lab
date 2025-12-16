from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

@dataclass
class User:
    id: str
    email: str
    full_name: str
    role: str
    expertise_area: Dict[str, str]
    team_id: Optional[str]
    created_at: datetime
    updated_at: datetime

@dataclass
class Organization:
    id: str
    name: str
    subscription_tier: str
    created_at: datetime
    updated_at: datetime

@dataclass
class Team:
    id: str
    org_id: str
    name: str
    specialization: Optional[str]
    created_at: datetime

@dataclass
class PhysicsModel:
    id: str
    team_id: str
    name: str
    physics_type: str
    equations: Dict[str, Any]
    boundary_conditions: Dict[str, Any]
    mesh_config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@dataclass
class Simulation:
    id: str
    team_id: str
    physics_model_id: str
    name: str
    status: str
    input_parameters: Dict[str, Any]
    geometry_data: Optional[Dict[str, Any]]
    pinn_predictions: Optional[Dict[str, Any]]
    convergence_metrics: Optional[Dict[str, Any]]
    accuracy_metrics: Optional[Dict[str, Any]]
    execution_time: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]

@dataclass
class CodeAnalysis:
    id: str
    session_id: str
    original_code: str
    analysis_type: str
    suggested_code: str
    explanation: str
    confidence_score: float
    boundary_conditions_check: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    created_at: datetime

@dataclass
class DigitalTwin:
    id: str
    team_id: str
    name: str
    system_type: str
    optimization_objectives: Dict[str, str]
    constraints: Dict[str, Any]
    parameters_space: Dict[str, Any]
    surrogate_model_config: Dict[str, Any]
    current_performance_metrics: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@dataclass
class UsageMetrics:
    id: str
    org_id: str
    month_year: datetime
    pinn_runs_count: int
    copilot_requests_count: int
    storage_mb: float
    created_at: datetime
