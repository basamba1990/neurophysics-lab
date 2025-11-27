# backend/services/copilot_ai_service/boundary_conditions_check.py

from typing import Dict, Any
from .gpt_wrapper import get_ai_response

def check_boundary_conditions_consistency(model_config: Dict[str, Any], user_input: str) -> Dict[str, Any]:
    """
    Vérifie la cohérence des conditions aux limites fournies par l'utilisateur
    avec le modèle physique sélectionné.
    """
    prompt = f"""
    En tant qu'expert en physique numérique, analysez la configuration du modèle et les conditions aux limites fournies.
    Modèle Physique: {model_config.get('model_type')}
    Configuration du Modèle: {model_config}
    Conditions aux Limites Fournies: {user_input}

    Vérifiez les points suivants:
    1. Complétude: Toutes les frontières nécessaires (entrée, sortie, murs, etc.) ont-elles des conditions définies?
    2. Cohérence Physique: Les conditions sont-elles physiquement plausibles pour le modèle (ex: pas de vitesse nulle pour un écoulement turbulent sans raison)?
    3. Format: Les conditions sont-elles dans un format utilisable par le solveur (par exemple, des équations ou des valeurs numériques claires)?

    Fournissez un rapport concis. Si des problèmes sont trouvés, proposez des corrections ou des questions à l'utilisateur.
    """
    
    response = get_ai_response(prompt, max_tokens=500)
    
    # Simuler une analyse plus poussée basée sur la réponse de l'IA
    analysis_result = {
        "status": "success" if "problèmes" not in response.lower() and "incohérence" not in response.lower() else "warning",
        "report": response,
        "suggestions": "Vérifiez le rapport pour les suggestions de l'IA."
    }
    
    return analysis_result

# Exemple d'utilisation (à intégrer dans le routeur copilot.py)
if __name__ == "__main__":
    test_config = {"model_type": "Navier-Stokes 2D", "domain_size": "1x1m"}
    test_input = "Vitesse d'entrée: 1 m/s. Pression de sortie: 0 Pa. Murs: condition de non-glissement."
    result = check_boundary_conditions_consistency(test_config, test_input)
    print(result)
