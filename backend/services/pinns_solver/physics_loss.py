import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, Tuple, List
import warnings

class PhysicsInformedLoss:
    """Physics-informed loss function manager"""
    
    def __init__(self, physics_type: str, params: Dict[str, Any]):
        self.physics_type = physics_type
        self.params = params
        self.loss_functions = self._setup_loss_functions()
    
    def _setup_loss_functions(self) -> Dict[str, callable]:
        """Setup loss functions based on physics type"""
        
        if self.physics_type == "navier_stokes":
            return {
                "pde_loss": self._navier_stokes_loss,
                "bc_loss": self._boundary_conditions_loss,
                "ic_loss": self._initial_conditions_loss
            }
        elif self.physics_type == "heat_transfer":
            return {
                "pde_loss": self._heat_transfer_loss,
                "bc_loss": self._boundary_conditions_loss,
                "ic_loss": self._initial_conditions_loss
            }
        else:
            warnings.warn(f"Unknown physics type {self.physics_type}")
            return {}
    
    def compute_total_loss(self, model: nn.Module, inputs: torch.Tensor, 
                         outputs: torch.Tensor, targets: torch.Tensor = None) -> Dict[str, torch.Tensor]:
        """Compute total physics-informed loss"""
        
        losses = {}
        total_loss = torch.tensor(0.0, device=inputs.device)
        
        # PDE loss
        if "pde_loss" in self.loss_functions:
            pde_loss = self.loss_functions["pde_loss"](model, inputs, outputs)
            losses["pde_loss"] = pde_loss
            total_loss += pde_loss
        
        # Boundary conditions loss
        if "bc_loss" in self.loss_functions:
            bc_loss = self.loss_functions["bc_loss"](model, inputs, outputs)
            losses["bc_loss"] = bc_loss
            total_loss += bc_loss
        
        # Initial conditions loss
        if "ic_loss" in self.loss_functions:
            ic_loss = self.loss_functions["ic_loss"](model, inputs, outputs)
            losses["ic_loss"] = ic_loss
            total_loss += ic_loss
        
        # Data loss (if targets provided)
        if targets is not None:
            data_loss = nn.functional.mse_loss(outputs, targets)
            losses["data_loss"] = data_loss
            total_loss += data_loss
        
        losses["total_loss"] = total_loss
        return losses
    
    def _navier_stokes_loss(self, model: nn.Module, inputs: torch.Tensor, 
                          outputs: torch.Tensor) -> torch.Tensor:
        """Navier-Stokes equations loss"""
        
        # Requires gradients for PDE computation
        inputs.requires_grad_(True)
        
        # Split outputs (assuming u, v, p format)
        u, v, p = torch.split(outputs, 1, dim=1)
        
        # Compute gradients
        u_grad = torch.autograd.grad(u, inputs, grad_outputs=torch.ones_like(u), 
                                   create_graph=True)[0]
        v_grad = torch.autograd.grad(v, inputs, grad_outputs=torch.ones_like(v), 
                                   create_graph=True)[0]
        
        u_x, u_y = u_grad[:, 0:1], u_grad[:, 1:2]
        v_x, v_y = v_grad[:, 0:1], v_grad[:, 1:2]
        
        # Second derivatives
        u_xx = torch.autograd.grad(u_x, inputs, grad_outputs=torch.ones_like(u_x), 
                                 create_graph=True)[0][:, 0:1]
        u_yy = torch.autograd.grad(u_y, inputs, grad_outputs=torch.ones_like(u_y), 
                                 create_graph=True)[0][:, 1:2]
        v_xx = torch.autograd.grad(v_x, inputs, grad_outputs=torch.ones_like(v_x), 
                                 create_graph=True)[0][:, 0:1]
        v_yy = torch.autograd.grad(v_y, inputs, grad_outputs=torch.ones_like(v_y), 
                                 create_graph=True)[0][:, 1:2]
        
        # Pressure gradients
        p_grad = torch.autograd.grad(p, inputs, grad_outputs=torch.ones_like(p), 
                                   create_graph=True)[0]
        p_x, p_y = p_grad[:, 0:1], p_grad[:, 1:2]
        
        # Navier-Stokes equations
        Re = self.params.get('reynolds', 1000.0)
        
        # Continuity equation
        continuity_eq = u_x + v_y
        
        # Momentum equations
        momentum_x = u * u_x + v * u_y + p_x - (1/Re) * (u_xx + u_yy)
        momentum_y = u * v_x + v * v_y + p_y - (1/Re) * (v_xx + v_yy)
        
        # PDE loss
        pde_loss = torch.mean(continuity_eq**2) + \
                  torch.mean(momentum_x**2) + \
                  torch.mean(momentum_y**2)
        
        return pde_loss
    
    def _heat_transfer_loss(self, model: nn.Module, inputs: torch.Tensor, 
                          outputs: torch.Tensor) -> torch.Tensor:
        """Heat transfer equation loss"""
        
        inputs.requires_grad_(True)
        
        T = outputs  # Temperature field
        
        # Compute gradients
        T_grad = torch.autograd.grad(T, inputs, grad_outputs=torch.ones_like(T), 
                                   create_graph=True)[0]
        T_x, T_y = T_grad[:, 0:1], T_grad[:, 1:2]
        
        # Second derivatives
        T_xx = torch.autograd.grad(T_x, inputs, grad_outputs=torch.ones_like(T_x), 
                                 create_graph=True)[0][:, 0:1]
        T_yy = torch.autograd.grad(T_y, inputs, grad_outputs=torch.ones_like(T_y), 
                                 create_graph=True)[0][:, 1:2]
        
        # Heat equation parameters
        alpha = self.params.get('thermal_diffusivity', 1.0)
        
        # Heat equation
        heat_eq = T_x + T_y - alpha * (T_xx + T_yy)
        
        # PDE loss
        pde_loss = torch.mean(heat_eq**2)
        
        return pde_loss
    
    def _boundary_conditions_loss(self, model: nn.Module, inputs: torch.Tensor, 
                                outputs: torch.Tensor) -> torch.Tensor:
        """Boundary conditions loss"""
        
        bc_config = self.params.get('boundary_conditions', {})
        bc_loss = torch.tensor(0.0, device=inputs.device)
        
        for bc_name, bc_data in bc_config.items():
            bc_type = bc_data.get('type')
            bc_value = bc_data.get('value', 0.0)
            
            # This is a simplified implementation
            # In practice, you'd need to identify boundary points
            if bc_type == 'dirichlet':
                # Apply Dirichlet condition
                target = torch.ones_like(outputs) * bc_value
                bc_loss += nn.functional.mse_loss(outputs, target)
            
            elif bc_type == 'neumann':
                # Neumann conditions would require gradient computation
                pass
        
        return bc_loss
    
    def _initial_conditions_loss(self, model: nn.Module, inputs: torch.Tensor, 
                               outputs: torch.Tensor) -> torch.Tensor:
        """Initial conditions loss"""
        
        ic_config = self.params.get('initial_conditions', {})
        ic_loss = torch.tensor(0.0, device=inputs.device)
        
        # Simplified implementation
        if ic_config:
            # Apply initial conditions
            target = torch.ones_like(outputs) * ic_config.get('value', 0.0)
            ic_loss = nn.functional.mse_loss(outputs, target)
        
        return ic_loss

