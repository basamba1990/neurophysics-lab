# /backend/services/analytics/pinn_performance_dashboard.py
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Any

class PINNPerformanceDashboard:
    """Tableau de bord pour l'analyse des performances PINN"""
    
    def __init__(self):
        self.metrics_history = []
    
    def generate_convergence_analysis(self, simulation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Génère l'analyse de convergence pour une simulation"""
        
        loss_history = simulation_data.get('loss_history', [])
        validation_errors = simulation_data.get('validation_errors', {})
        
        # Création des visualisations
        figures = {
            'convergence_plot': self._create_convergence_plot(loss_history),
            'validation_comparison': self._create_validation_comparison(validation_errors),
            'architecture_performance': self._compare_architectures(simulation_data)
        }
        
        # Métriques de performance
        performance_metrics = self._calculate_performance_metrics(loss_history, validation_errors)
        
        return {
            'visualizations': figures,
            'performance_metrics': performance_metrics,
            'recommendations': self._generate_performance_recommendations(performance_metrics)
        }
    
    def _create_convergence_plot(self, loss_history: List[float]) -> Dict[str, Any]:
        """Crée le graphique de convergence"""
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            y=loss_history,
            mode='lines+markers',
            name='Loss',
            line=dict(color='blue', width=2)
        ))
        
        # Ajouter la tendance
        if len(loss_history) > 10:
            window = min(50, len(loss_history) // 2)
            moving_avg = pd.Series(loss_history).rolling(window=window).mean()
            
            fig.add_trace(go.Scatter(
                y=moving_avg,
                mode='lines',
                name=f'Moving Average (window={window})',
                line=dict(color='red', width=3, dash='dash')
            ))
        
        fig.update_layout(
            title='Convergence Training PINN',
            xaxis_title='Epoch',
            yaxis_title='Loss',
            yaxis_type='log'
        )
        
        return fig.to_dict()
    
    def _create_validation_comparison(self, validation_errors: Dict[str, List[float]]) -> Dict[str, Any]:
        """Compare les erreurs de validation entre différents cas tests"""
        
        fig = go.Figure()
        
        for case_name, errors in validation_errors.items():
            fig.add_trace(go.Box(
                y=errors,
                name=case_name,
                boxpoints='all'
            ))
        
        fig.update_layout(
            title='Distribution des Erreurs de Validation par Cas Test',
            yaxis_title='Error L2',
            showlegend=True
        )
        
        return fig.to_dict()
    
    def _compare_architectures(self, simulation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compare les performances entre différentes architectures de réseaux"""
        
        architectures = simulation_data.get('architecture_comparison', {})
        
        if not architectures:
            return {}
        
        metrics = ['final_loss', 'training_time', 'validation_error']
        fig = make_subplots(rows=1, cols=len(metrics), subplot_titles=metrics)
        
        for i, metric in enumerate(metrics):
            values = [arch.get(metric, 0) for arch in architectures.values()]
            fig.add_trace(
                go.Bar(x=list(architectures.keys()), y=values, name=metric),
                row=1, col=i+1
            )
        
        fig.update_layout(height=400, title_text="Performance par Architecture de Réseau")
        return fig.to_dict()
    
    def _calculate_performance_metrics(self, loss_history: List[float], 
                                    validation_errors: Dict[str, Any]) -> Dict[str, float]:
        """Calcule les métriques de performance"""
        
        if not loss_history:
            return {}
        
        final_loss = loss_history[-1]
        convergence_speed = self._calculate_convergence_speed(loss_history)
        
        # Erreur de validation moyenne
        avg_validation_error = 0.0
        if validation_errors:
            all_errors = [err for errors in validation_errors.values() for err in errors]
            avg_validation_error = sum(all_errors) / len(all_errors) if all_errors else 0.0
        
        return {
            'final_loss': final_loss,
            'convergence_speed': convergence_speed,
            'average_validation_error': avg_validation_error,
            'training_stability': self._calculate_training_stability(loss_history),
            'generalization_capability': 1.0 / (avg_validation_error + 1e-8)
        }
    
    def _generate_performance_recommendations(self, metrics: Dict[str, float]) -> List[str]:
        """Génère des recommandations basées sur les métriques"""
        
        recommendations = []
        
        if metrics.get('final_loss', 1.0) > 0.1:
            recommendations.append("Considérer l'augmentation de la capacité du réseau ou la durée d'entraînement")
        
        if metrics.get('convergence_speed', 0.0) < 0.01:
            recommendations.append("Optimiser les hyperparamètres (learning rate, batch size)")
        
        if metrics.get('average_validation_error', 1.0) > 0.05:
            recommendations.append("Améliorer la régularisation ou augmenter les données d'entraînement")
        
        return recommendations
    
    def _calculate_convergence_speed(self, loss_history: List[float]) -> float:
        """Calcule la vitesse de convergence"""
        if len(loss_history) < 2:
            return 0.0
        
        initial_loss = loss_history[0]
        final_loss = loss_history[-1]
        epochs = len(loss_history)
        
        return (initial_loss - final_loss) / epochs
    
    def _calculate_training_stability(self, loss_history: List[float]) -> float:
        """Calcule la stabilité de l'entraînement"""
        if len(loss_history) < 10:
            return 1.0
        
        # Coefficient de variation des dernières pertes
        recent_losses = loss_history[-10:]
        mean_loss = sum(recent_losses) / len(recent_losses)
        std_loss = (sum((x - mean_loss) ** 2 for x in recent_losses) / len(recent_losses)) ** 0.5
        
        return 1.0 / (std_loss / mean_loss + 1e-8) if mean_loss > 0 else 1.0
