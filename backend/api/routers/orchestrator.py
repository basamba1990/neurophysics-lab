from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from typing import Dict, Any
import uuid

from core.security import verify_token
from models.pydantic_models import (
    OrchestrationRequest, 
    OrchestrationResponse,
    ScientificQuery,
    ExecutionStatus
)
from services.orchestration.orchestrator import NeuroPhysicsOrchestrator
from services.orchestration.task_dispatcher import TaskDispatcher
from api.dependencies import CurrentUser, RepoFactory

router = APIRouter(prefix="/orchestrator", tags=["NeuroPhysics Orchestrator"])

@router.post("/analyze", response_model=OrchestrationResponse)
async def analyze_scientific_problem(
    query: ScientificQuery,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    """Analyse un problème scientifique complexe avec l'orchestrateur IA"""
    
    # Création de la requête d'orchestration
    orchestration_request = OrchestrationRequest(
        query=query.query,
        user_id=current_user.id,
        project_id=query.project_id or f"proj_{uuid.uuid4().hex[:8]}",
        context=query.context,
        files=query.files or [],
        priority=query.priority or "medium"
    )
    
    # Initialisation de l'orchestrateur
    orchestrator = NeuroPhysicsOrchestrator()
    
    try:
        # Exécution de l'analyse scientifique
        analysis_result = await orchestrator.process_scientific_query(orchestration_request)
        
        # Lancement des tâches en arrière-plan si nécessaire
        if analysis_result.get("execution_plan"):
            background_tasks.add_task(
                execute_orchestration_plan,
                analysis_result["execution_plan"],
                analysis_result["orchestration_id"],
                current_user.id
            )
        
        return OrchestrationResponse(
            orchestration_id=analysis_result["orchestration_id"],
            status="analysis_completed",
            scientific_analysis=analysis_result["scientific_analysis"],
            execution_plan=analysis_result.get("execution_plan"),
            estimated_completion_time=analysis_result.get("estimated_completion_time"),
            next_steps=analysis_result.get("recommended_next_steps", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'analyse scientifique: {str(e)}"
        )

@router.post("/execute-plan")
async def execute_scientific_plan(
    plan: Dict[str, Any],
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    """Exécute un plan scientifique généré par l'IA"""
    
    task_dispatcher = TaskDispatcher()
    
    try:
        execution_id = f"exec_{uuid.uuid4().hex[:8]}"
        
        # Lancement de l'exécution
        execution_result = await task_dispatcher.execute_plan(
            plan=plan,
            execution_id=execution_id,
            user_id=current_user.id
        )
        
        return {
            "execution_id": execution_id,
            "status": "execution_started",
            "total_steps": len(plan.get("steps", [])),
            "monitoring_endpoint": f"/orchestrator/status/{execution_id}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'exécution du plan: {str(e)}"
        )

@router.get("/status/{execution_id}")
async def get_execution_status(
    execution_id: str,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    """Récupère le statut d'une exécution orchestrée"""
    
    # Récupération depuis la base de données
    status_data = await repo_factory.orchestrations.get_status(execution_id)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exécution non trouvée"
        )
    
    return ExecutionStatus(**status_data)

@router.get("/results/{orchestration_id}")
async def get_orchestration_results(
    orchestration_id: str,
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    """Récupère les résultats complets d'une orchestration"""
    
    results = await repo_factory.orchestrations.get_results(orchestration_id)
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orchestration non trouvée"
        )
    
    # Vérification des permissions
    if results["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission refusée"
        )
    
    return {
        "orchestration_id": orchestration_id,
        "scientific_report": results.get("final_synthesis", {}).get("scientific_report"),
        "execution_summary": {
            "total_steps": len(results.get("execution_plan", {}).get("steps", [])),
            "completed_steps": len([r for r in results.get("execution_results", []) 
                                   if r.get("status") == "completed"]),
            "failed_steps": len([r for r in results.get("execution_results", []) 
                                if r.get("status") == "failed"])
        },
        "professional_recommendations": results.get("final_synthesis", {}).get("professional_recommendations"),
        "raw_data_available": True,
        "download_links": {
            "scientific_report": f"/api/orchestrator/download/report/{orchestration_id}",
            "raw_data": f"/api/orchestrator/download/data/{orchestration_id}"
        }
    }

@router.post("/feedback/{orchestration_id}")
async def provide_scientific_feedback(
    orchestration_id: str,
    feedback: Dict[str, Any],
    current_user: CurrentUser,
    repo_factory: RepoFactory
):
    """Fournit un feedback scientifique sur les résultats"""
    
    feedback_data = {
        "orchestration_id": orchestration_id,
        "user_id": current_user.id,
        "scientific_correctness": feedback.get("scientific_correctness"),
        "clarity": feedback.get("clarity"),
        "usefulness": feedback.get("usefulness"),
        "comments": feedback.get("comments"),
        "suggestions": feedback.get("suggestions"),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await repo_factory.orchestrations.save_feedback(feedback_data)
    
    return {
        "message": "Feedback enregistré avec succès",
        "feedback_id": f"fb_{uuid.uuid4().hex[:8]}",
        "will_improve_ai": "Ce feedback sera utilisé pour améliorer les futures analyses."
    }

async def execute_orchestration_plan(plan: Dict[str, Any], orchestration_id: str, user_id: str):
    """Fonction d'exécution en arrière-plan"""
    
    task_dispatcher = TaskDispatcher()
    
    try:
        await task_dispatcher.execute_plan(
            plan=plan,
            execution_id=orchestration_id,
            user_id=user_id
        )
        
        # Mise à jour du statut
        await update_orchestration_status(orchestration_id, "completed")
        
    except Exception as e:
        await update_orchestration_status(orchestration_id, "failed", str(e))
