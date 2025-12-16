# backend/services/copilot_ai_service/context_manager.py

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ContextManager:
    """
    Gère le contexte de la session de l'utilisateur (code, configuration,
    historique de discussion) pour le Copilot AI.
    """

    def __init__(self):
        self.session_contexts: Dict[str, Dict[str, Any]] = {}
        logger.info("ContextManager initialisé.")

    def get_context(self, session_id: str) -> Dict[str, Any]:
        """
        Récupère le contexte complet pour une session donnée.
        """
        return self.session_contexts.get(session_id, self._default_context())

    def update_code(self, session_id: str, file_path: str, code_content: str):
        """
        Met à jour le contenu du code pour un fichier spécifique dans le contexte.
        """
        context = self.session_contexts.setdefault(session_id, self._default_context())
        context["code_files"][file_path] = code_content
        context["last_updated"] = file_path
        logger.debug(f"Code mis à jour pour la session {session_id}, fichier {file_path}.")

    def update_config(self, session_id: str, config: Dict[str, Any]):
        """
        Met à jour la configuration de la simulation dans le contexte.
        """
        context = self.session_contexts.setdefault(session_id, self._default_context())
        context["simulation_config"] = config
        logger.debug(f"Configuration mise à jour pour la session {session_id}.")

    def add_history_entry(self, session_id: str, role: str, message: str):
        """
        Ajoute une entrée à l'historique de discussion.
        """
        context = self.session_contexts.setdefault(session_id, self._default_context())
        context["history"].append({"role": role, "message": message})
        # Limiter l'historique pour éviter un contexte trop long
        context["history"] = context["history"][-10:] 
        logger.debug(f"Entrée d'historique ajoutée pour la session {session_id}.")

    def get_prompt_context(self, session_id: str) -> str:
        """
        Génère une chaîne de contexte formatée pour être envoyée au modèle AI.
        """
        context = self.get_context(session_id)
        
        prompt_parts = []
        
        # 1. Configuration de la simulation
        if context["simulation_config"]:
            prompt_parts.append("Configuration de la Simulation Actuelle:\n" + str(context["simulation_config"]))
            
        # 2. Fichiers de code
        if context["code_files"]:
            for path, content in context["code_files"].items():
                prompt_parts.append(f"Contenu du Fichier {path}:\n```python\n{content[:500]}...\n```") # Tronquer le code
                
        # 3. Historique de discussion
        if context["history"]:
            history_str = "\n".join([f"{entry['role']}: {entry['message']}" for entry in context["history"]])
            prompt_parts.append("Historique de Discussion Récent:\n" + history_str)
            
        return "\n\n".join(prompt_parts)

    def _default_context(self) -> Dict[str, Any]:
        """
        Crée une structure de contexte par défaut.
        """
        return {
            "simulation_config": {},
            "code_files": {},
            "history": [],
            "last_updated": None
        }

# Exemple d'utilisation
if __name__ == "__main__":
    manager = ContextManager()
    session_id = "user_abc"
    
    manager.update_config(session_id, {"model": "HeatTransfer", "mesh_size": 100})
    manager.update_code(session_id, "solver.py", "def solve():\n    pass")
    manager.add_history_entry(session_id, "user", "Comment puis-je ajouter une condition de Neumann?")
    
    prompt_context = manager.get_prompt_context(session_id)
    print(prompt_context)
