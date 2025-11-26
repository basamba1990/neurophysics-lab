# /backend/services/cloud_orchestrator.py
from typing import Dict, List, Any
import asyncio

class CloudSolutionAnalyzer:
    """Analyseur des solutions cloud pour le calcul scientifique"""
    
    def __init__(self):
        self.solutions = {
            'aws_batch': {
                'gpu_support': 'excellent',
                'cost_per_hour_gpu': 0.95,  # p3.2xlarge
                'max_job_duration': 'None',
                'scientific_libraries': 'Complete',
                'fastapi_integration': 'Via AWS API Gateway + Lambda'
            },
            'gcp_cloud_run': {
                'gpu_support': 'limited',
                'cost_per_hour_gpu': 0.78,  # NVIDIA T4
                'max_job_duration': '24h',
                'scientific_libraries': 'Good',
                'fastapi_integration': 'Native via Cloud Run'
            },
            'azure_container_instances': {
                'gpu_support': 'good',
                'cost_per_hour_gpu': 0.90,  # NVIDIA Tesla K80
                'max_job_duration': 'None',
                'scientific_libraries': 'Good',
                'fastapi_integration': 'Via Azure API Management'
            }
        }
    
    async def analyze_workload(self, simulation_config: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse la charge de travail pour recommander la meilleure solution cloud"""
        
        # Estimation des ressources basée sur la configuration
        estimated_gpu_hours = self._estimate_gpu_requirements(simulation_config)
        memory_requirements = simulation_config.get('memory_gb', 16)
        
        recommendations = []
        
        for solution, specs in self.solutions.items():
            score = 0
            
            # Score basé sur les besoins GPU
            if estimated_gpu_hours > 10 and specs['gpu_support'] == 'excellent':
                score += 40
            elif estimated_gpu_hours <= 10:
                score += 30
                
            # Score coût
            total_cost = estimated_gpu_hours * specs['cost_per_hour_gpu']
            if total_cost < 50:
                score += 30
            else:
                score += 20
                
            # Score intégration
            if 'good' in specs['fastapi_integration'] or 'native' in specs['fastapi_integration']:
                score += 30
                
            recommendations.append({
                'solution': solution,
                'score': score,
                'estimated_cost': total_cost,
                'integration_complexity': 'low' if 'native' in specs['fastapi_integration'] else 'medium'
            })
        
        # Tri par score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'workload_analysis': {
                'estimated_gpu_hours': estimated_gpu_hours,
                'memory_requirements': f"{memory_requirements}GB",
                'computation_intensity': 'high' if estimated_gpu_hours > 20 else 'medium'
            },
            'recommendations': recommendations,
            'top_recommendation': recommendations[0]
        }
    
    def _estimate_gpu_requirements(self, config: Dict[str, Any]) -> float:
        """Estime les besoins GPU basés sur la configuration de simulation"""
        mesh_points = config.get('mesh_points', 10000)
        physics_complexity = config.get('physics_complexity', 1.0)  # 1.0 = Navier-Stokes standard
        
        # Heuristique basée sur l'expérience
        base_hours = (mesh_points / 50000) * physics_complexity
        return base_hours * config.get('number_of_epochs', 1000) / 1000
