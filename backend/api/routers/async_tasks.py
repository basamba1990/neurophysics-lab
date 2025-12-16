from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from utils.logger import logger
# from celery_app.worker import app as celery_app # Importation simulée

router = APIRouter(
    prefix="/async",
    tags=["Asynchronous Tasks"],
    responses={404: {"description": "Not found"}},
)

@router.post("/submit")
async def submit_async_task(task_data: Dict[str, Any]):
    """
    Endpoint pour soumettre une tâche asynchrone (ex: Celery).
    """
    task_name = task_data.get("task_name")
    task_args = task_data.get("args", [])
    task_kwargs = task_data.get("kwargs", {})

    if not task_name:
        raise HTTPException(status_code=400, detail="Le champ 'task_name' est obligatoire.")

    logger.info(f"Soumission de la tâche asynchrone: {task_name}")
    
    try:
        # Simulation de l'envoi à Celery
        # task = celery_app.send_task(task_name, args=task_args, kwargs=task_kwargs)
        # return {"task_id": task.id, "status": "PENDING"}
        
        # Remplacement par une réponse simulée
        simulated_task_id = f"task_{hash(task_name + str(task_args) + str(task_kwargs))}"
        return {"task_id": simulated_task_id, "status": "PENDING", "message": "Tâche asynchrone soumise (simulée)."}
        
    except Exception as e:
        logger.error(f"Erreur lors de la soumission de la tâche asynchrone: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la soumission de la tâche: {e}")

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Endpoint pour vérifier le statut d'une tâche asynchrone.
    """
    logger.info(f"Vérification du statut de la tâche: {task_id}")
    
    # Simulation de la vérification du statut Celery
    # task = celery_app.AsyncResult(task_id)
    # return {"task_id": task_id, "status": task.status, "result": task.result}
    
    # Remplacement par une réponse simulée
    if "error" in task_id:
        status = "FAILURE"
        result = "Erreur simulée lors de l'exécution."
    elif hash(task_id) % 2 == 0:
        status = "SUCCESS"
        result = "Résultat simulé de la tâche."
    else:
        status = "PROGRESS"
        result = {"progress": "50%", "message": "En cours de traitement..."}
        
    return {"task_id": task_id, "status": status, "result": result}
