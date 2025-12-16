from typing import Dict, Any, List
from .plan_executor import PlanExecutor
from .context_manager import ContextManager
from .decision_engine import DecisionEngine
from .task_dispatcher import TaskDispatcher
from utils.logger import logger

class NeuroPhysicsOrchestrator:
    """
    Service principal d'orchestration pour les tâches complexes de neurophysique.
    Utilise un moteur de décision pour créer un plan, un gestionnaire de contexte
    pour les données vectorielles, et un exécuteur pour les tâches.
    """
    def __init__(self):
        self.context_manager = ContextManager()
        self.decision_engine = DecisionEngine()
        self.plan_executor = PlanExecutor()
        self.task_dispatcher = TaskDispatcher()
        logger.info("NeuroPhysicsOrchestrator initialisé.")

    async def process_request(self, user_request: str, context_id: str = None) -> Dict[str, Any]:
        """
        Traite une requête utilisateur en passant par les étapes d'orchestration.
        """
        logger.info(f"Traitement de la requête: {user_request}")

        # 1. Récupération du contexte
        context_data = await self.context_manager.retrieve_context(user_request, context_id)
        
        # 2. Prise de décision et planification
        plan = await self.decision_engine.generate_plan(user_request, context_data)
        
        if not plan or plan.get("status") == "error":
            return {"status": "error", "message": "Impossible de générer un plan d'exécution.", "details": plan}

        # 3. Exécution du plan
        execution_result = await self.plan_executor.execute_plan(plan)

        # 4. Synthèse des résultats (simulée ici)
        final_result = self._synthesize_results(user_request, execution_result)

        return {
            "status": "success",
            "request": user_request,
            "plan": plan,
            "result": final_result,
            "context_id": context_id
        }

    def _synthesize_results(self, request: str, execution_result: Dict[str, Any]) -> str:
        """
        Synthétise les résultats de l'exécution pour fournir une réponse cohérente à l'utilisateur.
        """
        # Logique de synthèse complexe basée sur les résultats des tâches
        if execution_result.get("status") == "success":
            summary = f"L'orchestrateur a terminé l'exécution de votre requête: '{request}'. "
            summary += f"Nombre de tâches exécutées: {len(execution_result.get('steps', []))}. "
            
            # Exemple de récupération de résultat clé
            final_step = execution_result.get('steps', [])[-1] if execution_result.get('steps') else None
            if final_step and final_step.get('output'):
                summary += f"Le résultat final est: {final_step['output'][:100]}..."
            else:
                summary += "Veuillez consulter le plan d'exécution pour les détails."
            
            return summary
        else:
            return f"L'exécution de la requête '{request}' a échoué. Détails: {execution_result.get('error')}"

# Instance singleton de l'orchestrateur
orchestrator = NeuroPhysicsOrchestrator()
