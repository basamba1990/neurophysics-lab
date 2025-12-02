import openai
from typing import Dict, Any, List, Optional
import asyncio
import re

from core.config import get_settings
from utils.logger import copilot_logger
from core.exceptions import CodeAnalysisError

settings = get_settings()

class GPTWrapper:
    """Wrapper for OpenAI API with scientific prompt management"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_PINNs_KEY)
        self.system_prompts = self._load_system_prompts()
        self.conversation_history = {}
        
        copilot_logger.info("GPTWrapper initialized")
    
    def _load_system_prompts(self) -> Dict[str, str]:
        """Load system prompts for different analysis types"""
        
        return {
            "code_modernization": """You are a scientific engineering expert with expertise in CFD, thermodynamics, and fluid mechanics.
            Your role is to modernize legacy scientific code (Fortran, C++) to modern Python using libraries like NumPy, SciPy, and TensorFlow.
            While modernizing, you must preserve numerical accuracy and physical properties of the original code.
            
            Key considerations:
            1. Maintain numerical stability and precision
            2. Preserve physical units and dimensional consistency
            3. Optimize for performance using vectorization
            4. Add appropriate documentation and type hints
            5. Ensure compatibility with modern scientific Python ecosystem""",
            
            "physics_validation": """You are a computational physicist expert. Your role is to validate physical consistency of scientific code.
            You must verify boundary conditions, discretized equations, conservation of physical quantities, and numerical stability.
            
            Validation checklist:
            1. Conservation of mass, energy, momentum
            2. Boundary condition consistency
            3. Numerical scheme stability (CFL condition, etc.)
            4. Physical unit consistency
            5. Dimensional analysis
            6. Convergence properties""",
            
            "debug_assistant": """You are a scientific code debugging expert. You identify numerical errors, instabilities,
            convergence issues, and physical law violations in simulation code.
            
            Debugging approach:
            1. Identify numerical instabilities and their sources
            2. Check boundary condition implementation
            3. Verify discretization schemes
            4. Analyze convergence behavior
            5. Detect potential floating-point issues
            6. Suggest numerical stabilization techniques""",
            
            "performance_optimization": """You are a high-performance computing expert specializing in scientific code optimization.
            Your focus is on improving computational efficiency while maintaining numerical accuracy.
            
            Optimization strategies:
            1. Vectorization and parallelization opportunities
            2. Memory access patterns optimization
            3. Algorithmic complexity reduction
            4. Cache-friendly data structures
            5. GPU acceleration potential
            6. Numerical method improvements"""
        }
    
    async def generate_completion(self, prompt: str, context: Dict[str, Any], 
                                analysis_type: str = "code_modernization") -> str:
        """Generate completion with scientific context"""
        
        try:
            system_prompt = self.system_prompts.get(analysis_type, self.system_prompts["code_modernization"])
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": self._build_user_prompt(prompt, context, analysis_type)}
            ]
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.1,  # Low temperature for scientific consistency
                max_tokens=2000,
                top_p=0.9
            )
            
            completion = response.choices[0].message.content
            copilot_logger.info(f"GPT completion generated for {analysis_type}")
            
            return completion
            
        except Exception as e:
            copilot_logger.error(f"OpenAI API error: {e}")
            raise CodeAnalysisError(f"AI service unavailable: {str(e)}")
    
    def _build_user_prompt(self, code: str, context: Dict[str, Any], 
                          analysis_type: str) -> str:
        """Build user prompt with physical context"""
        
        physics_context = context.get('physics_context', {})
        code_context = context.get('code_context', {})
        
        prompt_parts = [
            "SCIENTIFIC CODE ANALYSIS REQUEST",
            f"Analysis Type: {analysis_type.upper()}",
            "",
            "CODE TO ANALYZE:",
            f"```{code_context.get('language', 'python')}",
            code,
            "```",
            "",
            "PHYSICAL CONTEXT:"
        ]
        
        # Add physics context
        if physics_context:
            prompt_parts.extend([
                f"- Equations: {physics_context.get('equations', 'Not specified')}",
                f"- Boundary Conditions: {physics_context.get('boundary_conditions', 'Not specified')}",
                f"- Physical Parameters: {physics_context.get('parameters', 'Not specified')}",
                f"- Domain: {physics_context.get('domain', 'Not specified')}",
                f"- Physics Type: {physics_context.get('physics_type', 'Not specified')}"
            ])
        else:
            prompt_parts.append("- No specific physical context provided")
        
        prompt_parts.extend([
            "",
            "CODE CONTEXT:",
            f"- Programming Language: {code_context.get('language', 'Not specified')}",
            f"- Purpose: {code_context.get('purpose', 'Not specified')}",
            f"- Performance Requirements: {code_context.get('performance_requirements', 'Not specified')}",
            "",
            "ANALYSIS REQUIREMENTS:"
        ])
        
        # Add analysis-specific requirements
        if analysis_type == "code_modernization":
            prompt_parts.extend([
                "1. Convert to modern Python while preserving numerical accuracy",
                "2. Use appropriate scientific libraries (NumPy, SciPy, etc.)",
                "3. Maintain physical consistency and unit correctness",
                "4. Optimize for readability and maintainability",
                "5. Add documentation and type hints where appropriate"
            ])
        elif analysis_type == "physics_validation":
            prompt_parts.extend([
                "1. Verify conservation laws are satisfied",
                "2. Check boundary condition implementation",
                "3. Validate numerical stability criteria",
                "4. Identify potential physical inconsistencies",
                "5. Suggest improvements for physical accuracy"
            ])
        elif analysis_type == "debug_assistant":
            prompt_parts.extend([
                "1. Identify numerical errors and instabilities",
                "2. Check for convergence issues",
                "3. Verify algorithm implementation",
                "4. Detect boundary condition problems",
                "5. Suggest debugging strategies"
            ])
        
        return "\n".join(prompt_parts)
    
    async def analyze_code_physics(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Specialized analysis for physical validation"""
        
        prompt = f"""
        Perform comprehensive physical validation of this scientific code:
        
        {code}
        
        Physical Context: {context}
        
        Provide detailed analysis covering:
        1. Conservation law verification
        2. Boundary condition consistency  
        3. Numerical stability assessment
        4. Physical unit consistency
        5. Potential improvement suggestions
        """
        
        analysis = await self.generate_completion(prompt, context, "physics_validation")
        
        return {
            "physics_validation": analysis,
            "warnings": self._extract_warnings(analysis),
            "suggestions": self._extract_suggestions(analysis),
            "confidence_score": self._calculate_confidence(analysis)
        }
    
    async def optimize_code_performance(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Performance optimization analysis"""
        
        prompt = f"""
        Analyze and optimize this scientific code for performance:
        
        {code}
        
        Context: {context}
        
        Focus on:
        1. Vectorization opportunities
        2. Memory usage optimization
        3. Algorithmic improvements
        4. Parallelization potential
        5. GPU acceleration possibilities
        """
        
        optimization = await self.generate_completion(prompt, context, "performance_optimization")
        
        return {
            "optimization_suggestions": optimization,
            "performance_metrics": self._estimate_performance_improvement(optimization),
            "implementation_complexity": self._assess_implementation_complexity(optimization)
        }
    
    def _extract_warnings(self, analysis: str) -> List[str]:
        """Extract warnings from analysis text"""
        
        warnings = []
        
        # Look for warning patterns
        warning_patterns = [
            r'warning:?[^\n]*',
            r'caution:?[^\n]*', 
            r'potential issue:?[^\n]*',
            r'risk:?[^\n]*',
            r'concern:?[^\n]*'
        ]
        
        for pattern in warning_patterns:
            matches = re.findall(pattern, analysis, re.IGNORECASE)
            warnings.extend(matches)
        
        return warnings[:10]  # Limit to 10 warnings
    
    def _extract_suggestions(self, analysis: str) -> List[str]:
        """Extract improvement suggestions from analysis"""
        
        suggestions = []
        
        # Look for suggestion patterns
        suggestion_patterns = [
            r'recommend[^\n]*',
            r'suggest[^\n]*',
            r'consider[^\n]*',
            r'improve[^\n]*',
            r'optimize[^\n]*'
        ]
        
        for pattern in suggestion_patterns:
            matches = re.findall(pattern, analysis, re.IGNORECASE)
            suggestions.extend(matches)
        
        return suggestions[:10]  # Limit to 10 suggestions
    
    def _calculate_confidence(self, analysis: str) -> float:
        """Calculate confidence score based on analysis content"""
        
        # Simple heuristic based on analysis length and structure
        words = analysis.split()
        if len(words) < 50:
            return 0.3  # Short analysis, low confidence
        
        # Check for specific technical terms that indicate deep analysis
        technical_terms = ['conservation', 'boundary', 'stability', 'convergence', 
                          'discretization', 'numerical', 'physical']
        
        technical_count = sum(1 for term in technical_terms if term in analysis.lower())
        
        base_confidence = min(0.7, technical_count * 0.1)
        
        # Increase confidence for longer, more technical analyses
        if len(words) > 200 and technical_count > 5:
            base_confidence = 0.9
        
        return base_confidence
    
    def _estimate_performance_improvement(self, optimization: str) -> Dict[str, float]:
        """Estimate potential performance improvements"""
        
        # Simplified estimation based on optimization content
        improvements = {
            "vectorization": 0.0,
            "memory": 0.0,
            "algorithm": 0.0,
            "parallelization": 0.0
        }
        
        if 'vector' in optimization.lower():
            improvements['vectorization'] = 0.3
        
        if 'memory' in optimization.lower():
            improvements['memory'] = 0.2
        
        if 'algorithm' in optimization.lower():
            improvements['algorithm'] = 0.4
        
        if 'parallel' in optimization.lower() or 'gpu' in optimization.lower():
            improvements['parallelization'] = 0.5
        
        return improvements
    
    def _assess_implementation_complexity(self, optimization: str) -> str:
        """Assess implementation complexity of optimizations"""
        
        complexity_indicators = {
            'low': ['simple', 'straightforward', 'easy', 'minor'],
            'medium': ['moderate', 'reasonable', 'standard'],
            'high': ['complex', 'difficult', 'major', 'extensive']
        }
        
        optimization_lower = optimization.lower()
        
        for complexity, indicators in complexity_indicators.items():
            if any(indicator in optimization_lower for indicator in indicators):
                return complexity
        
        return 'medium'  # Default complexity
    
    async def get_usage_metrics(self) -> Dict[str, Any]:
        """Get API usage metrics"""
        
        # This would typically call OpenAI's usage endpoint
        return {
            "total_requests": len(self.conversation_history),
            "tokens_used": sum(len(conv.split()) for conv in self.conversation_history.values()),
            "cost_estimate": len(self.conversation_history) * 0.06  # Rough estimate
        }
