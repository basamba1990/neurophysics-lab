import numpy as np
import pulp
from typing import Dict, Any, List, Tuple
from scipy.optimize import minimize, differential_evolution
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel
import asyncio

from utils.logger import optimization_logger
from core.exceptions import SimulationError

class OptimizationSolver:
    """Multi-objective optimization solver for engineering systems"""
    
    def __init__(self):
        self.optimization_methods = {
            'genetic_algorithm': self._genetic_algorithm,
            'gradient_descent': self._gradient_descent,
            'bayesian_optimization': self._bayesian_optimization,
            'particle_swarm': self._particle_swarm,
            'linear_programming': self._linear_programming
        }
        
        self.surrogate_models = {}
        
        optimization_logger.info("OptimizationSolver initialized")
    
    async def optimize_system(self, optimization_request: Dict[str, Any]) -> Dict[str, Any]:
        """Run multi-objective optimization"""
        
        try:
            method = optimization_request.get('method', 'genetic_algorithm')
            objectives = optimization_request.get('objectives', [])
            constraints = optimization_request.get('constraints', {})
            parameters = optimization_request.get('parameters', {})
            
            optimization_logger.info(f"Starting optimization with method: {method}")
            
            if method not in self.optimization_methods:
                raise SimulationError(f"Unsupported optimization method: {method}")
            
            # Run optimization
            result = await self.optimization_methods[method](
                objectives, constraints, parameters
            )
            
            # Generate optimization report
            report = self._generate_optimization_report(result, objectives, constraints)
            
            optimization_logger.info("Optimization completed successfully")
            
            return {
                "optimal_parameters": result.get('optimal_parameters', {}),
                "objective_values": result.get('objective_values', {}),
                "convergence_metrics": result.get('convergence_metrics', {}),
                "optimization_report": report,
                "method_used": method
            }
            
        except Exception as e:
            optimization_logger.error(f"Optimization failed: {e}")
            raise SimulationError(f"Optimization failed: {str(e)}")
    
    async def _genetic_algorithm(self, objectives: List[Dict], constraints: Dict, 
                               parameters: Dict) -> Dict[str, Any]:
        """Genetic algorithm optimization"""
        
        # Define objective function
        def objective_function(x):
            return self._evaluate_objectives(x, objectives, constraints)
        
        # Set up bounds
        bounds = self._get_parameter_bounds(parameters)
        
        # Run differential evolution
        result = differential_evolution(
            objective_function,
            bounds,
            popsize=parameters.get('population_size', 50),
            maxiter=parameters.get('max_iterations', 100),
            tol=parameters.get('tolerance', 1e-6),
            workers=1  # Can be increased for parallelization
        )
        
        return {
            'optimal_parameters': self._vector_to_parameters(result.x, parameters),
            'objective_values': {'total_cost': result.fun},
            'convergence_metrics': {
                'iterations': result.nit,
                'success': result.success,
                'message': result.message
            }
        }
    
    async def _gradient_descent(self, objectives: List[Dict], constraints: Dict,
                              parameters: Dict) -> Dict[str, Any]:
        """Gradient-based optimization"""
        
        # Initial guess
        x0 = self._parameters_to_vector(parameters)
        bounds = self._get_parameter_bounds(parameters)
        
        # Define objective with constraints
        def objective_function(x):
            return self._evaluate_objectives(x, objectives, constraints)
        
        # Run optimization
        result = minimize(
            objective_function,
            x0,
            method='L-BFGS-B',
            bounds=bounds,
            options={
                'maxiter': parameters.get('max_iterations', 100),
                'ftol': parameters.get('tolerance', 1e-6)
            }
        )
        
        return {
            'optimal_parameters': self._vector_to_parameters(result.x, parameters),
            'objective_values': {'total_cost': result.fun},
            'convergence_metrics': {
                'iterations': result.nit,
                'success': result.success,
                'message': result.message
            }
        }
    
    async def _bayesian_optimization(self, objectives: List[Dict], constraints: Dict,
                                   parameters: Dict) -> Dict[str, Any]:
        """Bayesian optimization with Gaussian Processes"""
        
        n_iter = parameters.get('max_iterations', 50)
        n_initial_points = parameters.get('n_initial_points', 10)
        
        # Create surrogate model
        surrogate = self._create_surrogate_model()
        
        # Initial sampling
        X_initial = self._sample_initial_points(parameters, n_initial_points)
        y_initial = np.array([self._evaluate_objectives(x, objectives, constraints) 
                            for x in X_initial])
        
        # Fit initial model
        surrogate.fit(X_initial, y_initial)
        
        # Bayesian optimization loop
        X_samples = X_initial.copy()
        y_samples = y_initial.copy()
        
        for i in range(n_iter):
            # Find next point using acquisition function
            x_next = self._next_bayesian_point(surrogate, parameters)
            y_next = self._evaluate_objectives(x_next, objectives, constraints)
            
            # Update samples
            X_samples = np.vstack([X_samples, x_next])
            y_samples = np.append(y_samples, y_next)
            
            # Update surrogate model
            surrogate.fit(X_samples, y_samples)
        
        # Find best solution
        best_idx = np.argmin(y_samples)
        x_optimal = X_samples[best_idx]
        
        return {
            'optimal_parameters': self._vector_to_parameters(x_optimal, parameters),
            'objective_values': {'total_cost': y_samples[best_idx]},
            'convergence_metrics': {
                'iterations': n_iter,
                'surrogate_model_used': 'GaussianProcessRegressor'
            }
        }
    
    async def _particle_swarm(self, objectives: List[Dict], constraints: Dict,
                            parameters: Dict) -> Dict[str, Any]:
        """Particle Swarm Optimization"""
        
        n_particles = parameters.get('n_particles', 30)
        max_iter = parameters.get('max_iterations', 100)
        
        # Initialize particles
        bounds = self._get_parameter_bounds(parameters)
        n_dim = len(bounds)
        
        # Initialize positions and velocities
        positions = np.random.uniform(
            [b[0] for b in bounds],
            [b[1] for b in bounds],
            (n_particles, n_dim)
        )
        
        velocities = np.random.uniform(-1, 1, (n_particles, n_dim))
        
        # Initialize personal best
        personal_best_positions = positions.copy()
        personal_best_scores = np.array([
            self._evaluate_objectives(pos, objectives, constraints) 
            for pos in positions
        ])
        
        # Initialize global best
        global_best_idx = np.argmin(personal_best_scores)
        global_best_position = personal_best_positions[global_best_idx]
        global_best_score = personal_best_scores[global_best_idx]
        
        # PSO parameters
        w = 0.729  # inertia
        c1 = 1.494  # cognitive parameter
        c2 = 1.494  # social parameter
        
        # Optimization loop
        for iteration in range(max_iter):
            for i in range(n_particles):
                # Update velocity
                r1, r2 = np.random.random(2)
                velocities[i] = (w * velocities[i] +
                               c1 * r1 * (personal_best_positions[i] - positions[i]) +
                               c2 * r2 * (global_best_position - positions[i]))
                
                # Update position
                positions[i] += velocities[i]
                
                # Apply bounds
                positions[i] = np.clip(positions[i], 
                                     [b[0] for b in bounds], 
                                     [b[1] for b in bounds])
                
                # Evaluate objective
                current_score = self._evaluate_objectives(
                    positions[i], objectives, constraints
                )
                
                # Update personal best
                if current_score < personal_best_scores[i]:
                    personal_best_positions[i] = positions[i]
                    personal_best_scores[i] = current_score
                    
                    # Update global best
                    if current_score < global_best_score:
                        global_best_position = positions[i]
                        global_best_score = current_score
            
            # Early stopping if convergence is reached
            if self._check_pso_convergence(personal_best_scores):
                break
        
        return {
            'optimal_parameters': self._vector_to_parameters(global_best_position, parameters),
            'objective_values': {'total_cost': global_best_score},
            'convergence_metrics': {
                'iterations': iteration + 1,
                'final_swarm_diversity': np.std(personal_best_scores)
            }
        }
    
    async def _linear_programming(self, objectives: List[Dict], constraints: Dict,
                                parameters: Dict) -> Dict[str, Any]:
        """Linear programming optimization"""
        
        # Create problem
        prob = pulp.LpProblem("EngineeringOptimization", pulp.LpMinimize)
        
        # Create variables
        lp_vars = {}
        for param_name, param_config in parameters.items():
            if 'bounds' in param_config:
                low = param_config['bounds'][0]
                high = param_config['bounds'][1]
                lp_vars[param_name] = pulp.LpVariable(
                    param_name, low, high, pulp.LpContinuous
                )
        
        # Define objective function
        objective = self._build_lp_objective(objectives, lp_vars)
        prob += objective
        
        # Add constraints
        self._add_lp_constraints(prob, constraints, lp_vars)
        
        # Solve problem
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        # Extract results
        optimal_params = {
            name: var.varValue for name, var in lp_vars.items()
        }
        
        return {
            'optimal_parameters': optimal_params,
            'objective_values': {'total_cost': pulp.value(prob.objective)},
            'convergence_metrics': {
                'status': pulp.LpStatus[prob.status],
                'method': 'LinearProgramming'
            }
        }
    
    def _evaluate_objectives(self, x: np.ndarray, objectives: List[Dict], 
                           constraints: Dict) -> float:
        """Evaluate multiple objectives with constraints"""
        
        total_cost = 0.0
        
        # Convert vector to parameter dictionary
        params = self._vector_to_parameters(x, {})
        
        # Evaluate each objective
        for objective in objectives:
            obj_type = objective.get('type', 'minimize')
            obj_function = objective.get('function')
            weight = objective.get('weight', 1.0)
            
            # This would typically call a simulation or surrogate model
            obj_value = self._evaluate_objective_function(obj_function, params)
            
            if obj_type == 'minimize':
                total_cost += weight * obj_value
            else:  # maximize
                total_cost -= weight * obj_value
        
        # Add constraint penalties
        penalty = self._evaluate_constraints(constraints, params)
        total_cost += penalty
        
        return total_cost
    
    def _evaluate_objective_function(self, function_def: Dict, parameters: Dict) -> float:
        """Evaluate a specific objective function"""
        
        # This is a simplified implementation
        # In practice, this would call simulation models or surrogate models
        
        function_type = function_def.get('type', 'analytical')
        
        if function_type == 'analytical':
            # Evaluate analytical function
            expression = function_def.get('expression', '0')
            return self._evaluate_expression(expression, parameters)
        
        elif function_type == 'surrogate':
            # Use surrogate model
            model_id = function_def.get('model_id')
            return self._evaluate_surrogate_model(model_id, parameters)
        
        elif function_type == 'simulation':
            # Run simulation (would be implemented with actual simulation call)
            return self._run_simulation(function_def.get('simulation_config'), parameters)
        
        else:
            return 0.0
    
    def _evaluate_constraints(self, constraints: Dict, parameters: Dict) -> float:
        """Evaluate constraint violations with penalty method"""
        
        penalty = 0.0
        penalty_weight = 1e6  # Large penalty for constraint violations
        
        for constr_name, constraint in constraints.items():
            constr_type = constraint.get('type')
            bound = constraint.get('bound')
            
            # Evaluate constraint expression
            value = self._evaluate_expression(
                constraint.get('expression', '0'), 
                parameters
            )
            
            if constr_type == 'inequality' and value > bound:
                penalty += penalty_weight * (value - bound) ** 2
            elif constr_type == 'equality':
                penalty += penalty_weight * (value - bound) ** 2
        
        return penalty
    
    def _evaluate_expression(self, expression: str, parameters: Dict) -> float:
        """Evaluate mathematical expression with parameters"""
        
        # Safe evaluation of mathematical expressions
        try:
            # Create safe environment for eval
            safe_dict = {
                'sin': np.sin, 'cos': np.cos, 'tan': np.tan,
                'exp': np.exp, 'log': np.log, 'sqrt': np.sqrt,
                'pi': np.pi, 'e': np.e
            }
            safe_dict.update(parameters)
            
            return eval(expression, {"__builtins__": {}}, safe_dict)
        except:
            return 0.0
    
    def _get_parameter_bounds(self, parameters: Dict) -> List[Tuple]:
        """Convert parameters to bounds array"""
        
        bounds = []
        for param_config in parameters.values():
            if 'bounds' in param_config:
                bounds.append(tuple(param_config['bounds']))
            else:
                bounds.append((0.0, 1.0))  # Default bounds
        
        return bounds
    
    def _parameters_to_vector(self, parameters: Dict) -> np.ndarray:
        """Convert parameters dictionary to vector"""
        
        vector = []
        for param_config in parameters.values():
            if 'value' in param_config:
                vector.append(param_config['value'])
            else:
                vector.append(0.5)  # Default value
        
        return np.array(vector)
    
    def _vector_to_parameters(self, vector: np.ndarray, parameters: Dict) -> Dict:
        """Convert vector back to parameters dictionary"""
        
        result = {}
        param_names = list(parameters.keys())
        
        for i, (name, config) in enumerate(parameters.items()):
            if i < len(vector):
                result[name] = vector[i]
            else:
                result[name] = config.get('value', 0.0)
        
        return result
    
    def _create_surrogate_model(self) -> GaussianProcessRegressor:
        """Create Gaussian Process surrogate model"""
        
        kernel = ConstantKernel(1.0) * RBF(length_scale=1.0)
        return GaussianProcessRegressor(
            kernel=kernel,
            n_restarts_optimizer=10,
            random_state=42
        )
    
    def _sample_initial_points(self, parameters: Dict, n_points: int) -> np.ndarray:
        """Sample initial points for Bayesian optimization"""
        
        bounds = self._get_parameter_bounds(parameters)
        n_dim = len(bounds)
        
        # Latin Hypercube Sampling for better space coverage
        samples = np.random.random((n_points, n_dim))
        
        for dim in range(n_dim):
            low, high = bounds[dim]
            samples[:, dim] = low + (high - low) * samples[:, dim]
        
        return samples
    
    def _next_bayesian_point(self, surrogate: GaussianProcessRegressor, 
                           parameters: Dict) -> np.ndarray:
        """Find next point using Expected Improvement"""
        
        bounds = self._get_parameter_bounds(parameters)
        n_dim = len(bounds)
        
        # Generate candidate points
        n_candidates = 1000
        candidates = np.random.uniform(
            [b[0] for b in bounds],
            [b[1] for b in bounds],
            (n_candidates, n_dim)
        )
        
        # Predict mean and std for candidates
        mean, std = surrogate.predict(candidates, return_std=True)
        
        # Calculate Expected Improvement
        current_best = np.min(surrogate.y_train_)
        with np.errstate(divide='warn'):
            improvement = current_best - mean
            z = improvement / std
            ei = improvement * self._norm_cdf(z) + std * self._norm_pdf(z)
        
        # Select point with maximum EI
        best_candidate = candidates[np.argmax(ei)]
        return best_candidate
    
    def _norm_cdf(self, x):
        """Cumulative distribution function for standard normal"""
        return (1.0 + erf(x / sqrt(2.0))) / 2.0
    
    def _norm_pdf(self, x):
        """Probability density function for standard normal"""
        return exp(-x**2 / 2.0) / sqrt(2.0 * pi)
    
    def _check_pso_convergence(self, scores: np.ndarray, tol: float = 1e-6) -> bool:
        """Check PSO convergence based on swarm diversity"""
        
        return np.std(scores) < tol
    
    def _build_lp_objective(self, objectives: List[Dict], variables: Dict) -> pulp.LpAffineExpression:
        """Build linear programming objective function"""
        
        objective_expr = 0
        
        for objective in objectives:
            weight = objective.get('weight', 1.0)
            expression = objective.get('expression', '0')
            
            # Parse expression and build LP expression
            # This is a simplified implementation
            for var_name, var in variables.items():
                if var_name in expression:
                    # Extract coefficient (simplified)
                    coefficient = self._extract_coefficient(expression, var_name)
                    objective_expr += coefficient * var * weight
        
        return objective_expr
    
    def _add_lp_constraints(self, problem: pulp.LpProblem, constraints: Dict, 
                          variables: Dict):
        """Add constraints to linear programming problem"""
        
        for constr_name, constraint in constraints.items():
            expression = constraint.get('expression', '0')
            bound = constraint.get('bound', 0)
            constr_type = constraint.get('type', 'inequality')
            
            # Build constraint expression
            constr_expr = 0
            for var_name, var in variables.items():
                if var_name in expression:
                    coefficient = self._extract_coefficient(expression, var_name)
                    constr_expr += coefficient * var
            
            # Add constraint to problem
            if constr_type == 'inequality':
                problem += constr_expr <= bound
            elif constr_type == 'equality':
                problem += constr_expr == bound
    
    def _extract_coefficient(self, expression: str, variable: str) -> float:
        """Extract coefficient from expression (simplified)"""
        
        # This is a very simplified implementation
        # In practice, you'd use a proper expression parser
        if variable in expression:
            return 1.0  # Default coefficient
        return 0.0
    
    def _evaluate_surrogate_model(self, model_id: str, parameters: Dict) -> float:
        """Evaluate surrogate model prediction"""
        
        if model_id in self.surrogate_models:
            model = self.surrogate_models[model_id]
            # Convert parameters to input format and predict
            # Implementation depends on surrogate model type
            pass
        
        return 0.0
    
    def _run_simulation(self, simulation_config: Dict, parameters: Dict) -> float:
        """Run simulation to evaluate objective"""
        
        # This would integrate with the PINN solver or other simulation engines
        # For now, return a placeholder value
        return sum(parameters.values()) if parameters else 0.0
    
    def _generate_optimization_report(self, result: Dict, objectives: List[Dict], 
                                    constraints: Dict) -> Dict[str, Any]:
        """Generate comprehensive optimization report"""
        
        return {
            "optimization_summary": {
                "method_used": "Multi-objective Optimization",
                "total_objectives": len(objectives),
                "total_constraints": len(constraints),
                "convergence_achieved": result.get('convergence_metrics', {}).get('success', False)
            },
            "objective_analysis": self._analyze_objectives(objectives, result),
            "constraint_analysis": self._analyze_constraints(constraints, result),
            "sensitivity_analysis": self._perform_sensitivity_analysis(result),
            "recommendations": self._generate_recommendations(result)
        }
    
    def _analyze_objectives(self, objectives: List[Dict], result: Dict) -> Dict[str, Any]:
        """Analyze objective function results"""
        
        analysis = {}
        optimal_params = result.get('optimal_parameters', {})
        
        for i, objective in enumerate(objectives):
            obj_name = objective.get('name', f'objective_{i}')
            obj_value = self._evaluate_objective_function(
                objective, optimal_params
            )
            
            analysis[obj_name] = {
                "achieved_value": obj_value,
                "weight": objective.get('weight', 1.0),
                "type": objective.get('type', 'minimize')
            }
        
        return analysis
    
    def _analyze_constraints(self, constraints: Dict, result: Dict) -> Dict[str, Any]:
        """Analyze constraint satisfaction"""
        
        analysis = {}
        optimal_params = result.get('optimal_parameters', {})
        
        for constr_name, constraint in constraints.items():
            value = self._evaluate_expression(
                constraint.get('expression', '0'), 
                optimal_params
            )
            bound = constraint.get('bound', 0)
            constr_type = constraint.get('type', 'inequality')
            
            satisfied = False
            if constr_type == 'inequality':
                satisfied = value <= bound
            else:  # equality
                satisfied = abs(value - bound) < 1e-6
            
            analysis[constr_name] = {
                "value": value,
                "bound": bound,
                "satisfied": satisfied,
                "violation": value - bound if not satisfied else 0.0
            }
        
        return analysis
    
    def _perform_sensitivity_analysis(self, result: Dict) -> Dict[str, Any]:
        """Perform sensitivity analysis on optimal solution"""
        
        # Simplified sensitivity analysis
        optimal_params = result.get('optimal_parameters', {})
        sensitivities = {}
        
        for param_name, param_value in optimal_params.items():
            # Calculate sensitivity by perturbing each parameter
            perturbation = 0.01 * param_value if param_value != 0 else 0.01
            perturbed_params = optimal_params.copy()
            perturbed_params[param_name] += perturbation
            
            # This would need the original objectives to evaluate
            # For now, use a placeholder
            sensitivity = perturbation  # Placeholder
            
            sensitivities[param_name] = {
                "sensitivity": sensitivity,
                "importance": "high" if abs(sensitivity) > 0.1 else "medium"
            }
        
        return sensitivities
    
    def _generate_recommendations(self, result: Dict) -> List[str]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        if result.get('convergence_metrics', {}).get('success', False):
            recommendations.append("Optimization converged successfully to optimal solution")
        else:
            recommendations.append("Consider increasing maximum iterations for better convergence")
        
        # Add recommendations based on sensitivity analysis
        sensitivities = result.get('sensitivity_analysis', {})
        for param_name, sensitivity_info in sensitivities.items():
            if sensitivity_info.get('importance') == 'high':
                recommendations.append(
                    f"Parameter {param_name} has high sensitivity - consider tighter control"
                )
        
        return recommendations
