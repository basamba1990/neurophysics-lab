import tensorflow as tf
import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List, Tuple
import warnings

class PINNModel(nn.Module):
    """Base Physics-Informed Neural Network model"""
    
    def __init__(self, layers: List[int], activation: str = 'tanh'):
        super(PINNModel, self).__init__()
        
        self.layers = nn.ModuleList()
        self.activation = self._get_activation(activation)
        
        # Build network layers
        for i in range(len(layers) - 1):
            self.layers.append(nn.Linear(layers[i], layers[i+1]))
            
        # Initialize weights
        self._initialize_weights()
    
    def _get_activation(self, activation: str):
        """Get activation function"""
        activations = {
            'tanh': nn.Tanh(),
            'relu': nn.ReLU(),
            'sigmoid': nn.Sigmoid(),
            'leaky_relu': nn.LeakyReLU(0.1),
            'elu': nn.ELU()
        }
        return activations.get(activation, nn.Tanh())
    
    def _initialize_weights(self):
        """Initialize network weights"""
        for layer in self.layers:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_normal_(layer.weight)
                nn.init.constant_(layer.bias, 0.0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the network"""
        for i, layer in enumerate(self.layers):
            x = layer(x)
            if i < len(self.layers) - 1:  # No activation on output layer
                x = self.activation(x)
        return x

class ResidualPINN(PINNModel):
    """PINN with residual connections for better gradient flow"""
    
    def __init__(self, layers: List[int], activation: str = 'tanh'):
        super().__init__(layers, activation)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with residual connections"""
        for i, layer in enumerate(self.layers):
            residual = x if i > 0 and x.shape[-1] == layer.out_features else 0
            
            x = layer(x)
            if i < len(self.layers) - 1:
                x = self.activation(x + residual)
        return x

class FourierFeatureNetwork(nn.Module):
    """PINN with Fourier feature encoding for better high-frequency representation"""
    
    def __init__(self, layers: List[int], num_features: int = 256, scale: float = 10.0):
        super().__init__()
        
        self.fourier_features = nn.Linear(2, num_features, bias=False)
        # Initialize Fourier features
        nn.init.normal_(self.fourier_features.weight, 0, scale)
        
        # Main network
        network_layers = [num_features * 2] + layers  # *2 for sin and cos
        self.network = PINNModel(network_layers)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Apply Fourier feature mapping
        x_proj = 2 * np.pi * self.fourier_features(x)
        x_encoded = torch.cat([torch.sin(x_proj), torch.cos(x_proj)], dim=-1)
        
        return self.network(x_encoded)

class AdaptiveWeightNetwork(nn.Module):
    """PINN with adaptive loss weighting"""
    
    def __init__(self, base_model: nn.Module, num_loss_terms: int):
        super().__init__()
        self.base_model = base_model
        self.loss_weights = nn.Parameter(torch.ones(num_loss_terms))
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base_model(x)
    
    def get_loss_weights(self) -> torch.Tensor:
        return torch.softmax(self.loss_weights, dim=0)

class ModelFactory:
    """Factory for creating different PINN architectures"""
    
    @staticmethod
    def create_model(model_type: str, config: Dict[str, Any]) -> nn.Module:
        """Create a PINN model based on configuration"""
        
        input_dim = config.get('input_dim', 2)
        output_dim = config.get('output_dim', 1)
        hidden_layers = config.get('hidden_layers', [50, 50, 50])
        
        layers = [input_dim] + hidden_layers + [output_dim]
        
        if model_type == 'standard':
            return PINNModel(layers, config.get('activation', 'tanh'))
        
        elif model_type == 'residual':
            return ResidualPINN(layers, config.get('activation', 'tanh'))
        
        elif model_type == 'fourier':
            return FourierFeatureNetwork(
                hidden_layers + [output_dim],
                num_features=config.get('num_fourier_features', 256),
                scale=config.get('fourier_scale', 10.0)
            )
        
        elif model_type == 'adaptive':
            base_model = PINNModel(layers, config.get('activation', 'tanh'))
            return AdaptiveWeightNetwork(
                base_model, 
                num_loss_terms=config.get('num_loss_terms', 3)
            )
        
        else:
            warnings.warn(f"Unknown model type {model_type}, using standard PINN")
            return PINNModel(layers, config.get('activation', 'tanh'))
