from typing import Dict, Any, Optional
from utils.logger import logger
from database.supabase_client import get_admin_supabase # Importation du client admin

class ContextManager:
    """
    Gère le contexte vectoriel pour l'orchestrateur.
    Interagit avec la fonction Edge 'vector-context' pour récupérer le contexte.
    """
    def __init__(self):
        logger.info("ContextManager initialisé.")

    async def retrieve_context(self, query: str, context_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Récupère le contexte pertinent (documents, résultats précédents, etc.)
        à partir de la fonction Edge 'vector-context'.
        """
        logger.info(f"Appel de la fonction Edge 'vector-context' pour la requête: {query}")
        
        # Utilisation du client admin pour garantir l'exécution de la fonction Edge
        supabase_admin_client = get_admin_supabase()
        
        try:
            # L'appel à functions.invoke est synchrone dans la librairie Python
            response = supabase_admin_client.functions.invoke(
                "neurophysics-orchestrator-vector-context",
                invoke_options={
                    "body": {"query": query, "context_id": context_id},
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"}
                }
            )
            
            # La librairie Python renvoie un objet Response avec .data et .error
            if response.error:
                logger.error(f"Erreur d'appel Edge Function: {response.error.message}")
                # Lever une exception pour que l'orchestrateur puisse gérer l'échec
                raise Exception(f"Erreur de contexte vectoriel: {response.error.message}")
                
            context_data = response.data
            logger.info(f"Contexte récupéré (documents: {len(context_data.get('relevant_documents', []))})")
            return context_data
            
        except Exception as e:
            logger.error(f"Échec de la récupération de contexte: {e}")
            # Retourner un contexte vide en cas d'échec pour éviter de bloquer l'orchestrateur
            return {
                "query": query,
                "context_id": context_id if context_id else "new_session_123",
                "relevant_documents": [],
                "previous_results": []
            }

    async def update_context(self, context_id: str, new_data: Dict[str, Any]):
        """
        Met à jour le contexte avec de nouvelles informations (résultats de tâches, etc.).
        Cette fonction est conservée mais ne fait rien pour l'instant.
        """
        logger.info(f"Mise à jour du contexte {context_id} avec de nouvelles données (simulée).")
        pass
