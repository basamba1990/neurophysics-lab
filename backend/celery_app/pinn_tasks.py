import tensorflow as tf
import numpy as np
from typing import Dict, Any
from celery import shared_task
from celery.utils.log import get_task_logger
import asyncio

from services.pinns_solver.navier_stokes_pinn import NavierStokesSolver
from services.pinns_solver.heat_transfer_pinn import HeatTransferSolver
from utils.logger import pinn_logger
from utils.performance import PerformanceMonitor

logger = get_task_logger(__name__)
performance_monitor = PerformanceMonitor()

@shared_task(bind=True, name='pinn_tasks.run_navier_stokes', queue='pinn_queue')
def run_navier_stokes_simulation(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Tâche Celery pour les simulations Navier-Stokes"""
    try:
        # Mise à jour de l'état
        self.update_state(
            state='PROGRESS',
            meta={
                'progress': 10,
                'status': 'Initializing Navier-Stokes solver...',
                'scientific_context': f"Reynolds: {params.get('reynolds', 'N/A')}"
            }
        )
        
        # Initialisation du solveur
        pinn_logger.info(f"Starting Navier-Stokes simulation task {self.request.id}")
        
        solver = NavierStokesSolver(params)
        
        # Génération des points de collocation
        self.update_state(
            state='PROGRESS',
            meta={'progress': 30, 'status': 'Generating collocation points...'}
        )
        
        collocation_points = solver.generate_collocation_points()
        
        # Entraînement
        self.update_state(
            state='PROGRESS', 
            meta={'progress': 50, 'status': 'Training PINN model...'}
        )
        
        loss_history = asyncio.run(solver.train(collocation_points, epochs=params.get('epochs', 1000)))
        
        # Prédiction
        self.update_state(
            state='PROGRESS',
            meta={'progress': 80, 'status': 'Running predictions...'}
        )
        
        predictions = solver.predict(collocation_points)
        
        # Post-processing
        results = {
            'velocity_field': predictions['velocity'].tolist(),
            'pressure_field': predictions['pressure'].tolist(),
            'vorticity': solver.calculate_vorticity(predictions['velocity']).tolist(),
            'convergence_metrics': {
                'final_loss': float(loss_history[-1]) if loss_history else None,
                'loss_history': [float(l) for l in loss_history],
                'convergence_rate': solver.calculate_convergence_rate(loss_history)
            },
            'performance_metrics': {
                'execution_time': self.get_execution_time(),
                'memory_usage': performance_monitor.get_memory_usage(),
                'gpu_available': tf.config.list_physical_devices('GPU') != []
            },
            'scientific_validation': {
                'mass_conservation': solver.validate_mass_conservation(predictions),
                'boundary_conditions_satisfied': solver.validate_boundary_conditions(),
                'stability_analysis': solver.analyze_stability()
            }
        }
        
        pinn_logger.info(f"Navier-Stokes simulation {self.request.id} completed successfully")
        
        return {
            'status': 'SUCCESS',
            'task_id': self.request.id,
            'results': results,
            'scientific_context': {
                'physics_type': 'navier_stokes',
                'reynolds_number': params.get('reynolds'),
                'mesh_resolution': params.get('mesh_resolution', 'standard')
            }
        }
        
    except Exception as e:
        pinn_logger.error(f"Navier-Stokes simulation {self.request.id} failed: {str(e)}")
        
        # Log scientifique de l'erreur
        scientific_error = {
            'error_type': 'numerical_instability' if 'NaN' in str(e) else 'runtime_error',
            'error_message': str(e),
            'potential_causes': [
                'Unstable Reynolds number',
                'Insufficient collocation points',
                'Network architecture too small',
                'Learning rate too high'
            ],
            'recommended_fixes': [
                'Reduce Reynolds number',
                'Increase number of collocation points',
                'Use deeper neural network',
                'Reduce learning rate'
            ]
        }
        
        raise self.retry(
            exc=e,
            countdown=60,
            max_retries=3
        )

@shared_task(bind=True, name='pinn_tasks.run_heat_transfer', queue='pinn_queue')
def run_heat_transfer_simulation(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Tâche Celery pour les simulations de transfert thermique"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'progress': 10, 'status': 'Initializing heat transfer solver...'}
        )
        
        solver = HeatTransferSolver(params)
        
        # Simulation
        results = asyncio.run(solver.simulate())
        
        return {
            'status': 'SUCCESS',
            'task_id': self.request.id,
            'results': results,
            'scientific_context': {
                'physics_type': 'heat_transfer',
                'thermal_diffusivity': params.get('thermal_diffusivity'),
                'boundary_conditions': params.get('boundary_conditions')
            }
        }
        
    except Exception as e:
        logger.error(f"Heat transfer simulation failed: {str(e)}")
        raise

@shared_task(name='pinn_tasks.batch_simulations', queue='pinn_queue')
def run_batch_simulations(param_sets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Exécute un batch de simulations en parallèle"""
    tasks = []
    
    for params in param_sets:
        # Lance chaque simulation dans une tâche séparée
        task = run_navier_stokes_simulation.delay(params)
        tasks.append(task)
    
    # Attend la complétion de toutes les tâches
    results = []
    for task in tasks:
        try:
            result = task.get(timeout=1800)  # 30 minutes timeout
            results.append(result)
        except Exception as e:
            results.append({
                'status': 'FAILED',
                'error': str(e),
                'params': params
            })
    
    return {
        'batch_id': f"batch_{np.random.randint(10000, 99999)}",
        'total_simulations': len(param_sets),
        'successful': sum(1 for r in results if r.get('status') == 'SUCCESS'),
        'failed': sum(1 for r in results if r.get('status') == 'FAILED'),
        'detailed_results': results
    }

def get_execution_time(self):
    """Calcule le temps d'exécution de la tâche"""
    if hasattr(self, 'date_start'):
        return (self.get_date_done() - self.date_start).total_seconds()
    return None
