"""
API Module

This module provides the FastAPI application and all API routers for the
R&D Accelerator Platform.
"""

from .main import app
from .dependencies import get_current_user, get_current_active_user, get_repository_factory, CurrentUser, RepoFactory
from .routers import auth, organizations, pinn_solver, copilot, digital_twins, analytics

__all__ = [
    "app",
    "get_current_user",
    "get_current_active_user", 
    "get_repository_factory",
    "CurrentUser",
    "RepoFactory",
    "auth",
    "organizations",
    "pinn_solver",
    "copilot",
    "digital_twins",
    "analytics"
]
