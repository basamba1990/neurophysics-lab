import re
from typing import Dict, Any, List, Tuple
import asyncio

from utils.logger import copilot_logger
from core.exceptions import CodeAnalysisError

class FortranModernizer:
    """Modernizer for Fortran to Python code conversion"""
    
    def __init__(self):
        self.conversion_patterns = {
            # Variable declarations
            r'real\s*::\s*(\w+)': r'\1 = 0.0',
            r'real\s*\(\s*8\s*\)\s*::\s*(\w+)': r'\1 = 0.0  # double precision',
            r'integer\s*::\s*(\w+)': r'\1 = 0',
            r'complex\s*::\s*(\w+)': r'\1 = 0+0j',
            r'double precision\s*::\s*(\w+)': r'\1 = 0.0  # double precision',
            
            # Array declarations
            r'real\s*,\s*dimension\s*\([^)]+\)\s*::\s*(\w+)': r'\1 = np.zeros(shape)  # array declaration',
            r'integer\s*,\s*dimension\s*\([^)]+\)\s*::\s*(\w+)': r'\1 = np.zeros(shape, dtype=int)',
            
            # Loops
            r'do\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)': r'for \1 in range(\2, \3+1):',
            r'do\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)': r'for \1 in range(\2, \3+1, \4):',
            r'end\s*do': r'    # end do',
            
            # Conditionals
            r'if\s*\((.*?)\)\s*then': r'if \1:',
            r'else\s*if\s*\((.*?)\)\s*then': r'elif \1:',
            r'else': r'else:',
            r'end\s*if': r'    # end if',
            
            # I/O operations
            r'read\s*\(\*,\*\)\s*(.*)': r'\1 = float(input())',
            r'print\s*\(\*,\*\)\s*(.*)': r'print(\1)',
            r'write\s*\(\*,\*\)\s*(.*)': r'print(\1)',
            r'open\s*\(\s*(\d+)\s*,\s*file\s*=\s*[\'"]([^\'"]+)[\'"]\s*\)': r'# File opened: \2',
            
            # Mathematical operations
            r'dsqrt\s*\((.*?)\)': r'np.sqrt(\1)',
            r'dexp\s*\((.*?)\)': r'np.exp(\1)',
            r'dlog\s*\((.*?)\)': r'np.log(\1)',
            r'dsin\s*\((.*?)\)': r'np.sin(\1)',
            r'dcos\s*\((.*?)\)': r'np.cos(\1)',
            
            # Common blocks (convert to class or global variables)
            r'common\s+/\s*(\w+)\s*/\s*([^/]+)': r'# Common block \1 converted to global variables',
            
            # Subroutine and function definitions
            r'subroutine\s+(\w+)\s*\((.*?)\)': r'def \1(\2):',
            r'function\s+(\w+)\s*\((.*?)\)': r'def \1(\2):',
            r'end\s*subroutine': r'    # end subroutine',
            r'end\s*function': r'    # end function'
        }
        
        self.scientific_libraries = {
            'numpy': ['array operations', 'linear algebra', 'mathematical functions'],
            'scipy': ['optimization', 'integration', 'differential equations'],
            'matplotlib': ['plotting and visualization'],
            'pandas': ['data analysis and manipulation'],
            'numba': ['JIT compilation for performance']
        }
        
        copilot_logger.info("FortranModernizer initialized")
    
    async def modernize_code(self, fortran_code: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Convert Fortran code to modern Python"""
        
        context = context or {}
        
        try:
            copilot_logger.info("Starting Fortran to Python modernization")
            
            # Basic conversion with regex patterns
            python_code = self._basic_conversion(fortran_code)
            
            # Structure analysis
            structure_analysis = self._analyze_fortran_structure(fortran_code)
            
            # GPT enhancement for better code quality
            improved_code = await self._gpt_enhancement(python_code, context, structure_analysis)
            
            # Performance optimization suggestions
            optimization_suggestions = self._generate_optimization_suggestions(fortran_code, improved_code)
            
            result = {
                "original_fortran": fortran_code,
                "modern_python": improved_code,
                "conversion_metrics": {
                    "lines_converted": len(fortran_code.split('\n')),
                    "structure_preserved": structure_analysis.get('structure_preserved', True),
                    "complexity_reduction": self._calculate_complexity_reduction(fortran_code, improved_code)
                },
                "warnings": self._validate_conversion(fortran_code, improved_code),
                "optimization_suggestions": optimization_suggestions,
                "library_recommendations": self._recommend_libraries(structure_analysis)
            }
            
            copilot_logger.info("Fortran modernization completed successfully")
            return result
            
        except Exception as e:
            copilot_logger.error(f"Fortran modernization failed: {e}")
            raise CodeAnalysisError(f"Modernization failed: {str(e)}")
    
    def _basic_conversion(self, fortran_code: str) -> str:
        """Basic conversion using regex patterns"""
        
        python_code = fortran_code
        
        # Apply conversion patterns
        for pattern, replacement in self.conversion_patterns.items():
            python_code = re.sub(pattern, replacement, python_code, flags=re.IGNORECASE)
        
        # Add Python imports
        python_code = self._add_python_imports() + "\n\n" + python_code
        
        # Fix indentation
        python_code = self._fix_indentation(python_code)
        
        return python_code
    
    def _add_python_imports(self) -> str:
        """Add necessary Python imports for scientific computing"""
        
        imports = [
            "import numpy as np",
            "import scipy as sp",
            "from scipy import optimize, integrate, linalg",
            "import matplotlib.pyplot as plt",
            "from typing import List, Tuple, Optional, Union",
            "import math",
            "# Additional imports may be needed based on specific functionality"
        ]
        
        return "\n".join(imports)
    
    def _fix_indentation(self, code: str) -> str:
        """Fix Python indentation"""
        
        lines = code.split('\n')
        indented_lines = []
        indent_level = 0
        
        for line in lines:
            # Strip leading/trailing whitespace
            stripped_line = line.strip()
            
            if not stripped_line:
                indented_lines.append('')
                continue
            
            # Check for decrease in indentation
            if any(stripped_line.startswith(keyword) for keyword in ['# end', 'end if', 'end do', 'end subroutine', 'end function']):
                indent_level = max(0, indent_level - 1)
            
            # Add current line with proper indentation
            indented_line = '    ' * indent_level + stripped_line
            indented_lines.append(indented_line)
            
            # Check for increase in indentation
            if any(stripped_line.endswith(keyword) for keyword in [':', 'then']) or \
               any(keyword in stripped_line for keyword in ['def ', 'class ', 'if ', 'for ', 'while ', 'elif ', 'else:']):
                indent_level += 1
        
        return '\n'.join(indented_lines)
    
    def _analyze_fortran_structure(self, fortran_code: str) -> Dict[str, Any]:
        """Analyze Fortran code structure"""
        
        analysis = {
            "programs": re.findall(r'program\s+(\w+)', fortran_code, re.IGNORECASE),
            "subroutines": re.findall(r'subroutine\s+(\w+)', fortran_code, re.IGNORECASE),
            "functions": re.findall(r'function\s+(\w+)', fortran_code, re.IGNORECASE),
            "common_blocks": re.findall(r'common\s+/\s*(\w+)\s*/', fortran_code, re.IGNORECASE),
            "modules": re.findall(r'module\s+(\w+)', fortran_code, re.IGNORECASE),
            "loops": len(re.findall(r'do\s+', fortran_code, re.IGNORECASE)),
            "conditionals": len(re.findall(r'if\s*\(', fortran_code, re.IGNORECASE)),
            "array_operations": len(re.findall(r'dimension\s*\(', fortran_code, re.IGNORECASE))
        }
        
        # Determine structure preservation
        analysis["structure_preserved"] = len(analysis["subroutines"]) > 0 or len(analysis["functions"]) > 0
        
        # Identify numerical methods
        analysis["numerical_methods"] = self._identify_numerical_methods(fortran_code)
        
        return analysis
    
    def _identify_numerical_methods(self, fortran_code: str) -> List[str]:
        """Identify numerical methods used in the code"""
        
        methods = []
        code_lower = fortran_code.lower()
        
        # Check for common numerical methods
        if any(keyword in code_lower for keyword in ['finite difference', 'finite element', 'finite volume']):
            methods.append("Finite difference/element/volume method")
        
        if 'runge-kutta' in code_lower:
            methods.append("Runge-Kutta integration")
        
        if any(keyword in code_lower for keyword in ['newton', 'bisection', 'secant']):
            methods.append("Root finding algorithm")
        
        if any(keyword in code_lower for keyword in ['jacobian', 'gradient', 'derivative']):
            methods.append("Derivative calculation")
        
        if any(keyword in code_lower for keyword in ['fft', 'fourier']):
            methods.append("Fourier transform")
        
        if any(keyword in code_lower for keyword in ['linear system', 'matrix solve']):
            methods.append("Linear system solver")
        
        return methods
    
    async def _gpt_enhancement(self, basic_python: str, context: Dict[str, Any], 
                             structure_analysis: Dict[str, Any]) -> str:
        """Enhance Python code with GPT"""
        
        from .gpt_wrapper import GPTWrapper
        
        gpt = GPTWrapper()
        
        enhancement_prompt = f"""
        Improve this Python code generated from Fortran:
        
        {basic_python}
        
        Original Fortran structure analysis:
        {structure_analysis}
        
        Context: {context}
        
        Please provide:
        1. Proper Pythonic code structure
        2. NumPy/SciPy replacements for mathematical operations
        3. Vectorization of loops where possible
        4. Proper documentation and type hints
        5. Error handling and input validation
        6. Performance optimizations
        
        Focus on making the code:
        - Readable and maintainable
        - Efficient and vectorized
        - Scientifically accurate
        - Pythonic in style
        """
        
        try:
            enhanced_code = await gpt.generate_completion(enhancement_prompt, context, "code_modernization")
            return self._extract_code_from_response(enhancement_prompt, enhanced_code)
        except Exception as e:
            copilot_logger.warning(f"GPT enhancement failed, using basic conversion: {e}")
            return basic_python
    
    def _extract_code_from_response(self, prompt: str, response: str) -> str:
        """Extract code from GPT response"""
        
        # Look for code blocks in the response
        code_blocks = re.findall(r'```(?:python)?\n(.*?)\n```', response, re.DOTALL)
        
        if code_blocks:
            return code_blocks[0]
        
        # If no code blocks found, try to extract indented code
        lines = response.split('\n')
        code_lines = []
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                continue
            
            if in_code_block or (line.startswith('    ') and line.strip()):
                code_lines.append(line)
        
        if code_lines:
            return '\n'.join(code_lines)
        
        # If no code found, return the original response
        return response
    
    def _generate_optimization_suggestions(self, original_fortran: str, modern_python: str) -> List[Dict[str, Any]]:
        """Generate performance optimization suggestions"""
        
        suggestions = []
        
        # Check for vectorization opportunities
        fortran_loops = len(re.findall(r'do\s+', original_fortran, re.IGNORECASE))
        python_loops = len(re.findall(r'for\s+\w+\s+in\s+', modern_python))
        
        if python_loops > 0 and 'numpy' in modern_python:
            suggestions.append({
                "type": "vectorization",
                "description": f"Found {python_loops} loops that could be vectorized with NumPy",
                "priority": "high",
                "example": "# Instead of: for i in range(n): x[i] = y[i] * 2\n# Use: x = y * 2"
            })
        
        # Check for memory usage optimization
        array_declarations = len(re.findall(r'np\.(zeros|ones|empty)', modern_python))
        if array_declarations > 10:
            suggestions.append({
                "type": "memory",
                "description": "Multiple large array allocations detected",
                "priority": "medium",
                "suggestion": "Consider using memory views or in-place operations"
            })
        
        # Check for numerical stability
        if any(op in modern_python for op in ['1e-10', '1e-8', 'epsilon']):
            suggestions.append({
                "type": "numerical_stability",
                "description": "Small constants detected for numerical stability",
                "priority": "low",
                "suggestion": "Consider using np.finfo(np.float64).eps for machine epsilon"
            })
        
        return suggestions
    
    def _recommend_libraries(self, structure_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommend Python libraries based on code analysis"""
        
        recommendations = []
        
        numerical_methods = structure_analysis.get("numerical_methods", [])
        has_arrays = structure_analysis.get("array_operations", 0) > 0
        
        # Always recommend NumPy for scientific computing
        recommendations.append({
            "library": "numpy",
            "purpose": "Array operations and mathematical functions",
            "necessity": "essential"
        })
        
        # Recommend based on numerical methods
        if any("Finite" in method for method in numerical_methods):
            recommendations.append({
                "library": "scipy",
                "purpose": "Differential equation solvers and sparse matrices",
                "necessity": "high"
            })
        
        if any("integration" in method.lower() for method in numerical_methods):
            recommendations.append({
                "library": "scipy.integrate",
                "purpose": "Numerical integration methods",
                "necessity": "high"
            })
        
        if any("Fourier" in method for method in numerical_methods):
            recommendations.append({
                "library": "numpy.fft",
                "purpose": "Fast Fourier Transform",
                "necessity": "high"
            })
        
        # Visualization recommendation
        if has_arrays:
            recommendations.append({
                "library": "matplotlib",
                "purpose": "Plotting and visualization of results",
                "necessity": "medium"
            })
        
        return recommendations
    
    def _calculate_complexity_reduction(self, fortran_code: str, python_code: str) -> float:
        """Calculate complexity reduction from conversion"""
        
        fortran_lines = len([l for l in fortran_code.split('\n') if l.strip()])
        python_lines = len([l for l in python_code.split('\n') if l.strip()])
        
        if fortran_lines == 0:
            return 0.0
        
        reduction = (fortran_lines - python_lines) / fortran_lines
        return max(0.0, min(1.0, reduction))
    
    def _validate_conversion(self, original: str, converted: str) -> List[str]:
        """Validate the conversion and return warnings"""
        
        warnings = []
        
        # Check for remaining Fortran patterns
        fortran_patterns = [
            r'program\s+\w+',
            r'subroutine\s+\w+',
            r'function\s+\w+',
            r'common\s+',
            r'goto\s+',
            r'do\s+\w+\s*='
        ]
        
        for pattern in fortran_patterns:
            if re.search(pattern, converted, re.IGNORECASE):
                warnings.append(f"Fortran pattern detected in converted code: {pattern}")
        
        # Check for potential issues in Python code
        if 'input()' in converted and 'float(input())' not in converted:
            warnings.append("Unvalidated input() detected - consider adding type validation")
        
        if 'print(' in converted and 'logging' not in converted:
            warnings.append("Consider using logging instead of print for production code")
        
        # Check for missing error handling
        if not any(keyword in converted for keyword in ['try:', 'except', 'raise']):
            warnings.append("No error handling detected - consider adding try-except blocks")
        
        return warnings
    
    async def batch_modernize(self, fortran_codes: List[str], contexts: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Modernize multiple Fortran codes in batch"""
        
        contexts = contexts or [{}] * len(fortran_codes)
        
        results = []
        
        for i, (code, context) in enumerate(zip(fortran_codes, contexts)):
            try:
                result = await self.modernize_code(code, context)
                result["batch_id"] = i
                results.append(result)
            except Exception as e:
                results.append({
                    "batch_id": i,
                    "error": str(e),
                    "original_fortran": code
                })
        
        return results
