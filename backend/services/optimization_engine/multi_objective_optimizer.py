import numpy as np
from typing import Dict, Any, List, Tuple
import asyncio
from scipy.optimize import minimize
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.core.problem import ElementwiseProblem
from pymoo.optimize import minimize as pymoo_minimize
import warnings

from utils.logger import optimization_logger
from core.exceptions import SimulationError

class MultiObjectiveOptimizer:
    """Multi-objective optimization for engineering trade-offs"""
    
    def __init__(self):
        self.multi_objective_methods = {
            'nsga2': self._nsga2_optimization,
            'weighted_sum': self._weighted_sum_optimization,
            'epsilon_constraint': self._epsilon_constraint_optimization,
            'paretto_front': self._paretto_front_optimization
        }
        
        self.preference_models = {
            'equal_weights': self._equal_weights,
            'user_defined': self._user_defined_weights,
            'entropy_weights': self._entropy_based_weights,
            'ahp_weights': self._ahp_weights
        }
        
        optimization_logger.info("MultiObjectiveOptimizer initialized")
    
    async def optimize_multi_objective(self, optimization_request: Dict[str, Any]) -> Dict[str, Any]:
        """Perform multi-objective optimization"""
        
        try:
            method = optimization_request.get('method', 'nsga2')
            objectives = optimization_request.get('objectives', [])
            constraints = optimization_request.get('constraints', {})
            parameters = optimization_request.get('parameters', {})
            preferences = optimization_request.get('preferences', {})
            
            optimization_logger.info(f"Starting multi-objective optimization with {method}")
            
            if method not in self.multi_objective_methods:
                raise SimulationError(f"Unsupported multi-objective method: {method}")
            
            # Run optimization
            result = await self.multi_objective_methods[method](
                objectives, constraints, parameters, preferences
            )
            
            # Generate comprehensive results
            comprehensive_result = await self._generate_comprehensive_result(
                result, objectives, constraints, preferences
            )
            
            optimization_logger.info("Multi-objective optimization completed")
            
            return comprehensive_result
            
        except Exception as e:
            optimization_logger.error(f"Multi-objective optimization failed: {e}")
            raise SimulationError(f"Multi-objective optimization failed: {str(e)}")
    
    async def _nsga2_optimization(self, objectives: List[Dict], constraints: Dict,
                                parameters: Dict, preferences: Dict) -> Dict[str, Any]:
        """NSGA-II multi-objective optimization"""
        
        # Define multi-objective problem
        class EngineeringProblem(ElementwiseProblem):
            def __init__(self, n_var, n_obj, n_constr, objectives, constraints, evaluator):
                super().__init__(n_var=n_var, n_obj=n_obj, n_constr=n_constr, 
                               xl=np.array([0.0] * n_var), xu=np.array([1.0] * n_var))
                self.objectives = objectives
                self.constraints = constraints
                self.evaluator = evaluator
            
            def _evaluate(self, x, out, *args, **kwargs):
                # Convert normalized x to actual parameters
                actual_params = self.evaluator.denormalize_parameters(x, parameters)
                
                # Evaluate objectives
                obj_values = []
                for obj in self.objectives:
                    value = self.evaluator.evaluate_objective(obj, actual_params)
                    obj_values.append(value)
                
                # Evaluate constraints
                constr_values = self.evaluator.evaluate_constraints(self.constraints, actual_params)
                
                out["F"] = np.array(obj_values)
                out["G"] = np.array(constr_values)
        
        # Setup problem dimensions
        n_variables = len(parameters)
        n_objectives = len(objectives)
        n_constraints = len(constraints)
        
        # Create problem instance
        problem = EngineeringProblem(
            n_var=n_variables,
            n_obj=n_objectives,
            n_constr=n_constraints,
            objectives=objectives,
            constraints=constraints,
            evaluator=self
        )
        
        # Configure algorithm
        algorithm = NSGA2(pop_size=parameters.get('population_size', 100))
        
        # Run optimization
        result = pymoo_minimize(
            problem,
            algorithm,
            ('n_gen', parameters.get('max_generations', 200)),
            verbose=False
        )
        
        return {
            'solutions': result.X,
            'objectives': result.F,
            'constraints': result.G,
            'optimization_result': result
        }
    
    async def _weighted_sum_optimization(self, objectives: List[Dict], constraints: Dict,
                                       parameters: Dict, preferences: Dict) -> Dict[str, Any]:
        """Weighted sum method for multi-objective optimization"""
        
        # Determine weights
        weights = await self._determine_weights(objectives, preferences)
        
        # Define combined objective function
        def combined_objective(x):
            actual_params = self._denormalize_parameters(x, parameters)
            
            total_objective = 0.0
            for i, obj in enumerate(objectives):
                obj_value = self.evaluate_objective(obj, actual_params)
                total_objective += weights[i] * obj_value
            
            return total_objective
        
        # Define constraint functions
        constraint_funcs = self._create_constraint_functions(constraints, parameters)
        
        # Initial guess
        x0 = self._normalize_parameters(parameters)
        
        # Run optimization
        result = minimize(
            combined_objective,
            x0,
            method='SLSQP',
            constraints=constraint_funcs,
            bounds=[(0.0, 1.0)] * len(x0),
            options={'maxiter': parameters.get('max_iterations', 100)}
        )
        
        return {
            'solution': result.x,
            'objective_value': result.fun,
            'weights': weights,
            'optimization_result': result
        }
    
    async def _epsilon_constraint_optimization(self, objectives: List[Dict], constraints: Dict,
                                             parameters: Dict, preferences: Dict) -> Dict[str, Any]:
        """Epsilon-constraint method for multi-objective optimization"""
        
        # Select primary objective
        primary_obj = objectives[0]
        secondary_objs = objectives[1:]
        
        # Set epsilon values for secondary objectives
        epsilon_values = preferences.get('epsilon_values', [0.1] * len(secondary_objs))
        
        # Define constrained objective
        def constrained_objective(x):
            actual_params = self._denormalize_parameters(x, parameters)
            return self.evaluate_objective(primary_obj, actual_params)
        
        # Add epsilon constraints for secondary objectives
        all_constraints = constraints.copy()
        
        for i, obj in enumerate(secondary_objs):
            if i < len(epsilon_values):
                epsilon_constraint = {
                    f'epsilon_{i}': {
                        'type': 'inequality',
                        'expression': f'{epsilon_values[i]} - {obj.get("expression", "0")}',
                        'bound': 0.0
                    }
                }
                all_constraints.update(epsilon_constraint)
        
        # Create constraint functions
        constraint_funcs = self._create_constraint_functions(all_constraints, parameters)
        
        # Initial guess
        x0 = self._normalize_parameters(parameters)
        
        # Run optimization
        result = minimize(
            constrained_objective,
            x0,
            method='SLSQP',
            constraints=constraint_funcs,
            bounds=[(0.0, 1.0)] * len(x0)
        )
        
        return {
            'solution': result.x,
            'primary_objective': result.fun,
            'epsilon_values': epsilon_values,
            'optimization_result': result
        }
    
    async def _paretto_front_optimization(self, objectives: List[Dict], constraints: Dict,
                                        parameters: Dict, preferences: Dict) -> Dict[str, Any]:
        """Generate Paretto front for multi-objective problems"""
        
        # Generate multiple solutions using different weight combinations
        n_points = preferences.get('paretto_points', 20)
        paretto_solutions = []
        paretto_objectives = []
        
        for i in range(n_points):
            # Generate random weights
            weights = np.random.random(len(objectives))
            weights = weights / np.sum(weights)
            
            # Solve weighted problem
            preferences['weights'] = weights.tolist()
            
            solution = await self._weighted_sum_optimization(
                objectives, constraints, parameters, preferences
            )
            
            # Evaluate all objectives for this solution
            actual_params = self._denormalize_parameters(solution['solution'], parameters)
            obj_values = [self.evaluate_objective(obj, actual_params) for obj in objectives]
            
            paretto_solutions.append(solution['solution'])
            paretto_objectives.append(obj_values)
        
        # Filter non-dominated solutions
        non_dominated = self._filter_non_dominated_solutions(
            paretto_solutions, paretto_objectives
        )
        
        return {
            'paretto_solutions': non_dominated['solutions'],
            'paretto_objectives': non_dominated['objectives'],
            'total_points_generated': n_points,
            'non_dominated_points': len(non_dominated['solutions'])
        }
    
    async def _determine_weights(self, objectives: List[Dict], preferences: Dict) -> List[float]:
        """Determine weights for multi-objective optimization"""
        
        weight_method = preferences.get('weight_method', 'equal_weights')
        
        if weight_method not in self.preference_models:
            weight_method = 'equal_weights'
        
        weights = await self.preference_models[weight_method](objectives, preferences)
        return weights
    
    async def _equal_weights(self, objectives: List[Dict], preferences: Dict) -> List[float]:
        """Equal weights for all objectives"""
        
        n_objectives = len(objectives)
        return [1.0 / n_objectives] * n_objectives
    
    async def _user_defined_weights(self, objectives: List[Dict], preferences: Dict) -> List[float]:
        """User-defined weights"""
        
        user_weights = preferences.get('weights', [])
        
        if len(user_weights) == len(objectives):
            # Normalize weights
            total = sum(user_weights)
            return [w / total for w in user_weights]
        else:
            # Fallback to equal weights
            return await self._equal_weights(objectives, preferences)
    
    async def _entropy_based_weights(self, objectives: List[Dict], preferences: Dict) -> List[float]:
        """Entropy-based weight determination"""
        
        # This would analyze objective ranges and variability
        # For now, return equal weights
        return await self._equal_weights(objectives, preferences)
    
    async def _ahp_weights(self, objectives: List[Dict], preferences: Dict) -> List[float]:
        """Analytical Hierarchy Process weight determination"""
        
        # This would implement AHP for weight determination
        # For now, return equal weights
        return await self._equal_weights(objectives, preferences)
    
    def evaluate_objective(self, objective: Dict, parameters: Dict) -> float:
        """Evaluate a single objective function"""
        
        # Simplified implementation
        # In practice, this would call the actual objective evaluation
        expression = objective.get('expression', '0')
        
        try:
            # Evaluate expression with parameters
            # This is a placeholder - actual implementation would use symbolic evaluation
            return sum(parameters.values()) / len(parameters) if parameters else 0.0
        except:
            return 0.0
    
    def _normalize_parameters(self, parameters: Dict) -> np.ndarray:
        """Normalize parameters to [0, 1] range"""
        
        values = list(parameters.values())
        # Simple normalization - in practice, use parameter bounds
        max_val = max(values) if values else 1.0
        return np.array([v / max_val for v in values])
    
    def _denormalize_parameters(self, normalized: np.ndarray, original: Dict) -> Dict:
        """Denormalize parameters from [0, 1] range"""
        
        param_names = list(original.keys())
        max_val = max(original.values()) if original.values() else 1.0
        return {name: normalized[i] * max_val for i, name in enumerate(param_names)}
    
    def _create_constraint_functions(self, constraints: Dict, parameters: Dict) -> List[Dict]:
        """Create constraint functions for scipy optimization"""
        
        constraint_funcs = []
        
        for constr_name, constraint in constraints.items():
            constr_type = constraint.get('type', 'inequality')
            expression = constraint.get('expression', '0')
            bound = constraint.get('bound', 0.0)
            
            def constraint_func(x, expr=expression, b=bound):
                actual_params = self._denormalize_parameters(x, parameters)
                # Evaluate expression - placeholder
                value = sum(actual_params.values())  # Placeholder
                return b - value if constr_type == 'inequality' else value - b
            
            constraint_funcs.append({'type': 'inequality', 'fun': constraint_func})
        
        return constraint_funcs
    
    def _filter_non_dominated_solutions(self, solutions: List[np.ndarray], 
                                      objectives: List[List[float]]) -> Dict[str, Any]:
        """Filter non-dominated solutions (Paretto front)"""
        
        if not solutions:
            return {'solutions': [], 'objectives': []}
        
        non_dominated_solutions = []
        non_dominated_objectives = []
        
        for i, (sol, obj) in enumerate(zip(solutions, objectives)):
            is_dominated = False
            
            for j, (other_sol, other_obj) in enumerate(zip(solutions, objectives)):
                if i != j:
                    # Check if other solution dominates this one
                    dominates = all(other_obj[k] <= obj[k] for k in range(len(obj))) and \
                               any(other_obj[k] < obj[k] for k in range(len(obj)))
                    
                    if dominates:
                        is_dominated = True
                        break
            
            if not is_dominated:
                non_dominated_solutions.append(sol)
                non_dominated_objectives.append(obj)
        
        return {
            'solutions': non_dominated_solutions,
            'objectives': non_dominated_objectives
        }
    
    async def _generate_comprehensive_result(self, result: Dict[str, Any], 
                                           objectives: List[Dict],
                                           constraints: Dict,
                                           preferences: Dict) -> Dict[str, Any]:
        """Generate comprehensive multi-objective optimization result"""
        
        # Analyze trade-offs
        tradeoff_analysis = await self._analyze_tradeoffs(result, objectives)
        
        # Generate recommendations
        recommendations = await self._generate_multi_objective_recommendations(
            result, objectives, preferences
        )
        
        # Calculate quality metrics
        quality_metrics = self._calculate_quality_metrics(result, objectives)
        
        return {
            "optimization_results": result,
            "tradeoff_analysis": tradeoff_analysis,
            "quality_metrics": quality_metrics,
            "recommendations": recommendations,
            "preferences_used": preferences,
            "objectives_count": len(objectives),
            "constraints_count": len(constraints)
        }
    
    async def _analyze_tradeoffs(self, result: Dict[str, Any], 
                               objectives: List[Dict]) -> Dict[str, Any]:
        """Analyze trade-offs between objectives"""
        
        tradeoff_analysis = {
            "conflicting_objectives": [],
            "complementary_objectives": [],
            "tradeoff_strength": {},
            "sensitivity_analysis": {}
        }
        
        if 'paretto_objectives' in result:
            # Analyze Paretto front for trade-offs
            paretto_obj = np.array(result['paretto_objectives'])
            
            if len(paretto_obj) > 1:
                # Calculate correlation between objectives
                correlation_matrix = np.corrcoef(paretto_obj, rowvar=False)
                
                for i in range(len(objectives)):
                    for j in range(i + 1, len(objectives)):
                        correlation = correlation_matrix[i, j]
                        
                        if correlation < -0.5:
                            tradeoff_analysis["conflicting_objectives"].append(
                                f"{objectives[i].get('name', f'Objective_{i}')} vs "
                                f"{objectives[j].get('name', f'Objective_{j}')}"
                            )
                        elif correlation > 0.5:
                            tradeoff_analysis["complementary_objectives"].append(
                                f"{objectives[i].get('name', f'Objective_{i}')} vs "
                                f"{objectives[j].get('name', f'Objective_{j}')}"
                            )
                        
                        tradeoff_analysis["tradeoff_strength"][f"obj_{i}_vs_obj_{j}"] = \
                            abs(correlation)
        
        return tradeoff_analysis
    
    async def _generate_multi_objective_recommendations(self, result: Dict[str, Any],
                                                      objectives: List[Dict],
                                                      preferences: Dict) -> List[str]:
        """Generate recommendations for multi-objective optimization"""
        
        recommendations = []
        
        if 'paretto_solutions' in result:
            n_solutions = len(result['paretto_solutions'])
            recommendations.append(
                f"Generated {n_solutions} non-dominated solutions on Paretto front"
            )
            
            if n_solutions > 10:
                recommendations.append(
                    "Large Paretto front - consider preference-based selection"
                )
            elif n_solutions < 3:
                recommendations.append(
                    "Small Paretto front - objectives may be highly correlated"
                )
        
        if 'weights' in result:
            weights = result['weights']
            max_weight_idx = np.argmax(weights)
            recommendations.append(
                f"Highest weight given to: {objectives[max_weight_idx].get('name', f'Objective_{max_weight_idx}')}"
            )
        
        return recommendations
    
    def _calculate_quality_metrics(self, result: Dict[str, Any], 
                                 objectives: List[Dict]) -> Dict[str, float]:
        """Calculate quality metrics for multi-objective optimization"""
        
        metrics = {
            "diversity_index": 0.0,
            "convergence_metric": 0.0,
            "spread_metric": 0.0,
            "hypervolume": 0.0
        }
        
        if 'paretto_objectives' in result:
            paretto_obj = np.array(result['paretto_objectives'])
            
            if len(paretto_obj) > 1:
                # Calculate diversity (spacing metric)
                metrics["diversity_index"] = self._calculate_spacing_metric(paretto_obj)
                
                # Calculate spread (distribution metric)
                metrics["spread_metric"] = self._calculate_spread_metric(paretto_obj)
        
        return metrics
    
    def _calculate_spacing_metric(self, paretto_front: np.ndarray) -> float:
        """Calculate spacing metric for Paretto front diversity"""
        
        if len(paretto_front) < 2:
            return 0.0
        
        distances = []
        for i in range(len(paretto_front)):
            min_dist = float('inf')
            for j in range(len(paretto_front)):
                if i != j:
                    dist = np.linalg.norm(paretto_front[i] - paretto_front[j])
                    min_dist = min(min_dist, dist)
            distances.append(min_dist)
        
        avg_distance = np.mean(distances)
        spacing = np.sqrt(np.sum((distances - avg_distance) ** 2) / len(distances))
        
        return spacing
    
    def _calculate_spread_metric(self, paretto_front: np.ndarray) -> float:
        """Calculate spread metric for Paretto front distribution"""
        
        if len(paretto_front) < 3:
            return 0.0
        
        # Calculate extreme points
        d_f = np.linalg.norm(np.min(paretto_front, axis=0) - np.max(paretto_front, axis=0))
        
        if d_f == 0:
            return 0.0
        
        # Calculate distances between consecutive points
        sorted_front = paretto_front[np.lexsort(paretto_front.T)]
        consecutive_dists = [np.linalg.norm(sorted_front[i] - sorted_front[i+1]) 
                           for i in range(len(sorted_front)-1)]
        
        avg_consecutive = np.mean(consecutive_dists) if consecutive_dists else 0.0
        
        # Calculate spread
        numerator = sum(np.abs(d - avg_consecutive) for d in consecutive_dists)
        denominator = len(consecutive_dists) * avg_consecutive + d_f
        
        return numerator / denominator if denominator != 0 else 0.0
