from fastapi import APIRouter, Depends
from typing import Dict, Any

from api.dependencies import CurrentUser, RepoFactory
from models.pydantic_models import CodeAnalysisRequest, CodeAnalysisResponse
from services.copilot_ai_service.code_analyzer import CodeAnalyzer
from services.copilot_ai_service.gpt_wrapper import GPTWrapper
from services.copilot_ai_service.fortran_modernizer import FortranModernizer
from services.copilot_ai_service.physics_validator import PhysicsValidator
from core.exceptions import CodeAnalysisError

router = APIRouter()

@router.post("/analyze-code", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    try:
        # Initialize services
        gpt_wrapper = GPTWrapper()
        code_analyzer = CodeAnalyzer(gpt_wrapper)
        
        # Analyze code
        analysis_result = await code_analyzer.analyze_code(
            request.code,
            request.language,
            request.context or {}
        )
        
        # Save analysis for learning
        await repo_factory.code_analysis.save_analysis(
            f"session_{current_user.id}",
            {
                "original_code": request.code,
                "analysis_type": request.analysis_type,
                "suggested_code": analysis_result["suggestions"][0]["suggested_code"] if analysis_result["suggestions"] else "",
                "explanation": analysis_result["suggestions"][0]["explanation"] if analysis_result["suggestions"] else "",
                "confidence_score": analysis_result["suggestions"][0]["confidence_score"] if analysis_result["suggestions"] else 0.0,
                "boundary_conditions_check": analysis_result.get("physics_validation", {}),
                "performance_metrics": analysis_result.get("performance_metrics", {})
            }
        )
        
        return CodeAnalysisResponse(**analysis_result)
        
    except Exception as e:
        raise CodeAnalysisError(f"Code analysis failed: {str(e)}")

@router.post("/modernize-fortran")
async def modernize_fortran_code(request: CodeAnalysisRequest):
    try:
        modernizer = FortranModernizer()
        result = await modernizer.modernize_code(
            request.code, 
            request.context or {}
        )
        
        return result
    except Exception as e:
        raise CodeAnalysisError(f"Fortran modernization failed: {str(e)}")

@router.post("/validate-physics")
async def validate_physics_constraints(request: CodeAnalysisRequest):
    try:
        validator = PhysicsValidator()
        result = await validator.validate_code_physics(
            request.code, 
            request.context or {}
        )
        
        return result
    except Exception as e:
        raise CodeAnalysisError(f"Physics validation failed: {str(e)}")

@router.get("/supported-languages")
async def get_supported_languages():
    return {
        "languages": ["fortran", "python", "cpp", "matlab"],
        "analysis_types": ["modernization", "debug", "optimization", "physics_validation"],
        "capabilities": [
            "Code modernization and translation",
            "Physics consistency validation", 
            "Performance optimization suggestions",
            "Boundary conditions verification",
            "Numerical stability analysis"
        ]
    }
