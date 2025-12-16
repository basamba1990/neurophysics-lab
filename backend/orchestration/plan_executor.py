from typing import Dict, Any, List
from .task_dispatcher import TaskDispatcher
from utils.logger import logger

class PlanExecutor:
    """
    Exécute un plan d'action généré par le moteur de décision.
    Le plan est une séquence de tâches à distribuer.
    """
    def __init__(self):
        self.task_dispatcher = TaskDispatcher()
        logger.info("PlanExecutor initialisé.")

    async def execute_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parcourt les étapes du plan et distribue les tâches.
        """
        steps = plan.get("steps", [])
        results = []
        
        logger.info(f"Démarrage de l'exécution du plan avec {len(steps)} étapes.")

        for i, step in enumerate(steps):
            task_type = step.get("task_type")
            task_params = step.get("params", {})
            
            logger.info(f"Étape {i+1}/{len(steps)}: Distribution de la tâche {task_type}")
            
            try:
                # Utilise le TaskDispatcher pour envoyer la tâche
                task_result = await self.task_dispatcher.dispatch_task(task_type, task_params)
                
                results.append({
                    "step": i + 1,
                    "task_type": task_type,
                    "status": "success",
                    "output": task_result
                })
                
                # Mise à jour du contexte si nécessaire (omise pour la simplicité)
                
            except Exception as e:
                logger.error(f"Erreur lors de l'exécution de la tâche {task_type}: {e}")
                results.append({
                    "step": i + 1,
                    "task_type": task_type,
                    "status": "error",
                    "error": str(e)
                })
                # Arrêter l'exécution en cas d'erreur critique
                return {"status": "failure", "error": f"Échec à l'étape {i+1}", "steps": results}

        logger.info("Exécution du plan terminée avec succès.")
        return {"status": "success", "steps": results}
