"""
Physics-Informed Neural Networks (PINN) Solver Module

This module provides PINN-based solvers for various physics problems including
Navier-Stokes equations, heat transfer, and structural mechanics.
"""

from .core_model import PINNModel, ResidualPINN, FourierFeatureNetwork, ModelFactory
from .physics_loss import PhysicsInformedLoss, AdaptiveLossWeights
from .navier_stokes_pinn import NavierStokesSolver
from .heat_transfer_pinn import HeatTransferSolver
from .training_manager import TrainingManager
from .prediction_service import PinnPredictionService

__all__ = [
    "PINNModel",
    "ResidualPINN", 
    "FourierFeatureNetwork",
    "ModelFactory",
    "PhysicsInformedLoss",
    "AdaptiveLossWeights",
    "NavierStokesSolver",
    "HeatTransferSolver",
    "TrainingManager",
    "PinnPredictionService"
]
