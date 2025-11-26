import re
from typing import Dict, Any, List, Tuple
import numpy as np

from core.exceptions import PhysicsValidationError

class PhysicsValidator:
    """Validator for physical parameters and boundary conditions"""
    
    @staticmethod
    def validate_navier_stokes_params(params: Dict[str, Any]):
        required_fields = ['reynolds', 'density', 'viscosity']
        for field in required_fields:
            if field not in params:
                raise PhysicsValidationError(f"Missing parameter: {field}")
            
        if params['reynolds'] <= 0:
            raise PhysicsValidationError("Reynolds number must be positive")
            
        if params['density'] <= 0:
            raise PhysicsValidationError("Density must be positive")
            
        if params['viscosity'] <= 0:
            raise PhysicsValidationError("Viscosity must be positive")
            
    @staticmethod
    def validate_heat_transfer_params(params: Dict[str, Any]):
        required_fields = ['thermal_conductivity', 'specific_heat', 'density']
        for field in required_fields:
            if field not in params:
                raise PhysicsValidationError(f"Missing parameter: {field}")
                
        if any(params[field] <= 0 for field in required_fields):
            raise PhysicsValidationError("All thermal parameters must be positive")
            
    @staticmethod
    def validate_boundary_conditions(bc_config: Dict[str, Any]):
        valid_types = ['dirichlet', 'neumann', 'periodic', 'symmetry']
        
        for bc_name, bc_data in bc_config.items():
            bc_type = bc_data.get('type')
            if bc_type not in valid_types:
                raise PhysicsValidationError(
                    f"Invalid boundary condition type: {bc_type}. Must be one of {valid_types}"
                )
                
            if bc_type == 'dirichlet' and 'value' not in bc_data:
                raise PhysicsValidationError(f"Dirichlet condition {bc_name} must have a 'value'")
                
            if bc_type == 'neumann' and 'flux' not in bc_data:
                raise PhysicsValidationError(f"Neumann condition {bc_name} must have a 'flux'")
                
    @staticmethod
    def validate_mesh_config(mesh_config: Dict[str, Any]):
        if 'dimensions' not in mesh_config:
            raise PhysicsValidationError("Mesh configuration must include 'dimensions'")
            
        dims = mesh_config['dimensions']
        if any(d <= 0 for d in dims):
            raise PhysicsValidationError("Mesh dimensions must be positive")
            
        if 'resolution' in mesh_config:
            resolution = mesh_config['resolution']
            if any(r <= 0 for r in resolution):
                raise PhysicsValidationError("Mesh resolution must be positive")

class CodeValidator:
    """Scientific code validator"""
    
    @staticmethod
    def validate_fortran_syntax(code: str) -> Tuple[bool, List[str]]:
        """Validate Fortran syntax and return (is_valid, warnings)"""
        warnings = []
        
        # Basic Fortran structure patterns
        fortran_patterns = [
            r'program\s+\w+',
            r'subroutine\s+\w+',
            r'function\s+\w+',
            r'end\s+(program|subroutine|function)'
        ]
        
        for pattern in fortran_patterns:
            if not re.search(pattern, code, re.IGNORECASE):
                warnings.append(f"Missing Fortran structure: {pattern}")
        
        # Check for common issues
        if re.search(r'goto\s+\d+', code, re.IGNORECASE):
            warnings.append("GOTO statements detected - consider using modern control structures")
            
        if not re.search(r'implicit\s+none', code, re.IGNORECASE):
            warnings.append("IMPLICIT NONE missing - this can lead to typo-related bugs")
            
        return len(warnings) == 0, warnings
    
    @staticmethod
    def validate_python_syntax(code: str) -> Tuple[bool, List[str]]:
        """Validate Python syntax"""
        warnings = []
        try:
            compile(code, '<string>', 'exec')
        except SyntaxError as e:
            return False, [f"Syntax error: {e}"]
            
        return True, warnings
    
    @staticmethod
    def detect_potential_issues(code: str, language: str) -> List[str]:
        """Detect potential numerical or performance issues"""
        issues = []
        
        if language.lower() == 'fortran':
            # Check for single precision
            if re.search(r'real\s*::', code, re.IGNORECASE) and not re.search(r'real\s*\(\s*8\s*\)', code, re.IGNORECASE):
                issues.append("Consider using double precision (real(8)) for better numerical accuracy")
                
            # Check for potential array bound issues
            if re.search(r'do\s+\w+\s*=\s*\d+\s*,\s*\d+', code, re.IGNORECASE):
                issues.append("Verify array bounds in DO loops to prevent out-of-bounds errors")
                
        elif language.lower() == 'python':
            # Check for potential performance issues
            if re.search(r'for\s+\w+\s+in\s+range\(.*\):', code) and 'numpy' not in code:
                issues.append("Consider vectorizing loops with NumPy for better performance")
                
        return issues

class DataValidator:
    """Data validation utilities"""
    
    @staticmethod
    def validate_simulation_results(results: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate simulation results structure and values"""
        errors = []
        
        required_fields = ['velocity_field', 'pressure_field']
        for field in required_fields:
            if field not in results:
                errors.append(f"Missing required field: {field}")
                
        # Check for NaN or Inf values
        for field_name, field_data in results.items():
            if isinstance(field_data, (list, np.ndarray)):
                data_array = np.array(field_data)
                if np.any(np.isnan(data_array)):
                    errors.append(f"NaN values detected in {field_name}")
                if np.any(np.isinf(data_array)):
                    errors.append(f"Infinite values detected in {field_name}")
                    
        return len(errors) == 0, errors
