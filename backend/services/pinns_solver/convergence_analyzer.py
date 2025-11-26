# /backend/services/pinns_solver/convergence_analyzer.py
import numpy as np
from typing import Dict, List, Any, Tuple
import plotly.graph_objects as go

class PINNConvergenceDebugger:
    """Débogueur spécialisé pour les problèmes de convergence PINN"""
    
    def __init__(self):
        self.analysis_results = {}
    
    def analyze_convergence_issues(self, loss_history: List[float], 
                                 training_config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse les problèmes de convergence intermittents"""
        
        analysis = {
            'hyperparameter_analysis': self._analyze_hyperparameters(training_config),
            'boundary_conditions_analysis': self._analyze_boundary_conditions(training_config),
            'loss_formulation_analysis': self._analyze_loss_formulation(loss_history),
            'stabilization_strategies': self._generate_stabilization_strategies()
        }
        
        return analysis
    
    def _analyze_hyperparameters(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse l'impact des hyperparamètres"""
        
        issues = []
        
        # Analyse learning rate
        lr = config.get('learning_rate', 0.001)
        if lr > 0.01:
            issues.append({
                'parameter': 'learning_rate',
                'issue': 'Trop élevé - risque de divergence',
                'recommendation': f'Réduire à {lr/10:.6f} ou utiliser learning rate scheduler'
            })
        elif lr < 1e-6:
            issues.append({
                'parameter': 'learning_rate', 
                'issue': 'Trop faible - convergence lente',
                'recommendation': 'Augmenter à 1e-4 ou utiliser adaptive learning rate'
            })
        
        # Analyse architecture réseau
        hidden_layers = config.get('hidden_layers', [50, 50, 50])
        if len(hidden_layers) < 3:
            issues.append({
                'parameter': 'hidden_layers',
                'issue': 'Capacité du réseau insuffisante',
                'recommendation': 'Augmenter à [64, 64, 64, 64] ou plus'
            })
        
        return {'issues': issues, 'severity': 'high' if issues else 'low'}
    
    def _analyze_boundary_conditions(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse l'impact des conditions aux limites"""
        
        bc_config = config.get('boundary_conditions', {})
        issues = []
        
        for bc_name, bc_data in bc_config.items():
            bc_type = bc_data.get('type', 'unknown')
            
            if bc_type == 'dirichlet':
                # Vérifier la continuité des conditions Dirichlet
                if 'value' not in bc_data:
                    issues.append({
                        'boundary': bc_name,
                        'issue': 'Valeur Dirichlet non définie',
                        'recommendation': 'Définir une valeur numérique explicite'
                    })
            
            elif bc_type == 'neumann':
                # Vérifier la cohérence des flux
                if 'flux' not in bc_data:
                    issues.append({
                        'boundary': bc_name, 
                        'issue': 'Flux Neumann non défini',
                        'recommendation': 'Définir le flux avec unités physiques'
                    })
        
        return {'boundary_issues': issues, 'validation_required': len(issues) > 0}
    
    def _analyze_loss_formulation(self, loss_history: List[float]) -> Dict[str, Any]:
        """Analyse la formulation des pertes physiques"""
        
        if len(loss_history) < 10:
            return {'error': 'Historique de perte insuffisant'}
        
        recent_losses = loss_history[-10:]
        loss_variance = np.var(recent_losses)
        loss_trend = self._calculate_trend(recent_losses)
        
        analysis = {
            'loss_stability': 'stable' if loss_variance < 1e-4 else 'unstable',
            'convergence_trend': 'converging' if loss_trend < -0.01 else 'oscillating',
            'final_loss': loss_history[-1],
            'loss_reduction': loss_history[0] - loss_history[-1]
        }
        
        # Détection des oscillations
        if analysis['convergence_trend'] == 'oscillating' and analysis['loss_stability'] == 'unstable':
            analysis['recommendation'] = 'Ajouter la pondération adaptive des pertes ou réduire le learning rate'
        
        return analysis
    
    def _generate_stabilization_strategies(self) -> List[Dict[str, Any]]:
        """Génère des stratégies de stabilisation"""
        
        return [
            {
                'strategy': 'Learning Rate Scheduling',
                'implementation': 'Dans training_manager.py - réduire LR sur plateau',
                'code_snippet': '''
                scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
                    optimizer, mode='min', patience=100, factor=0.5
                )
                '''
            },
            {
                'strategy': 'Loss Weighting Adaptive', 
                'implementation': 'Dans physics_loss.py - pondération basée sur les gradients',
                'code_snippet': '''
                # Calculer les poids basés sur l'importance relative
                pde_loss_weight = 1.0 / (pde_grad_norm + 1e-8)
                bc_loss_weight = 1.0 / (bc_grad_norm + 1e-8)
                '''
            },
            {
                'strategy': 'Gradient Clipping',
                'implementation': 'Dans core_model.py - limiter les gradients extrêmes',
                'code_snippet': '''
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                '''
            }
        ]
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calcule la tendance linéaire d'une série"""
        if len(values) < 2:
            return 0.0
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        return slope
