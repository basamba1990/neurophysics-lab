import re
from typing import Dict, Any, List, Tuple
import ast
import warnings

from .gpt_wrapper import GPTWrapper
from utils.logger import copilot_logger
from utils.validators import CodeValidator
from core.exceptions import CodeAnalysisError

class CodeAnalyzer:
    """Scientific code analyzer with physical validation"""
    
    def __init__(self, gpt_wrapper: GPTWrapper):
        self.gpt_wrapper = gpt_wrapper
        self.language_parsers = {
            'fortran': self._parse_fortran,
            'cpp': self._parse_cpp,
            'python': self._parse_python,
            'matlab': self._parse_matlab
        }
        
        copilot_logger.info("CodeAnalyzer initialized")
    
    async def analyze_code(self, code: str, language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Complete scientific code analysis"""
        
        context = context or {}
        
        try:
            # Basic syntax analysis
            syntax_analysis = self._analyze_syntax(code, language)
            
            # Physics validation via GPT
            physics_analysis = await self.gpt_wrapper.analyze_code_physics(code, context)
            
            # Performance analysis
            performance_analysis = await self._analyze_performance(code, language, context)
            
            # Generate improvement suggestions
            suggestions = await self._generate_suggestions(code, language, context)
            
            # Combine all analyses
            combined_analysis = {
                "syntax_analysis": syntax_analysis,
                "physics_validation": physics_analysis,
                "performance_analysis": performance_analysis,
                "suggestions": suggestions,
                "warnings": self._combine_warnings(syntax_analysis, physics_analysis, performance_analysis),
                "confidence_score": self._calculate_confidence(syntax_analysis, physics_analysis, performance_analysis),
                "overall_assessment": self._generate_overall_assessment(syntax_analysis, physics_analysis)
            }
            
            copilot_logger.info(f"Code analysis completed for {language} code")
            
            return combined_analysis
            
        except Exception as e:
            copilot_logger.error(f"Code analysis failed: {e}")
            raise CodeAnalysisError(f"Analysis failed: {str(e)}")
    
    def _analyze_syntax(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code syntax and structure"""
        
        parser = self.language_parsers.get(language.lower(), self._parse_generic)
        return parser(code)
    
    def _parse_fortran(self, code: str) -> Dict[str, Any]:
        """Parse Fortran code structure"""
        
        analysis = {
            "language": "fortran",
            "has_program_structure": bool(re.search(r'program\s+\w+', code, re.IGNORECASE)),
            "has_subroutines": bool(re.search(r'subroutine\s+\w+', code, re.IGNORECASE)),
            "has_functions": bool(re.search(r'function\s+\w+', code, re.IGNORECASE)),
            "common_blocks": len(re.findall(r'common\s+', code, re.IGNORECASE)),
            "goto_statements": len(re.findall(r'goto\s+', code, re.IGNORECASE)),
            "implicit_none": bool(re.search(r'implicit\s+none', code, re.IGNORECASE)),
            "precision_specification": self._analyze_fortran_precision(code),
            "array_usage": self._analyze_fortran_arrays(code)
        }
        
        # Validate syntax
        is_valid, syntax_warnings = CodeValidator.validate_fortran_syntax(code)
        analysis["syntax_valid"] = is_valid
        analysis["syntax_warnings"] = syntax_warnings
        
        # Detect potential issues
        analysis["potential_issues"] = CodeValidator.detect_potential_issues(code, "fortran")
        
        return analysis
    
    def _parse_python(self, code: str) -> Dict[str, Any]:
        """Parse Python code structure"""
        
        analysis = {
            "language": "python",
            "syntax_valid": False,
            "imports": [],
            "functions": [],
            "classes": [],
            "potential_issues": []
        }
        
        try:
            # Parse Python AST
            tree = ast.parse(code)
            
            analysis["syntax_valid"] = True
            analysis["imports"] = self._extract_python_imports(tree)
            analysis["functions"] = self._extract_python_functions(tree)
            analysis["classes"] = self._extract_python_classes(tree)
            
            # Validate syntax
            _, syntax_warnings = CodeValidator.validate_python_syntax(code)
            analysis["syntax_warnings"] = syntax_warnings
            
            # Detect potential issues
            analysis["potential_issues"] = CodeValidator.detect_potential_issues(code, "python")
            
        except SyntaxError as e:
            analysis["syntax_error"] = str(e)
            analysis["syntax_warnings"] = [f"Syntax error: {e}"]
        
        return analysis
    
    def _parse_cpp(self, code: str) -> Dict[str, Any]:
        """Parse C++ code structure"""
        
        analysis = {
            "language": "cpp",
            "has_main_function": bool(re.search(r'int\s+main\s*\(', code)),
            "has_classes": bool(re.search(r'class\s+\w+', code)),
            "has_templates": bool(re.search(r'template\s*<', code)),
            "pointer_usage": len(re.findall(r'[*&]', code)),
            "potential_issues": CodeValidator.detect_potential_issues(code, "cpp")
        }
        
        return analysis
    
    def _parse_matlab(self, code: str) -> Dict[str, Any]:
        """Parse MATLAB code structure"""
        
        analysis = {
            "language": "matlab",
            "has_function_definition": bool(re.search(r'function\s+', code, re.IGNORECASE)),
            "matrix_operations": len(re.findall(r'\.*\*|\.*/|\.*\^', code)),
            "loop_structures": len(re.findall(r'for\s+|while\s+', code, re.IGNORECASE)),
            "potential_issues": CodeValidator.detect_potential_issues(code, "matlab")
        }
        
        return analysis
    
    def _parse_generic(self, code: str) -> Dict[str, Any]:
        """Generic parser for unsupported languages"""
        
        return {
            "language": "unknown",
            "structure": "generic",
            "warning": "Language not specifically supported, using generic analysis"
        }
    
    def _analyze_fortran_precision(self, code: str) -> Dict[str, Any]:
        """Analyze Fortran precision specifications"""
        
        precision_analysis = {
            "single_precision": bool(re.search(r'real\s*::', code, re.IGNORECASE)),
            "double_precision": bool(re.search(r'real\s*\(\s*8\s*\)', code, re.IGNORECASE)),
            "kind_parameter": bool(re.search(r'real\s*\(\s*kind\s*=', code, re.IGNORECASE))
        }
        
        return precision_analysis
    
    def _analyze_fortran_arrays(self, code: str) -> Dict[str, Any]:
        """Analyze Fortran array usage"""
        
        array_analysis = {
            "static_arrays": len(re.findall(r'dimension\s*\([^)]+\)', code, re.IGNORECASE)),
            "dynamic_arrays": len(re.findall(r'allocate\s*\(', code, re.IGNORECASE)),
            "array_operations": len(re.findall(r'array\s*\([^)]+\)', code, re.IGNORECASE))
        }
        
        return array_analysis
    
    def _extract_python_imports(self, tree: ast.AST) -> List[str]:
        """Extract Python imports from AST"""
        
        imports = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(f"import {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for alias in node.names:
                    imports.append(f"from {module} import {alias.name}")
        
        return imports
    
    def _extract_python_functions(self, tree: ast.AST) -> List[str]:
        """Extract Python function definitions"""
        
        functions = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append(node.name)
        
        return functions
    
    def _extract_python_classes(self, tree: ast.AST) -> List[str]:
        """Extract Python class definitions"""
        
        classes = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append(node.name)
        
        return classes
    
    async def _analyze_performance(self, code: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze code performance characteristics"""
        
        performance_analysis = {
            "vectorization_potential": self._assess_vectorization_potential(code, language),
            "memory_usage": self._estimate_memory_usage(code, language),
            "computational_complexity": self._estimate_complexity(code, language),
            "parallelization_opportunities": self._identify_parallelization_opportunities(code, language)
        }
        
        # Get detailed performance optimization suggestions from GPT
        if len(code) > 100:  # Only for substantial code
            try:
                gpt_performance = await self.gpt_wrapper.optimize_code_performance(code, context)
                performance_analysis["ai_suggestions"] = gpt_performance
            except Exception as e:
                copilot_logger.warning(f"GPT performance analysis failed: {e}")
                performance_analysis["ai_suggestions"] = {"error": "AI analysis unavailable"}
        
        return performance_analysis
    
    def _assess_vectorization_potential(self, code: str, language: str) -> str:
        """Assess vectorization potential"""
        
        if language.lower() in ['fortran', 'matlab']:
            # These languages often have good vectorization
            loops = len(re.findall(r'do\s+', code, re.IGNORECASE)) if language == 'fortran' else \
                   len(re.findall(r'for\s+', code, re.IGNORECASE))
            
            if loops > 10:
                return "high"
            elif loops > 5:
                return "medium"
            else:
                return "low"
        
        elif language.lower() == 'python':
            # Check for explicit loops that could be vectorized
            loops = len(re.findall(r'for\s+\w+\s+in\s+', code))
            if loops > 5 and 'numpy' not in code.lower():
                return "high"
            else:
                return "medium"
        
        else:
            return "unknown"
    
    def _estimate_memory_usage(self, code: str, language: str) -> str:
        """Estimate memory usage pattern"""
        
        # Simple heuristic based on array declarations
        array_patterns = {
            'fortran': r'dimension\s*\([^)]+\)',
            'python': r'\[\s*\]|np\.array|np\.zeros|np\.ones',
            'cpp': r'\[\s*\d+\s*\]|std::vector|new\s+',
            'matlab': r'zeros\s*\(|ones\s*\('
        }
        
        pattern = array_patterns.get(language.lower(), '')
        if pattern:
            array_declarations = len(re.findall(pattern, code, re.IGNORECASE))
            
            if array_declarations > 10:
                return "high"
            elif array_declarations > 5:
                return "medium"
            else:
                return "low"
        
        return "unknown"
    
    def _estimate_complexity(self, code: str, language: str) -> str:
        """Estimate computational complexity"""
        
        # Count nested loops as a complexity indicator
        loop_keywords = {
            'fortran': ['do', 'do while'],
            'python': ['for', 'while'],
            'cpp': ['for', 'while'],
            'matlab': ['for', 'while']
        }
        
        keywords = loop_keywords.get(language.lower(), [])
        total_loops = sum(len(re.findall(keyword, code, re.IGNORECASE)) for keyword in keywords)
        
        if total_loops > 15:
            return "high"
        elif total_loops > 8:
            return "medium"
        else:
            return "low"
    
    def _identify_parallelization_opportunities(self, code: str, language: str) -> List[str]:
        """Identify parallelization opportunities"""
        
        opportunities = []
        
        # Check for obvious parallel patterns
        if language.lower() == 'fortran':
            if re.search(r'do\s+', code, re.IGNORECASE):
                opportunities.append("DO loops can be parallelized with OpenMP")
        
        elif language.lower() == 'python':
            if re.search(r'for\s+\w+\s+in\s+', code) and 'numpy' not in code.lower():
                opportunities.append("Loops can be parallelized with multiprocessing or numba")
        
        elif language.lower() == 'cpp':
            if re.search(r'for\s*\(', code):
                opportunities.append("Loops can be parallelized with OpenMP or TBB")
        
        return opportunities
    
    async def _generate_suggestions(self, code: str, language: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate improvement suggestions"""
        
        prompt = f"""
        Analyze this {language} code and provide concrete improvement suggestions:
        
        {code}
        
        Context: {context}
        
        Focus on:
        1. Code modernization and best practices
        2. Performance optimization
        3. Numerical stability improvements
        4. Maintainability enhancements
        5. Physical consistency verification
        """
        
        suggestions_text = await self.gpt_wrapper.generate_completion(
            prompt, context, "code_modernization"
        )
        
        return [{
            "category": "code_improvement",
            "suggestion": suggestions_text,
            "confidence": 0.8,
            "implementation_complexity": "medium"
        }]
    
    def _combine_warnings(self, syntax_analysis: Dict[str, Any], 
                         physics_analysis: Dict[str, Any],
                         performance_analysis: Dict[str, Any]) -> List[str]:
        """Combine warnings from different analyses"""
        
        warnings = []
        
        # Syntax warnings
        if 'syntax_warnings' in syntax_analysis:
            warnings.extend(syntax_analysis['syntax_warnings'])
        
        # Physics warnings
        if 'warnings' in physics_analysis:
            warnings.extend(physics_analysis['warnings'])
        
        # Performance warnings
        if performance_analysis.get('vectorization_potential') == 'high':
            warnings.append("High vectorization potential - consider optimizing loops")
        
        if performance_analysis.get('memory_usage') == 'high':
            warnings.append("High memory usage detected - consider memory optimization")
        
        return warnings[:15]  # Limit to 15 warnings
    
    def _calculate_confidence(self, syntax_analysis: Dict[str, Any],
                            physics_analysis: Dict[str, Any],
                            performance_analysis: Dict[str, Any]) -> float:
        """Calculate overall confidence score"""
        
        base_score = 0.7
        
        # Adjust based on syntax validity
        if syntax_analysis.get('syntax_valid', False):
            base_score += 0.1
        
        # Adjust based on physics analysis confidence
        physics_confidence = physics_analysis.get('confidence_score', 0.5)
        base_score = (base_score + physics_confidence) / 2
        
        # Penalize for many warnings
        total_warnings = len(syntax_analysis.get('syntax_warnings', [])) + \
                        len(physics_analysis.get('warnings', []))
        
        if total_warnings > 10:
            base_score -= 0.2
        elif total_warnings > 5:
            base_score -= 0.1
        
        return max(0.1, min(1.0, base_score))
    
    def _generate_overall_assessment(self, syntax_analysis: Dict[str, Any],
                                   physics_analysis: Dict[str, Any]) -> str:
        """Generate overall code assessment"""
        
        if not syntax_analysis.get('syntax_valid', False):
            return "Code has syntax errors that need to be fixed"
        
        physics_warnings = len(physics_analysis.get('warnings', []))
        
        if physics_warnings == 0:
            return "Code appears physically consistent and well-structured"
        elif physics_warnings <= 3:
            return "Code is generally good with minor physical consistency considerations"
        elif physics_warnings <= 7:
            return "Code has several physical consistency issues that should be addressed"
        else:
            return "Code has significant physical consistency concerns"
