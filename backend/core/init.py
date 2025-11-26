"""
Core Module

This module provides core functionality including configuration management,
security utilities, and custom exceptions for the R&D Accelerator Platform.
"""

from .config import get_settings, Settings
from .security import verify_password, get_password_hash, create_access_token, verify_token, validate_api_key
from .exceptions import (
    RDAcceleratorException,
    PhysicsValidationError,
    SimulationError, 
    ModelTrainingError,
    CodeAnalysisError,
    QuotaExceededError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError
)

__all__ = [
    "get_settings",
    "Settings",
    "verify_password",
    "get_password_hash", 
    "create_access_token",
    "verify_token",
    "validate_api_key",
    "RDAcceleratorException",
    "PhysicsValidationError",
    "SimulationError",
    "ModelTrainingError",
    "CodeAnalysisError",
    "QuotaExceededError",
    "AuthenticationError",
    "AuthorizationError",
    "ResourceNotFoundError"
]