class AdaptiveLossWeights:
    """Adaptive loss weighting for multi-term physics losses"""
    
    def __init__(self, num_terms: int, initial_weights: List[float] = None):
        self.num_terms = num_terms
        self.weights = torch.tensor(initial_weights if initial_weights else [1.0] * num_terms)
        self.loss_history = []
    
    def update_weights(self, losses: List[torch.Tensor], method: str = 'gradient_norm'):
        """Update loss weights based on specified method"""
        
        if method == 'gradient_norm':
            self._update_by_gradient_norm(losses)
        elif method == 'loss_magnitude':
            self._update_by_loss_magnitude(losses)
        elif method == 'moving_average':
            self._update_by_moving_average(losses)
    
    def _update_by_gradient_norm(self, losses: List[torch.Tensor]):
        """Update weights based on gradient norms"""
        # Implementation for gradient-based weighting
        pass
    
    def _update_by_loss_magnitude(self, losses: List[torch.Tensor]):
        """Update weights based on loss magnitudes"""
        loss_tensor = torch.tensor([loss.item() for loss in losses])
        normalized_weights = loss_tensor / torch.sum(loss_tensor)
        self.weights = 1.0 / (normalized_weights + 1e-8)
    
    def _update_by_moving_average(self, losses: List[torch.Tensor]):
        """Update weights using moving average of losses"""
        self.loss_history.append([loss.item() for loss in losses])
        
        if len(self.loss_history) > 10:
            self.loss_history = self.loss_history[-10:]
        
        # Compute moving averages
        moving_averages = np.mean(self.loss_history, axis=0)
        self.weights = torch.tensor(1.0 / (moving_averages + 1e-8))
