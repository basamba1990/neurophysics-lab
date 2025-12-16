import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, Tuple, List
import time

from .core_model import ModelFactory
from .physics_loss import PhysicsInformedLoss
from utils.logger import pinn_logger
from utils.performance import PerformanceMonitor, performance_context

class HeatTransferSolver:
    """PINN solver for heat transfer equations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = self._build_model()
        self.optimizer = self._build_optimizer()
        self.loss_fn = PhysicsInformedLoss("heat_transfer", config)
        self.performance_monitor = PerformanceMonitor()
        
        self.loss_history = []
        self.convergence_metrics = {}
        
        pinn_logger.info(f"HeatTransferSolver initialized with config: {config}")
    
    def _build_model(self) -> nn.Module:
        """Build the PINN model for heat transfer"""
        model_config = {
            'input_dim': 2,  # x, y coordinates
            'output_dim': 1,  # Temperature
            'hidden_layers': self.config.get('hidden_layers', [64, 64, 64]),
            'activation': self.config.get('activation', 'tanh'),
            'model_type': self.config.get('model_type', 'standard')
        }
        
        return ModelFactory.create_model(model_config['model_type'], model_config)
    
    def _build_optimizer(self) -> torch.optim.Optimizer:
        """Build the optimizer"""
        optimizer_type = self.config.get('optimizer', 'adam')
        learning_rate = self.config.get('learning_rate', 0.001)
        
        if optimizer_type == 'adam':
            return torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        elif optimizer_type == 'lbfgs':
            return torch.optim.LBFGS(self.model.parameters(), lr=learning_rate)
        else:
            return torch.optim.Adam(self.model.parameters(), lr=learning_rate)
    
    def train(self, training_data: Dict[str, np.ndarray], 
              epochs: int = None) -> Dict[str, Any]:
        """Train the heat transfer PINN"""
        
        epochs = epochs or self.config.get('epochs', 1000)
        device = self.config.get('device', 'cpu')
        
        # Move model to device
        self.model.to(device)
        
        # Prepare training data
        collocation_points = torch.tensor(
            training_data['collocation_points'], 
            dtype=torch.float32, device=device
        )
        
        # Training loop
        start_time = time.time()
        
        with performance_context(self.performance_monitor, "heat_transfer_training"):
            for epoch in range(epochs):
                epoch_loss = self._train_epoch(collocation_points)
                self.loss_history.append(epoch_loss)
                
                # Log progress
                if epoch % 100 == 0:
                    pinn_logger.info(f"Epoch {epoch}, Loss: {epoch_loss:.6f}")
                
                # Check convergence
                if self._check_convergence():
                    pinn_logger.info(f"Convergence reached at epoch {epoch}")
                    break
        
        training_time = time.time() - start_time
        
        # Compute final metrics
        self.convergence_metrics = self._compute_convergence_metrics()
        
        pinn_logger.info(f"Heat transfer training completed in {training_time:.2f}s")
        
        return {
            "training_time": training_time,
            "final_loss": self.loss_history[-1] if self.loss_history else None,
            "total_epochs": len(self.loss_history),
            "convergence_metrics": self.convergence_metrics
        }
    
    def _train_epoch(self, collocation_points: torch.Tensor) -> float:
        """Train for one epoch"""
        
        def closure():
            self.optimizer.zero_grad()
            outputs = self.model(collocation_points)
            losses = self.loss_fn.compute_total_loss(self.model, collocation_points, outputs)
            total_loss = losses["total_loss"]
            total_loss.backward()
            return total_loss
        
        if isinstance(self.optimizer, torch.optim.LBFGS):
            total_loss = self.optimizer.step(closure)
        else:
            total_loss = closure()
            self.optimizer.step()
        
        return total_loss.item() if isinstance(total_loss, torch.Tensor) else total_loss
    
    def predict(self, points: np.ndarray) -> Dict[str, np.ndarray]:
        """Predict temperature field for given points"""
        
        device = self.config.get('device', 'cpu')
        points_tensor = torch.tensor(points, dtype=torch.float32, device=device)
        
        with torch.no_grad():
            predictions = self.model(points_tensor)
        
        # Convert to numpy
        temperature = predictions.cpu().numpy()
        
        return {
            'temperature': temperature.flatten(),
            'heat_flux': self._compute_heat_flux(points_tensor).cpu().numpy().flatten()
        }
    
    def _compute_heat_flux(self, points: torch.Tensor) -> torch.Tensor:
        """Compute heat flux from temperature field"""
        points.requires_grad_(True)
        temperature = self.model(points)
        
        # Compute temperature gradient
        grad_T = torch.autograd.grad(
            temperature, points, 
            grad_outputs=torch.ones_like(temperature),
            create_graph=True
        )[0]
        
        # Fourier's law: q = -k * grad(T)
        thermal_conductivity = self.config.get('thermal_conductivity', 1.0)
        heat_flux = -thermal_conductivity * torch.norm(grad_T, dim=1, keepdim=True)
        
        return heat_flux
    
    def _check_convergence(self, window: int = 50, threshold: float = 1e-6) -> bool:
        """Check if training has converged"""
        
        if len(self.loss_history) < window:
            return False
        
        recent_losses = self.loss_history[-window:]
        improvements = [abs(recent_losses[i-1] - recent_losses[i]) 
                       for i in range(1, len(recent_losses))]
        
        avg_improvement = np.mean(improvements)
        return avg_improvement < threshold
    
    def _compute_convergence_metrics(self) -> Dict[str, Any]:
        """Compute convergence metrics"""
        
        if not self.loss_history:
            return {}
        
        initial_loss = self.loss_history[0]
        final_loss = self.loss_history[-1]
        
        return {
            "initial_loss": initial_loss,
            "final_loss": final_loss,
            "improvement_ratio": initial_loss / final_loss if final_loss > 0 else float('inf'),
            "convergence_rate": self._compute_convergence_rate(),
            "loss_history": self.loss_history
        }
    
    def _compute_convergence_rate(self) -> float:
        """Compute the convergence rate"""
        
        if len(self.loss_history) < 2:
            return 0.0
        
        # Linear regression on log loss
        x = np.arange(len(self.loss_history))
        y = np.log(np.array(self.loss_history) + 1e-8)
        
        # Remove outliers
        y_clean = y[~np.isnan(y) & ~np.isinf(y)]
        x_clean = x[:len(y_clean)]
        
        if len(y_clean) < 2:
            return 0.0
        
        # Linear fit
        slope, _ = np.polyfit(x_clean, y_clean, 1)
        return -slope
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'config': self.config,
            'loss_history': self.loss_history,
            'convergence_metrics': self.convergence_metrics
        }, filepath)
        
        pinn_logger.info(f"Heat transfer model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        
        checkpoint = torch.load(filepath)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.config = checkpoint['config']
        self.loss_history = checkpoint['loss_history']
        self.convergence_metrics = checkpoint['convergence_metrics']
        
        pinn_logger.info(f"Heat transfer model loaded from {filepath}")
