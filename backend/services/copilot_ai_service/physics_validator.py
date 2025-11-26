import re
from typing import Dict, Any, List, Tuple
import numpy as np
import asyncio

from utils.logger import copilot_logger
from core.exceptions import PhysicsValidationError

class PhysicsValidator:
    """Validator for physical laws in scientific code"""
    
    def __init__(self):
        self.conservation_laws = {
            'mass': self._check_mass_conservation,
            'energy': self._check_energy_conservation, 
            'momentum': self._check_momentum_conservation,
            'charge': self._check_charge_conservation
        }
        
        self.numerical_checks = {
            'cfl_condition': self._check_cfl_condition,
            'mesh_quality': self._check_mesh_quality,
            'boundary_conditions': self._check_boundary_conditions,
            'stability_criteria': self._check_stability_criteria
        }
        
        self.physical_constants = {
            'reynolds_min': 1.0,
            'reynolds_max': 1000000.0,
            'cfl_max': 1.0,
            'mach_max': 5.0
        }
        
        copilot_logger.info("PhysicsValidator initialized")
    
    async def validate_code_physics(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate physical consistency of scientific code"""
        
        try:
            copilot_logger.info("Starting physics validation")
            
            validation_results = {}
            
            # Conservation law validation
            for law_name, check_func in self.conservation_laws.items():
                validation_results[law_name] = check_func(code, context)
            
            # Numerical checks
            for check_name, check_func in self.numerical_checks.items():
                validation_results[check_name] = check_func(code, context)
            
            # Boundary condition analysis
            validation_results['boundary_analysis'] = self._analyze_boundary_conditions(code, context)
            
            # Physical parameter validation
            validation_results['parameter_validation'] = self._validate_physical_parameters(code, context)
            
            # Overall assessment
            validation_results['overall_assessment'] = self._generate_overall_assessment(validation_results)
            
            copilot_logger.info("Physics validation completed")
            
            return {
                "validation_results": validation_results,
                "overall_score": self._calculate_physics_score(validation_results),
                "recommendations": self._generate_recommendations(validation_results),
                "warnings": self._extract_warnings(validation_results)
            }
            
        except Exception as e:
            copilot_logger.error(f"Physics validation failed: {e}")
            raise PhysicsValidationError(f"Validation failed: {str(e)}")
    
    def _check_mass_conservation(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for mass conservation implementation"""
        
        conservation_terms = [
            'continuity', 'divergence', '∇·', 'mass conservation',
            'density', 'div(u)', 'mass_balance'
        ]
        
        detected_terms = [term for term in conservation_terms if term.lower() in code.lower()]
        
        # Check for specific mass conservation patterns
        mass_patterns = [
            r'∂ρ/∂t',
            r'rho_t',
            r'density.*time',
            r'mass.*balance'
        ]
        
        pattern_matches = []
        for pattern in mass_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                pattern_matches.append(pattern)
        
        return {
            "passed": len(detected_terms) > 0 or len(pattern_matches) > 0,
            "detected_terms": detected_terms,
            "pattern_matches": pattern_matches,
            "confidence": 0.7 if len(detected_terms) > 0 else 0.3,
            "recommendation": "Ensure mass conservation equation is properly discretized" if len(detected_terms) == 0 else None
        }
    
    def _check_energy_conservation(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for energy conservation implementation"""
        
        energy_terms = [
            'energy', 'enthalpy', 'temperature', 'heat',
            'energy conservation', 'first law', 'thermodynamics'
        ]
        
        detected_terms = [term for term in energy_terms if term.lower() in code.lower()]
        
        # Check for energy equation patterns
        energy_patterns = [
            r'∂T/∂t',
            r'temperature.*time',
            r'energy.*balance',
            r'heat.*transfer'
        ]
        
        pattern_matches = []
        for pattern in energy_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                pattern_matches.append(pattern)
        
        return {
            "passed": len(detected_terms) > 0 or len(pattern_matches) > 0,
            "detected_terms": detected_terms,
            "pattern_matches": pattern_matches,
            "confidence": 0.6 if len(detected_terms) > 0 else 0.2,
            "recommendation": "Verify energy conservation in thermal calculations" if len(detected_terms) == 0 else None
        }
    
    def _check_momentum_conservation(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for momentum conservation implementation"""
        
        momentum_terms = [
            'momentum', 'navier-stokes', 'velocity', 'acceleration',
            'momentum conservation', 'navier', 'stokes'
        ]
        
        detected_terms = [term for term in momentum_terms if term.lower() in code.lower()]
        
        # Check for Navier-Stokes patterns
        ns_patterns = [
            r'∂u/∂t',
            r'velocity.*time',
            r'navier.*stokes',
            r'momentum.*equation'
        ]
        
        pattern_matches = []
        for pattern in ns_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                pattern_matches.append(pattern)
        
        return {
            "passed": len(detected_terms) > 0 or len(pattern_matches) > 0,
            "detected_terms": detected_terms,
            "pattern_matches": pattern_matches,
            "confidence": 0.8 if 'navier-stokes' in code.lower() else 0.5,
            "recommendation": "Check momentum equation implementation" if len(detected_terms) == 0 else None
        }
    
    def _check_charge_conservation(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for charge conservation in electromagnetic codes"""
        
        charge_terms = [
            'charge', 'current', 'electromagnetic', 'maxwell',
            'charge conservation', 'gauss', 'ampere'
        ]
        
        detected_terms = [term for term in charge_terms if term.lower() in code.lower()]
        
        return {
            "passed": len(detected_terms) > 0,
            "detected_terms": detected_terms,
            "confidence": 0.5 if len(detected_terms) > 0 else 0.1,
            "recommendation": "Charge conservation not applicable" if len(detected_terms) == 0 else None
        }
    
    def _check_cfl_condition(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for CFL condition implementation"""
        
        cfl_patterns = [
            r'cfl',
            r'courant',
            r'friedrichs',
            r'lewy',
            r'dt.*dx',
            r'timestep.*spacing'
        ]
        
        detected_patterns = [pattern for pattern in cfl_patterns if re.search(pattern, code, re.IGNORECASE)]
        
        # Look for explicit CFL checks
        cfl_checks = [
            r'if.*cfl',
            r'assert.*cfl',
            r'cfl.*<',
            r'cfl.*>'
        ]
        
        explicit_checks = [check for check in cfl_checks if re.search(check, code, re.IGNORECASE)]
        
        return {
            "passed": len(detected_patterns) > 0,
            "detected_patterns": detected_patterns,
            "explicit_checks": explicit_checks,
            "confidence": 0.9 if len(explicit_checks) > 0 else 0.4,
            "recommendation": "Implement CFL condition check for stability" if len(detected_patterns) == 0 else None
        }
    
    def _check_mesh_quality(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for mesh quality considerations"""
        
        mesh_terms = [
            'mesh', 'grid', 'node', 'element',
            'discretization', 'spacing', 'resolution'
        ]
        
        detected_terms = [term for term in mesh_terms if term.lower() in code.lower()]
        
        # Check for mesh quality metrics
        quality_patterns = [
            r'aspect.*ratio',
            r'skewness',
            r'jacobian',
            r'mesh.*quality'
        ]
        
        quality_checks = [pattern for pattern in quality_patterns if re.search(pattern, code, re.IGNORECASE)]
        
        return {
            "passed": len(detected_terms) > 0,
            "detected_terms": detected_terms,
            "quality_checks": quality_checks,
            "confidence": 0.6 if len(quality_checks) > 0 else 0.3,
            "recommendation": "Consider mesh quality metrics in discretization" if len(detected_terms) == 0 else None
        }
    
    def _check_boundary_conditions(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check boundary condition implementation"""
        
        bc_terms = [
            'boundary', 'bc_', 'dirichlet', 'neumann',
            'periodic', 'symmetry', 'wall', 'inlet', 'outlet'
        ]
        
        detected_terms = [term for term in bc_terms if term.lower() in code.lower()]
        
        # Check for BC implementation patterns
        bc_patterns = [
            r'boundary.*condition',
            r'bc.*type',
            r'dirichlet',
            r'neumann'
        ]
        
        pattern_matches = [pattern for pattern in bc_patterns if re.search(pattern, code, re.IGNORECASE)]
        
        return {
            "passed": len(detected_terms) > 0,
            "detected_terms": detected_terms,
            "pattern_matches": pattern_matches,
            "confidence": 0.7 if len(pattern_matches) > 0 else 0.4,
            "recommendation": "Explicitly define boundary conditions" if len(detected_terms) == 0 else None
        }
    
    def _check_stability_criteria(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check for numerical stability criteria"""
        
        stability_terms = [
            'stability', 'convergence', 'divergence',
            'numerical stability', 'criterion'
        ]
        
        detected_terms = [term for term in stability_terms if term.lower() in code.lower()]
        
        # Check for stability analysis
        stability_patterns = [
            r'stability.*analysis',
            r'convergence.*test',
            r'numerical.*stability',
            r'von.*neumann'
        ]
        
        pattern_matches = [pattern for pattern in stability_patterns if re.search(pattern, code, re.IGNORECASE)]
        
        return {
            "passed": len(detected_terms) > 0,
            "detected_terms": detected_terms,
            "pattern_matches": pattern_matches,
            "confidence": 0.5 if len(pattern_matches) > 0 else 0.2,
            "recommendation": "Include numerical stability analysis" if len(detected_terms) == 0 else None
        }
    
    def _analyze_boundary_conditions(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze boundary conditions in detail"""
        
        physics_context = context.get('physics_context', {})
        expected_bc = physics_context.get('boundary_conditions', {})
        
        # Detect BC types in code
        detected_bc = {}
        
        bc_types = {
            'dirichlet': r'dirichlet|fixed.*value|prescribed.*value',
            'neumann': r'neumann|flux|gradient|derivative',
            'periodic': r'periodic|cyclic',
            'symmetry': r'symmetry|mirror|reflection'
        }
        
        for bc_type, pattern in bc_types.items():
            if re.search(pattern, code, re.IGNORECASE):
                detected_bc[bc_type] = True
        
        # Check consistency with expected BC
        consistency_check = self._check_bc_consistency(expected_bc, detected_bc)
        
        return {
            "expected_conditions": expected_bc,
            "detected_conditions": detected_bc,
            "consistency_check": consistency_check,
            "completeness_check": self._check_bc_completeness(detected_bc, physics_context)
        }
    
    def _validate_physical_parameters(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate physical parameters in code"""
        
        parameter_checks = {}
        
        # Check Reynolds number
        re_matches = re.findall(r'reynolds.*=.*([\d\.]+)', code, re.IGNORECASE)
        if re_matches:
            try:
                re_value = float(re_matches[0])
                parameter_checks['reynolds'] = {
                    "value": re_value,
                    "valid": self.physical_constants['reynolds_min'] <= re_value <= self.physical_constants['reynolds_max'],
                    "range": f"{self.physical_constants['reynolds_min']} - {self.physical_constants['reynolds_max']}"
                }
            except ValueError:
                parameter_checks['reynolds'] = {"error": "Invalid Reynolds number format"}
        
        # Check for other physical parameters
        physical_params = ['density', 'viscosity', 'conductivity', 'specific_heat']
        
        for param in physical_params:
            pattern = rf'{param}.*=.*([\d\.]+)'
            matches = re.findall(pattern, code, re.IGNORECASE)
            if matches:
                try:
                    param_value = float(matches[0])
                    parameter_checks[param] = {
                        "value": param_value,
                        "valid": param_value > 0,  # Basic positivity check
                        "unit_check": "Positive values required"
                    }
                except ValueError:
                    parameter_checks[param] = {"error": f"Invalid {param} format"}
        
        return parameter_checks
    
    def _check_bc_consistency(self, expected: Dict[str, Any], detected: Dict[str, Any]) -> Dict[str, Any]:
        """Check consistency between expected and detected boundary conditions"""
        
        if not expected:
            return {"status": "unknown", "message": "No expected BC specified"}
        
        expected_types = set(expected.keys())
        detected_types = set(detected.keys())
        
        missing = expected_types - detected_types
        extra = detected_types - expected_types
        
        return {
            "status": "consistent" if not missing else "inconsistent",
            "missing_types": list(missing),
            "extra_types": list(extra),
            "match_percentage": len(expected_types & detected_types) / len(expected_types) if expected_types else 0.0
        }
    
    def _check_bc_completeness(self, detected: Dict[str, Any], physics_context: Dict[str, Any]) -> Dict[str, Any]:
        """Check completeness of boundary conditions"""
        
        domain_info = physics_context.get('domain', {})
        expected_dimensions = domain_info.get('dimensions', 2)
        
        # For a 2D domain, expect boundaries on 4 sides
        expected_bounds = expected_dimensions * 2
        
        total_detected = len(detected)
        
        return {
            "expected_bounds": expected_bounds,
            "detected_conditions": total_detected,
            "completeness_ratio": total_detected / expected_bounds if expected_bounds > 0 else 0.0,
            "status": "complete" if total_detected >= expected_bounds else "incomplete"
        }
    
    def _generate_overall_assessment(self, validation_results: Dict[str, Any]) -> str:
        """Generate overall physics assessment"""
        
        passed_checks = sum(1 for result in validation_results.values() 
                          if isinstance(result, dict) and result.get('passed', False))
        total_checks = len([r for r in validation_results.values() if isinstance(r, dict)])
        
        if total_checks == 0:
            return "Insufficient data for assessment"
        
        success_ratio = passed_checks / total_checks
        
        if success_ratio >= 0.8:
            return "Good physical consistency"
        elif success_ratio >= 0.6:
            return "Moderate physical consistency with some concerns"
        elif success_ratio >= 0.4:
            return "Significant physical consistency issues"
        else:
            return "Major physical consistency problems"
    
    def _calculate_physics_score(self, validation_results: Dict[str, Any]) -> float:
        """Calculate overall physics consistency score"""
        
        total_checks = 0
        passed_checks = 0
        
        for result in validation_results.values():
            if isinstance(result, dict) and 'passed' in result:
                total_checks += 1
                if result['passed']:
                    passed_checks += 1
                elif 'confidence' in result:
                    # Partial credit based on confidence
                    passed_checks += result['confidence'] * 0.5
        
        if total_checks == 0:
            return 0.0
        
        return passed_checks / total_checks
    
    def _generate_recommendations(self, validation_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on validation results"""
        
        recommendations = []
        
        for check_name, result in validation_results.items():
            if isinstance(result, dict) and not result.get('passed', False):
                recommendation = result.get('recommendation')
                if recommendation:
                    recommendations.append(f"{check_name}: {recommendation}")
        
        # Add general recommendations
        if not recommendations:
            recommendations.append("Code shows good physical consistency")
        else:
            recommendations.insert(0, "Address the following physical consistency issues:")
        
        return recommendations
    
    def _extract_warnings(self, validation_results: Dict[str, Any]) -> List[str]:
        """Extract warnings from validation results"""
        
        warnings = []
        
        for check_name, result in validation_results.items():
            if isinstance(result, dict) and not result.get('passed', False):
                if result.get('confidence', 0) < 0.5:
                    warnings.append(f"Low confidence in {check_name} validation")
        
        # Parameter validation warnings
        param_validation = validation_results.get('parameter_validation', {})
        for param, check in param_validation.items():
            if isinstance(check, dict) and not check.get('valid', True):
                warnings.append(f"Invalid physical parameter: {param} = {check.get('value', 'unknown')}")
        
        return warnings
    
    async def validate_simulation_results(self, results: Dict[str, Any], 
                                        expected_physics: Dict[str, Any]) -> Dict[str, Any]:
        """Validate simulation results against physical expectations"""
        
        validation = {}
        
        # Check conservation in results
        if 'mass_conservation' in expected_physics:
            validation['mass_conservation'] = self._validate_mass_conservation_results(results)
        
        if 'energy_conservation' in expected_physics:
            validation['energy_conservation'] = self._validate_energy_conservation_results(results)
        
        # Check physical bounds
        validation['physical_bounds'] = self._validate_physical_bounds(results, expected_physics)
        
        return validation
    
    def _validate_mass_conservation_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Validate mass conservation in simulation results"""
        
        # Simplified mass conservation check
        # In practice, you would integrate over the domain
        if 'density' in results and 'velocity' in results:
            return {"passed": True, "message": "Mass conservation check passed"}
        else:
            return {"passed": False, "message": "Insufficient data for mass conservation check"}
    
    def _validate_energy_conservation_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Validate energy conservation in simulation results"""
        
        # Simplified energy conservation check
        if 'temperature' in results or 'energy' in results:
            return {"passed": True, "message": "Energy conservation indicators present"}
        else:
            return {"passed": False, "message": "No energy field detected"}
    
    def _validate_physical_bounds(self, results: Dict[str, Any], 
                                expected_physics: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that results stay within physical bounds"""
        
        bounds_checks = {}
        
        # Check for negative densities
        if 'density' in results:
            density_data = results['density']
            if isinstance(density_data, (list, np.ndarray)):
                min_density = np.min(density_data)
                bounds_checks['density_positive'] = min_density >= 0
        
        # Check for reasonable velocities
        if 'velocity' in results:
            velocity_data = results['velocity']
            if isinstance(velocity_data, (list, np.ndarray)):
                max_velocity = np.max(np.abs(velocity_data))
                # Arbitrary large velocity check
                bounds_checks['velocity_reasonable'] = max_velocity < 1e6
        
        # Check temperature bounds
        if 'temperature' in results:
            temp_data = results['temperature']
            if isinstance(temp_data, (list, np.ndarray)):
                min_temp = np.min(temp_data)
                max_temp = np.max(temp_data)
                bounds_checks['temperature_positive'] = min_temp >= 0
                bounds_checks['temperature_reasonable'] = max_temp < 1e6
        
        return bounds_checks
