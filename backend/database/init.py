"""
Database Module

This module provides database connectivity, repositories, and migration utilities
for the R&D Accelerator Platform using Supabase.
"""

from .supabase_client import SupabaseClient, supabase
from .repositories import (
    UserRepository,
    OrganizationRepository,
    PhysicsModelRepository, 
    SimulationRepository,
    CodeAnalysisRepository,
    DigitalTwinRepository,
    UsageMetricsRepository,
    RepositoryFactory
)
from .migrations import DatabaseMigrator, run_database_migrations

__all__ = [
    "SupabaseClient",
    "supabase",
    "UserRepository",
    "OrganizationRepository",
    "PhysicsModelRepository",
    "SimulationRepository",
    "CodeAnalysisRepository",
    "DigitalTwinRepository", 
    "UsageMetricsRepository",
    "RepositoryFactory",
    "DatabaseMigrator",
    "run_database_migrations"
]
