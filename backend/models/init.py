"""
Models Module

This module provides data models for the R&D Accelerator Platform including
Pydantic models for API serialization and domain models for business logic.
"""

from .pydantic_models import (
    PhysicsModelCreate,
    PhysicsModelResponse,
    SimulationCreate, 
    SimulationResponse,
    CodeAnalysisRequest,
    CodeAnalysisResponse,
    CodeSuggestion,
    DigitalTwinCreate,
    DigitalTwinResponse,
    OptimizationRequest,
    UserCreate,
    UserResponse,
    OrganizationCreate,
    OrganizationResponse,
    Token,
    UsageMetricsResponse,
    PerformanceAnalyticsResponse,
    PhysicsType,
    SimulationStatus,
    UserRole
)

from .domain_models import (
    User,
    Organization,
    Team,
    PhysicsModel,
    Simulation,
    CodeAnalysis,
    DigitalTwin,
    UsageMetrics
)

__all__ = [
    "PhysicsModelCreate",
    "PhysicsModelResponse",
    "SimulationCreate",
    "SimulationResponse", 
    "CodeAnalysisRequest",
    "CodeAnalysisResponse",
    "CodeSuggestion",
    "DigitalTwinCreate",
    "DigitalTwinResponse",
    "OptimizationRequest",
    "UserCreate",
    "UserResponse",
    "OrganizationCreate",
    "OrganizationResponse",
    "Token",
    "UsageMetricsResponse",
    "PerformanceAnalyticsResponse",
    "PhysicsType",
    "SimulationStatus", 
    "UserRole",
    "User",
    "Organization",
    "Team",
    "PhysicsModel",
    "Simulation",
    "CodeAnalysis",
    "DigitalTwin",
    "UsageMetrics"
]
