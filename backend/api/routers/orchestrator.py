from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
# Import relatif (si vous ne lancez pas depuis la racine du projet)
from orchestration.orchestrator import orchestrator
from utils.logger import logger
# from api.dependencies import get_current_user # Dépendance simulée

router = APIRouter(
    prefix="/orchestrator",
    tags=["Orchestrator"],
    # dependencies=[Depends(get_current_user)], # Sécurité simulée
    responses={404: {"description": "Not found"}},
)

@router.post("/process")
async def process_orchestrator_request(request_data: Dict[str, Any]):
    """
    Endpoint pour soumettre une requête à l'orchestrateur IA.
    """
    user_request = request_data.get("request")
    context_id = request_data.get("context_id")

    if not user_request:
        raise HTTPException(status_code=400, detail="Le champ 'request' est obligatoire.")

    logger.info(f"Requête API reçue pour l'orchestrateur: {user_request}")
    
    try:
        result = await orchestrator.process_request(user_request, context_id)
        return result
    except Exception as e:
        logger.error(f"Erreur lors du traitement de la requête orchestrateur: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne de l'orchestrateur: {e}")

@router.get("/status/{context_id}")
async def get_orchestrator_status(context_id: str):
    """
    Endpoint pour vérifier le statut d'une session d'orchestration.
    (Simulé pour l'instant)
    """
    # Dans une implémentation réelle, on irait chercher le statut dans une DB
    return {"context_id": context_id, "status": "simulated_active", "last_update": "maintenant"}
