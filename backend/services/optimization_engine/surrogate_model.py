import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel, Matern
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import asyncio

from utils.logger import optimization_logger
from core.exceptions import SimulationError

class SurrogateModelManager:
    """Manager for surrogate models in optimization and digital twins"""
    
    def __init__(self):
        self.models = {}
        self.model_types = {
            'gaussian_process': self._create_gaussian_process,
            'random_forest': self._create_random_forest,
            'neural_network': self._create_neural_network
        }
        
        optimization_logger.info("SurrogateModelManager initialized")
    
    async def create_surrogate_model(self, model_id: str, model_type: str, 
                                   training_data: Dict[str, np.ndarray],
                                   config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create and train a surrogate model"""
        
        try:
            optimization_logger.info(f"Creating surrogate model {model_id} of type {model_type}")
            
            if model_type not in self.model_types:
                raise SimulationError(f"Unsupported model type: {model_type}")
            
            # Extract training data
            X = training_data.get('inputs')
            y = training_data.get('outputs')
            
            if X is None or y is None:
                raise SimulationError("Training data must include 'inputs' and 'outputs'")
            
            # Create and train model
            model_creator = self.model_types[model_type]
            model, training_metrics = await model_creator(X, y, config or {})
            
            # Store model
            self.models[model_id] = {
                'model': model,
                'model_type': model_type,
                'training_metrics': training_metrics,
                'config': config,
                'created_at': asyncio.get_event_loop().time()
            }
            
            optimization_logger.info(f"Surrogate model {model_id} trained successfully")
            
            return {
                "model_id": model_id,
                "model_type": model_type,
                "training_metrics": training_metrics,
                "model_size": self._get_model_size(model),
                "prediction_accuracy": training_metrics.get('test_r2', 0.0)
            }
            
        except Exception as e:
            optimization_logger.error(f"Surrogate model creation failed: {e}")
            raise SimulationError(f"Model creation failed: {str(e)}")
    
    async def predict(self, model_id: str, inputs: np.ndarray) -> np.ndarray:
        """Make predictions using a surrogate model"""
        
        if model_id not in self.models:
            raise SimulationError(f"Model {model_id} not found")
        
        model_data = self.models[model_id]
        model = model_data['model']
        
        try:
            if hasattr(model, 'predict'):
                predictions = model.predict(inputs)
                
                # For Gaussian Process, we can also get uncertainty
                if model_data['model_type'] == 'gaussian_process' and hasattr(model, 'predict'):
                    _, std = model.predict(inputs, return_std=True)
                    return predictions, std
                
                return predictions
            else:
                raise SimulationError("Model does not support prediction")
                
        except Exception as e:
            optimization_logger.error(f"Prediction failed for model {model_id}: {e}")
            raise SimulationError(f"Prediction failed: {str(e)}")
    
    async def update_model(self, model_id: str, new_data: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """Update surrogate model with new data"""
        
        if model_id not in self.models:
            raise SimulationError(f"Model {model_id} not found")
        
        model_data = self.models[model_id]
        model = model_data['model']
        model_type = model_data['model_type']
        
        try:
            # Extract new data
            X_new = new_data.get('inputs')
            y_new = new_data.get('outputs')
            
            if X_new is None or y_new is None:
                raise SimulationError("Update data must include 'inputs' and 'outputs'")
            
            # Update model based on type
            if model_type == 'gaussian_process':
                updated_model, metrics = await self._update_gaussian_process(
                    model, X_new, y_new, model_data['config']
                )
            elif model_type == 'random_forest':
                updated_model, metrics = await self._update_random_forest(
                    model, X_new, y_new
                )
            elif model_type == 'neural_network':
                updated_model, metrics = await self._update_neural_network(
                    model, X_new, y_new, model_data['config']
                )
            else:
                raise SimulationError(f"Update not supported for model type: {model_type}")
            
            # Update stored model
            model_data['model'] = updated_model
            model_data['training_metrics'].update(metrics)
            model_data['updated_at'] = asyncio.get_event_loop().time()
            
            optimization_logger.info(f"Model {model_id} updated successfully")
            
            return {
                "model_id": model_id,
                "update_metrics": metrics,
                "total_training_samples": len(X_new) + model_data['training_metrics'].get('initial_training_samples', 0)
            }
            
        except Exception as e:
            optimization_logger.error(f"Model update failed: {e}")
            raise SimulationError(f"Model update failed: {str(e)}")
    
    async def evaluate_model(self, model_id: str, test_data: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """Evaluate surrogate model performance"""
        
        if model_id not in self.models:
            raise SimulationError(f"Model {model_id} not found")
        
        model_data = self.models[model_id]
        model = model_data['model']
        
        X_test = test_data.get('inputs')
        y_test = test_data.get('outputs')
        
        if X_test is None or y_test is None:
            raise SimulationError("Test data must include 'inputs' and 'outputs'")
        
        try:
            predictions = model.predict(X_test)
            
            metrics = {
                'r2_score': r2_score(y_test, predictions),
                'mse': mean_squared_error(y_test, predictions),
                'rmse': np.sqrt(mean_squared_error(y_test, predictions)),
                'mae': np.mean(np.abs(y_test - predictions)),
                'max_error': np.max(np.abs(y_test - predictions))
            }
            
            # Additional metrics for specific model types
            if model_data['model_type'] == 'gaussian_process':
                # Calculate prediction intervals coverage
                _, std = model.predict(X_test, return_std=True)
                within_1std = np.mean(np.abs(y_test - predictions) <= std)
                within_2std = np.mean(np.abs(y_test - predictions) <= 2 * std)
                
                metrics.update({
                    'coverage_1std': within_1std,
                    'coverage_2std': within_2std,
                    'average_uncertainty': np.mean(std)
                })
            
            optimization_logger.info(f"Model {model_id} evaluation completed")
            
            return {
                "model_id": model_id,
                "evaluation_metrics": metrics,
                "test_set_size": len(X_test)
            }
            
        except Exception as e:
            optimization_logger.error(f"Model evaluation failed: {e}")
            raise SimulationError(f"Model evaluation failed: {str(e)}")
    
    async def _create_gaussian_process(self, X: np.ndarray, y: np.ndarray, 
                                     config: Dict[str, Any]) -> Tuple[GaussianProcessRegressor, Dict]:
        """Create Gaussian Process surrogate model"""
        
        # Kernel configuration
        kernel_config = config.get('kernel', 'rbf')
        
        if kernel_config == 'rbf':
            kernel = ConstantKernel(1.0) * RBF(length_scale=1.0)
        elif kernel_config == 'matern':
            kernel = ConstantKernel(1.0) * Matern(length_scale=1.0, nu=2.5)
        else:
            kernel = ConstantKernel(1.0) * RBF(length_scale=1.0)
        
        # Create model
        model = GaussianProcessRegressor(
            kernel=kernel,
            n_restarts_optimizer=config.get('n_restarts', 10),
            alpha=config.get('alpha', 1e-10),
            random_state=42
        )
        
        # Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model.fit(X_train, y_train)
        
        # Calculate training metrics
        y_pred = model.predict(X_test)
        training_metrics = {
            'test_r2': r2_score(y_test, y_pred),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'kernel_parameters': str(model.kernel_),
            'log_marginal_likelihood': model.log_marginal_likelihood(),
            'initial_training_samples': len(X_train)
        }
        
        return model, training_metrics
    
    async def _create_random_forest(self, X: np.ndarray, y: np.ndarray,
                                  config: Dict[str, Any]) -> Tuple[RandomForestRegressor, Dict]:
        """Create Random Forest surrogate model"""
        
        model = RandomForestRegressor(
            n_estimators=config.get('n_estimators', 100),
            max_depth=config.get('max_depth', None),
            min_samples_split=config.get('min_samples_split', 2),
            min_samples_leaf=config.get('min_samples_leaf', 1),
            random_state=42,
            n_jobs=-1  # Use all available cores
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model.fit(X_train, y_train)
        
        # Calculate metrics
        y_pred = model.predict(X_test)
        training_metrics = {
            'test_r2': r2_score(y_test, y_pred),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'feature_importance': model.feature_importances_.tolist(),
            'n_estimators': model.n_estimators,
            'initial_training_samples': len(X_train)
        }
        
        return model, training_metrics
    
    async def _create_neural_network(self, X: np.ndarray, y: np.ndarray,
                                   config: Dict[str, Any]) -> Tuple[MLPRegressor, Dict]:
        """Create Neural Network surrogate model"""
        
        model = MLPRegressor(
            hidden_layer_sizes=config.get('hidden_layers', (100, 50)),
            activation=config.get('activation', 'relu'),
            solver=config.get('solver', 'adam'),
            alpha=config.get('alpha', 0.0001),
            learning_rate=config.get('learning_rate', 'constant'),
            max_iter=config.get('max_iter', 1000),
            random_state=42,
            early_stopping=config.get('early_stopping', True),
            validation_fraction=config.get('validation_fraction', 0.1)
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model.fit(X_train, y_train)
        
        # Calculate metrics
        y_pred = model.predict(X_test)
        training_metrics = {
            'test_r2': r2_score(y_test, y_pred),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'final_loss': model.loss_,
            'n_iterations': model.n_iter_,
            'initial_training_samples': len(X_train),
            'network_architecture': str(model.hidden_layer_sizes)
        }
        
        return model, training_metrics
    
    async def _update_gaussian_process(self, model: GaussianProcessRegressor,
                                     X_new: np.ndarray, y_new: np.ndarray,
                                     config: Dict[str, Any]) -> Tuple[GaussianProcessRegressor, Dict]:
        """Update Gaussian Process model with new data"""
        
        # For GP, we typically retrain on the combined dataset
        # In practice, you might use more sophisticated online GP approaches
        
        # Get existing training data
        X_old = model.X_train_
        y_old = model.y_train_
        
        # Combine old and new data
        X_combined = np.vstack([X_old, X_new])
        y_combined = np.concatenate([y_old, y_new])
        
        # Retrain model
        updated_model = GaussianProcessRegressor(
            kernel=model.kernel,
            n_restarts_optimizer=config.get('n_restarts', 10),
            alpha=config.get('alpha', 1e-10),
            random_state=42
        )
        
        updated_model.fit(X_combined, y_combined)
        
        # Calculate update metrics
        update_metrics = {
            'added_samples': len(X_new),
            'total_samples': len(X_combined),
            'kernel_changed': str(updated_model.kernel_) != str(model.kernel_)
        }
        
        return updated_model, update_metrics
    
    async def _update_random_forest(self, model: RandomForestRegressor,
                                  X_new: np.ndarray, y_new: np.ndarray) -> Tuple[RandomForestRegressor, Dict]:
        """Update Random Forest model with new data"""
        
        # For Random Forest, we can use warm start to add more trees
        # or create a new model with the combined dataset
        
        # Simple approach: retrain on combined data
        X_old = np.array([tree.tree_.value for tree in model.estimators_])  # This is simplified
        # In practice, you'd store the original training data or use incremental learning
        
        # For now, we'll retrain (this is memory intensive for large datasets)
        # In production, consider using incremental learning approaches
        
        updated_model = RandomForestRegressor(
            n_estimators=model.n_estimators,
            max_depth=model.max_depth,
            random_state=42,
            n_jobs=-1
        )
        
        # Note: This requires storing original training data
        # For a proper implementation, you'd need to manage training data storage
        
        update_metrics = {
            'added_samples': len(X_new),
            'update_method': 'retrain',
            'warning': 'Original training data required for proper update'
        }
        
        return updated_model, update_metrics
    
    async def _update_neural_network(self, model: MLPRegressor,
                                   X_new: np.ndarray, y_new: np.ndarray,
                                   config: Dict[str, Any]) -> Tuple[MLPRegressor, Dict]:
        """Update Neural Network model with new data"""
        
        # Continue training with new data
        # This uses warm start to continue training
        
        model.max_iter += config.get('additional_epochs', 100)
        model.warm_start = True
        
        # Combine old and new data (requires storing original data)
        # For now, we'll just train on new data (not ideal)
        
        model.fit(X_new, y_new)
        
        update_metrics = {
            'added_samples': len(X_new),
            'additional_epochs': config.get('additional_epochs', 100),
            'final_loss': model.loss_,
            'update_method': 'continued_training'
        }
        
        return model, update_metrics
    
    def _get_model_size(self, model) -> int:
        """Estimate model size in memory"""
        
        try:
            # Use joblib to estimate size
            return len(joblib.dumps(model))
        except:
            return 0
    
    async def save_model(self, model_id: str, filepath: str):
        """Save surrogate model to disk"""
        
        if model_id not in self.models:
            raise SimulationError(f"Model {model_id} not found")
        
        try:
            model_data = self.models[model_id]
            joblib.dump(model_data, filepath)
            optimization_logger.info(f"Model {model_id} saved to {filepath}")
        except Exception as e:
            optimization_logger.error(f"Model save failed: {e}")
            raise SimulationError(f"Model save failed: {str(e)}")
    
    async def load_model(self, model_id: str, filepath: str):
        """Load surrogate model from disk"""
        
        try:
            model_data = joblib.load(filepath)
            self.models[model_id] = model_data
            optimization_logger.info(f"Model {model_id} loaded from {filepath}")
        except Exception as e:
            optimization_logger.error(f"Model load failed: {e}")
            raise SimulationError(f"Model load failed: {str(e)}")
    
    async def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get information about a surrogate model"""
        
        if model_id not in self.models:
            raise SimulationError(f"Model {model_id} not found")
        
        model_data = self.models[model_id]
        
        return {
            "model_id": model_id,
            "model_type": model_data['model_type'],
            "training_metrics": model_data['training_metrics'],
            "config": model_data['config'],
            "created_at": model_data['created_at'],
            "updated_at": model_data.get('updated_at', model_data['created_at']),
            "model_size_bytes": self._get_model_size(model_data['model'])
        }
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List all available surrogate models"""
        
        models_info = []
        
        for model_id, model_data in self.models.items():
            models_info.append({
                "model_id": model_id,
                "model_type": model_data['model_type'],
                "training_samples": model_data['training_metrics'].get('initial_training_samples', 0),
                "r2_score": model_data['training_metrics'].get('test_r2', 0.0),
                "created_at": model_data['created_at']
            })
        
        return models_info
    
    async def delete_model(self, model_id: str):
        """Delete a surrogate model"""
        
        if model_id in self.models:
            del self.models[model_id]
            optimization_logger.info(f"Model {model_id} deleted")
        else:
            raise SimulationError(f"Model {model_id} not found")
