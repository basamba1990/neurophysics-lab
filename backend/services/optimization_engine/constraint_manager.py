import numpy as np
from typing import Dict, Any, List, Tuple, Callable
import sympy as sp
from sympy import symbols, sympify, lambdify
import re

from utils.logger import optimization_logger
from core.exceptions import PhysicsValidationError

class ConstraintManager:
    """Advanced constraint management for engineering optimization"""
    
    def __init__(self):
        self.constraint_types = {
            'linear': self._handle_linear_constraint,
            'nonlinear': self._handle_nonlinear_constraint,
            'equality': self._handle_equality_constraint,
            'inequality': self._handle_inequality_constraint,
            'bound': self._handle_bound_constraint,
            'physics_based': self._handle_physics_constraint
        }
        
        self.constraint_cache = {}
        self.symbolic_engine = SymbolicConstraintEngine()
        
        optimization_logger.info("ConstraintManager initialized")
    
    async def validate_constraints(self, constraints: Dict[str, Any], 
                                 parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate constraint definitions and check feasibility"""
        
        validation_results = {}
        
        for constr_name, constraint in constraints.items():
            try:
                # Validate constraint structure
                is_valid, errors = self._validate_constraint_structure(constraint)
                
                if not is_valid:
                    validation_results[constr_name] = {
                        "valid": False,
                        "errors": errors
                    }
                    continue
                
                # Check constraint consistency
                consistency_check = await self._check_constraint_consistency(
                    constraint, parameters
                )
                
                # Evaluate constraint at initial point
                initial_feasibility = self._evaluate_constraint_feasibility(
                    constraint, parameters
                )
                
                validation_results[constr_name] = {
                    "valid": True,
                    "consistency": consistency_check,
                    "initial_feasibility": initial_feasibility,
                    "type": constraint.get('type', 'unknown'),
                    "expression": constraint.get('expression', '')
                }
                
            except Exception as e:
                validation_results[constr_name] = {
                    "valid": False,
                    "errors": [f"Validation error: {str(e)}"]
                }
        
        # Overall feasibility assessment
        overall_feasibility = self._assess_overall_feasibility(validation_results)
        
        return {
            "constraint_validation": validation_results,
            "overall_feasibility": overall_feasibility,
            "recommendations": self._generate_validation_recommendations(validation_results)
        }
    
    async def apply_constraints(self, parameters: Dict[str, Any], 
                              constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Apply constraints to parameters and return feasible solution"""
        
        try:
            # Convert parameters to array for processing
            param_vector = self._parameters_to_vector(parameters)
            
            # Apply bound constraints first
            bounded_vector = self._apply_bound_constraints(param_vector, constraints)
            
            # Apply linear constraints
            linear_feasible_vector = await self._apply_linear_constraints(
                bounded_vector, constraints
            )
            
            # Apply nonlinear constraints using projection
            feasible_vector = await self._apply_nonlinear_constraints(
                linear_feasible_vector, constraints, parameters
            )
            
            # Convert back to parameter dictionary
            feasible_parameters = self._vector_to_parameters(feasible_vector, parameters)
            
            # Calculate constraint violations
            violations = self._calculate_constraint_violations(
                feasible_parameters, constraints
            )
            
            return {
                "feasible_parameters": feasible_parameters,
                "constraint_violations": violations,
                "is_feasible": all(v <= 1e-6 for v in violations.values()),
                "applied_constraints": list(constraints.keys())
            }
            
        except Exception as e:
            optimization_logger.error(f"Constraint application failed: {e}")
            raise PhysicsValidationError(f"Constraint application failed: {str(e)}")
    
    def _validate_constraint_structure(self, constraint: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate constraint structure and syntax"""
        
        errors = []
        
        # Check required fields
        required_fields = ['type', 'expression']
        for field in required_fields:
            if field not in constraint:
                errors.append(f"Missing required field: {field}")
        
        # Validate constraint type
        valid_types = ['linear', 'nonlinear', 'equality', 'inequality', 'bound', 'physics_based']
        if constraint.get('type') not in valid_types:
            errors.append(f"Invalid constraint type. Must be one of: {valid_types}")
        
        # Validate expression syntax
        expression = constraint.get('expression', '')
        if expression:
            try:
                # Try to parse expression symbolically
                self.symbolic_engine.parse_expression(expression)
            except Exception as e:
                errors.append(f"Invalid expression syntax: {str(e)}")
        
        # Validate bounds for inequality constraints
        if constraint.get('type') in ['inequality', 'bound']:
            if 'bound' not in constraint:
                errors.append("Inequality constraints must include 'bound'")
        
        return len(errors) == 0, errors
    
    async def _check_constraint_consistency(self, constraint: Dict[str, Any], 
                                          parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Check constraint consistency and potential conflicts"""
        
        consistency_check = {
            "syntax_valid": True,
            "variables_defined": True,
            "dimension_consistent": True,
            "potential_conflicts": []
        }
        
        # Extract variables from expression
        expression = constraint.get('expression', '')
        variables = self.symbolic_engine.extract_variables(expression)
        
        # Check if all variables are defined in parameters
        undefined_vars = [var for var in variables if var not in parameters]
        if undefined_vars:
            consistency_check["variables_defined"] = False
            consistency_check["potential_conflicts"].append(
                f"Undefined variables: {undefined_vars}"
            )
        
        # Check for potential numerical issues
        if any(op in expression for op in ['/', 'log', 'sqrt']):
            consistency_check["potential_conflicts"].append(
                "Potential numerical instability in expression"
            )
        
        return consistency_check
    
    def _evaluate_constraint_feasibility(self, constraint: Dict[str, Any], 
                                       parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate constraint feasibility at given parameters"""
        
        expression = constraint.get('expression', '')
        constraint_type = constraint.get('type')
        bound = constraint.get('bound', 0.0)
        
        # Evaluate expression
        try:
            value = self.symbolic_engine.evaluate_expression(expression, parameters)
            
            # Check feasibility based on constraint type
            if constraint_type == 'equality':
                feasible = abs(value - bound) < 1e-6
                violation = abs(value - bound)
            elif constraint_type in ['inequality', 'bound']:
                feasible = value <= bound
                violation = max(0, value - bound)
            else:
                feasible = True
                violation = 0.0
            
            return {
                "value": value,
                "feasible": feasible,
                "violation": violation,
                "evaluated_at": parameters
            }
            
        except Exception as e:
            return {
                "value": None,
                "feasible": False,
                "violation": float('inf'),
                "error": str(e)
            }
    
    def _assess_overall_feasibility(self, validation_results: Dict[str, Any]) -> str:
        """Assess overall constraint feasibility"""
        
        valid_constraints = [
            result for result in validation_results.values() 
            if result.get('valid', False)
        ]
        
        if not valid_constraints:
            return "no_valid_constraints"
        
        feasible_constraints = [
            result for result in valid_constraints
            if result.get('initial_feasibility', {}).get('feasible', False)
        ]
        
        feasibility_ratio = len(feasible_constraints) / len(valid_constraints)
        
        if feasibility_ratio >= 0.9:
            return "highly_feasible"
        elif feasibility_ratio >= 0.7:
            return "moderately_feasible"
        elif feasibility_ratio >= 0.5:
            return "marginally_feasible"
        else:
            return "likely_infeasible"
    
    def _generate_validation_recommendations(self, validation_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on constraint validation"""
        
        recommendations = []
        
        # Check for invalid constraints
        invalid_constraints = [
            name for name, result in validation_results.items()
            if not result.get('valid', False)
        ]
        
        if invalid_constraints:
            recommendations.append(
                f"Fix {len(invalid_constraints)} invalid constraints: {', '.join(invalid_constraints)}"
            )
        
        # Check for infeasible constraints
        infeasible_constraints = [
            name for name, result in validation_results.items()
            if (result.get('valid', False) and 
                not result.get('initial_feasibility', {}).get('feasible', False))
        ]
        
        if infeasible_constraints:
            recommendations.append(
                f"Review {len(infeasible_constraints)} initially infeasible constraints"
            )
        
        # Check for potential conflicts
        conflicting_constraints = [
            name for name, result in validation_results.items()
            if result.get('consistency', {}).get('potential_conflicts', [])
        ]
        
        if conflicting_constraints:
            recommendations.append(
                f"Resolve potential conflicts in {len(conflicting_constraints)} constraints"
            )
        
        if not recommendations:
            recommendations.append("Constraints are well-defined and initially feasible")
        
        return recommendations
    
    def _parameters_to_vector(self, parameters: Dict[str, Any]) -> np.ndarray:
        """Convert parameters dictionary to vector"""
        
        return np.array(list(parameters.values()))
    
    def _vector_to_parameters(self, vector: np.ndarray, 
                            original_parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Convert vector back to parameters dictionary"""
        
        param_names = list(original_parameters.keys())
        return {name: vector[i] for i, name in enumerate(param_names)}
    
    def _apply_bound_constraints(self, vector: np.ndarray, 
                               constraints: Dict[str, Any]) -> np.ndarray:
        """Apply bound constraints to parameter vector"""
        
        bounded_vector = vector.copy()
        
        for constraint in constraints.values():
            if constraint.get('type') == 'bound' and 'variables' in constraint:
                for var_name, bounds in constraint['variables'].items():
                    # This would require mapping variable names to vector indices
                    # Simplified implementation
                    pass
        
        return bounded_vector
    
    async def _apply_linear_constraints(self, vector: np.ndarray, 
                                      constraints: Dict[str, Any]) -> np.ndarray:
        """Apply linear constraints using projection"""
        
        # Identify linear constraints
        linear_constraints = [
            constr for constr in constraints.values() 
            if constr.get('type') == 'linear'
        ]
        
        if not linear_constraints:
            return vector
        
        # This would implement linear constraint projection
        # For now, return original vector
        return vector
    
    async def _apply_nonlinear_constraints(self, vector: np.ndarray, 
                                         constraints: Dict[str, Any],
                                         parameters: Dict[str, Any]) -> np.ndarray:
        """Apply nonlinear constraints using iterative methods"""
        
        # Identify nonlinear constraints
        nonlinear_constraints = [
            constr for constr in constraints.values() 
            if constr.get('type') == 'nonlinear'
        ]
        
        if not nonlinear_constraints:
            return vector
        
        # Implement iterative projection for nonlinear constraints
        current_vector = vector.copy()
        max_iterations = 10
        tolerance = 1e-6
        
        for iteration in range(max_iterations):
            previous_vector = current_vector.copy()
            
            for constraint in nonlinear_constraints:
                # Project onto constraint manifold
                current_parameters = self._vector_to_parameters(current_vector, parameters)
                projected_parameters = await self._project_to_constraint(
                    constraint, current_parameters
                )
                current_vector = self._parameters_to_vector(projected_parameters)
            
            # Check convergence
            if np.linalg.norm(current_vector - previous_vector) < tolerance:
                break
        
        return current_vector
    
    async def _project_to_constraint(self, constraint: Dict[str, Any], 
                                   parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Project parameters onto constraint manifold"""
        
        # This would implement constraint projection
        # For now, return original parameters
        return parameters
    
    def _calculate_constraint_violations(self, parameters: Dict[str, Any], 
                                       constraints: Dict[str, Any]) -> Dict[str, float]:
        """Calculate constraint violations for given parameters"""
        
        violations = {}
        
        for constr_name, constraint in constraints.items():
            feasibility = self._evaluate_constraint_feasibility(constraint, parameters)
            violations[constr_name] = feasibility.get('violation', float('inf'))
        
        return violations
    
    def _handle_linear_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create linear constraint function"""
        
        def linear_constr(x):
            # Evaluate linear expression
            return 0.0  # Placeholder
        
        return linear_constr
    
    def _handle_nonlinear_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create nonlinear constraint function"""
        
        def nonlinear_constr(x):
            # Evaluate nonlinear expression
            return 0.0  # Placeholder
        
        return nonlinear_constr
    
    def _handle_equality_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create equality constraint function"""
        
        def equality_constr(x):
            return 0.0  # Placeholder
        
        return equality_constr
    
    def _handle_inequality_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create inequality constraint function"""
        
        def inequality_constr(x):
            return 0.0  # Placeholder
        
        return inequality_constr
    
    def _handle_bound_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create bound constraint function"""
        
        def bound_constr(x):
            return 0.0  # Placeholder
        
        return bound_constr
    
    def _handle_physics_constraint(self, constraint: Dict[str, Any]) -> Callable:
        """Create physics-based constraint function"""
        
        def physics_constr(x):
            return 0.0  # Placeholder
        
        return physics_constr

class SymbolicConstraintEngine:
    """Symbolic engine for constraint expression parsing and evaluation"""
    
    def __init__(self):
        self.symbol_cache = {}
        self.expression_cache = {}
    
    def parse_expression(self, expression: str) -> sp.Expr:
        """Parse mathematical expression symbolically"""
        
        if expression in self.expression_cache:
            return self.expression_cache[expression]
        
        try:
            # Convert common engineering notations
            normalized_expr = self._normalize_expression(expression)
            
            # Parse using sympy
            expr = sympify(normalized_expr)
            self.expression_cache[expression] = expr
            
            return expr
            
        except Exception as e:
            raise ValueError(f"Failed to parse expression '{expression}': {str(e)}")
    
    def extract_variables(self, expression: str) -> List[str]:
        """Extract variables from mathematical expression"""
        
        try:
            expr = self.parse_expression(expression)
            variables = [str(symbol) for symbol in expr.free_symbols]
            return sorted(variables)
        except:
            # Fallback: simple regex extraction
            return re.findall(r'[a-zA-Z_][a-zA-Z_0-9]*', expression)
    
    def evaluate_expression(self, expression: str, parameters: Dict[str, float]) -> float:
        """Evaluate expression with given parameters"""
        
        try:
            expr = self.parse_expression(expression)
            
            # Create substitution dictionary
            subs_dict = {}
            for symbol in expr.free_symbols:
                symbol_str = str(symbol)
                if symbol_str in parameters:
                    subs_dict[symbol] = parameters[symbol_str]
                else:
                    raise ValueError(f"Undefined variable: {symbol_str}")
            
            # Evaluate expression
            result = expr.evalf(subs=subs_dict)
            return float(result)
            
        except Exception as e:
            raise ValueError(f"Failed to evaluate expression: {str(e)}")
    
    def compute_gradient(self, expression: str, variables: List[str]) -> Dict[str, str]:
        """Compute symbolic gradient of expression"""
        
        try:
            expr = self.parse_expression(expression)
            gradient = {}
            
            for var in variables:
                symbol = symbols(var)
                derivative = sp.diff(expr, symbol)
                gradient[var] = str(derivative)
            
            return gradient
            
        except Exception as e:
            raise ValueError(f"Failed to compute gradient: {str(e)}")
    
    def _normalize_expression(self, expression: str) -> str:
        """Normalize engineering notation to mathematical notation"""
        
        # Replace engineering notations
        replacements = {
            r'\b(sin|cos|tan|log|exp|sqrt)\b': lambda m: m.group(0),  # Keep as is
            r'\^': '**',  # Power operator
            r'\.\*': '*',  # Element-wise multiplication (simplify)
            r'\./': '/',   # Element-wise division (simplify)
            r'\.\^': '**', # Element-wise power (simplify)
        }
        
        normalized = expression
        for pattern, replacement in replacements.items():
            if callable(replacement):
                normalized = re.sub(pattern, replacement, normalized)
            else:
                normalized = re.sub(pattern, replacement, normalized)
        
        return normalized
    
    def create_constraint_function(self, expression: str, 
                                 constraint_type: str) -> Callable:
        """Create numerical constraint function from symbolic expression"""
        
        try:
            expr = self.parse_expression(expression)
            variables = sorted([str(sym) for sym in expr.free_symbols])
            
            # Create lambda function
            lambda_func = lambdify(variables, expr, 'numpy')
            
            def constraint_func(x):
                if len(variables) == 1:
                    return lambda_func(x)
                else:
                    return lambda_func(**x)
            
            return constraint_func
            
        except Exception as e:
            raise ValueError(f"Failed to create constraint function: {str(e)}")
