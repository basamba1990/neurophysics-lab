import asyncio
from typing import Dict, Any, List, Optional
import numpy as np
import torch
import os

from utils.logger import pinn_logger
from utils.performance import PerformanceMonitor
from core.exceptions import ModelTrainingError

class TrainingManager:
    """Manager for PINN training processes"""
    
    def __init__(self):
        self.active_trainings = {}
        self.performance_monitor = PerformanceMonitor()
        self.model_cache = {}
        
        pinn_logger.info("TrainingManager initialized")
    
    async def start_training(self, simulation_id: str, config: Dict[str, Any], 
                           training_data: Dict[str, Any]) -> Dict[str, Any]:
        """Start an asynchronous training session"""
        
        try:
            pinn_logger.info(f"Starting training for simulation {simulation_id}")
            
            # Initialize the appropriate solver
            physics_type = config.get('physics_type', 'navier_stokes')
            
            if physics_type == 'navier_stokes':
                from .navier_stokes_pinn import NavierStokesSolver
                solver = NavierStokesSolver(config)
            elif physics_type == 'heat_transfer':
                from .heat_transfer_pinn import HeatTransferSolver
                solver = HeatTransferSolver(config)
            else:
                raise ModelTrainingError(f"Unsupported physics type: {physics_type}")
            
            # Store training reference
            self.active_trainings[simulation_id] = {
                'solver': solver,
                'status': 'running',
                'start_time': asyncio.get_event_loop().time(),
                'progress': 0.0
            }
            
            # Start training
            training_result = await self._run_training_async(solver, training_data, config)
            
            # Save the trained model
            model_path = f"./data/pre_trained_models/{simulation_id}.pth"
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            solver.save_model(model_path)
            
            # Update training status
            self.active_trainings[simulation_id].update({
                'status': 'completed',
                'completion_time': asyncio.get_event_loop().time(),
                'model_path': model_path,
                'result': training_result
            })
            
            pinn_logger.info(f"Training completed for {simulation_id}")
            
            return {
                "status": "completed",
                "model_path": model_path,
                "training_result": training_result
            }
            
        except Exception as e:
            pinn_logger.error(f"Training failed for {simulation_id}: {e}")
            
            if simulation_id in self.active_trainings:
                self.active_trainings[simulation_id]['status'] = 'failed'
                self.active_trainings[simulation_id]['error'] = str(e)
            
            return {
                "status": "failed",
                "error": str(e)
            }
    
    async def _run_training_async(self, solver, training_data: Dict[str, Any], 
                                config: Dict[str, Any]) -> Dict[str, Any]:
        """Run training asynchronously"""
        
        # Run training in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        
        def training_task():
            return solver.train(training_data, config.get('epochs', 1000))
        
        training_result = await loop.run_in_executor(None, training_task)
        
        return training_result
    
    async def monitor_training_progress(self, simulation_id: str) -> Dict[str, Any]:
        """Monitor training progress"""
        
        if simulation_id not in self.active_trainings:
            return {"status": "not_found"}
        
        training_info = self.active_trainings[simulation_id]
        
        # Calculate progress based on elapsed time and estimated total time
        if training_info['status'] == 'running':
            elapsed_time = asyncio.get_event_loop().time() - training_info['start_time']
            estimated_total_time = 300  # 5 minutes estimate
            progress = min(0.95, elapsed_time / estimated_total_time)
            
            training_info['progress'] = progress
        
        return {
            "status": training_info['status'],
            "progress": training_info.get('progress', 0),
            "current_loss": training_info.get('solver').loss_history[-1] if training_info.get('solver') and training_info['solver'].loss_history else None,
            "system_metrics": self.performance_monitor.get_system_metrics()
        }
    
    async def cancel_training(self, simulation_id: str) -> Dict[str, Any]:
        """Cancel an ongoing training"""
        
        if simulation_id not in self.active_trainings:
            return {"status": "not_found"}
        
        training_info = self.active_trainings[simulation_id]
        
        if training_info['status'] == 'running':
            # In a real implementation, you would stop the training process
            training_info['status'] = 'cancelled'
            pinn_logger.info(f"Training cancelled for {simulation_id}")
            
            return {"status": "cancelled"}
        else:
            return {"status": "not_running"}
    
    async def get_training_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get training history"""
        
        trainings = []
        for sim_id, info in list(self.active_trainings.items())[-limit:]:
            trainings.append({
                "simulation_id": sim_id,
                "status": info['status'],
                "start_time": info.get('start_time'),
                "completion_time": info.get('completion_time'),
                "model_path": info.get('model_path')
            })
        
        return trainings
    
    def cleanup_completed_trainings(self, older_than_hours: int = 24):
        """Clean up completed training records"""
        
        current_time = asyncio.get_event_loop().time()
        to_remove = []
        
        for sim_id, info in self.active_trainings.items():
            if info['status'] in ['completed', 'failed', 'cancelled']:
                completion_time = info.get('completion_time', 0)
                if current_time - completion_time > older_than_hours * 3600:
                    to_remove.append(sim_id)
        
        for sim_id in to_remove:
            del self.active_trainings[sim_id]
        
        pinn_logger.info(f"Cleaned up {len(to_remove)} completed trainings")
    
    async def distributed_training(self, simulation_id: str, config: Dict[str, Any],
                                 training_data: Dict[str, Any], num_gpus: int = 1) -> Dict[str, Any]:
        """Run distributed training across multiple GPUs"""
        
        try:
            if num_gpus > 1:
                pinn_logger.info(f"Starting distributed training on {num_gpus} GPUs for {simulation_id}")
                
                # This would implement multi-GPU training logic
                result = await self._run_multi_gpu_training(simulation_id, config, training_data, num_gpus)
                return result
            else:
                # Fall back to single GPU training
                return await self.start_training(simulation_id, config, training_data)
                
        except Exception as e:
            pinn_logger.error(f"Distributed training failed for {simulation_id}: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    async def _run_multi_gpu_training(self, simulation_id: str, config: Dict[str, Any],
                                    training_data: Dict[str, Any], num_gpus: int) -> Dict[str, Any]:
        """Run training on multiple GPUs"""
        
        # Simplified implementation - in production you would use PyTorch DDP
        pinn_logger.info(f"Multi-GPU training setup for {num_gpus} GPUs")
        
        # For now, we'll simulate multi-GPU by running on single GPU
        # but with adjusted configuration
        config['device'] = 'cuda:0'
        config['distributed'] = True
        
        return await self.start_training(simulation_id, config, training_data)
