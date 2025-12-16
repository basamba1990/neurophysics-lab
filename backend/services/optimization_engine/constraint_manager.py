# backend/services/optimization_engine/constraint_manager.py

from typing import Dict, Any, List, Callable
import logging
import numpy as np
import sympy as sp
from sympy import symbols, sympify, lambdify
import re

logger = logging.getLogger(__name__)

class ConstraintManager:
    """
    Gère la définition, la validation et l'évaluation des contraintes
    pour les problèmes d'optimisation et de simulation.
    """

    def __init__(self):
        self.constraints: Dict[str, Dict[str, Any]] = {}
        logger.info("ConstraintManager initialisé.")

    def add_constraint(self, name: str, constraint_type: str, expression: str, bound: float, penalty_weight: float = 1e6):
        """
        Ajoute une nouvelle contrainte.
        :param name: Nom unique de la contrainte.
        :param constraint_type: 'inequality' (<= bound) ou 'equality' (= bound).
        :param expression: Expression mathématique de la contrainte (e.g., "T_max").
        :param bound: La valeur limite.
        :param penalty_weight: Poids de la pénalité pour l'optimisation.
        """
        if constraint_type not in ['inequality', 'equality']:
            raise ValueError("Le type de contrainte doit être 'inequality' ou 'equality'.")
            
        self.constraints[name] = {
            "type": constraint_type,
            "expression": expression,
            "bound": bound,
            "penalty_weight": penalty_weight
        }
        logger.info(f"Contrainte '{name}' ajoutée: {constraint_type} {expression} vs {bound}.")

    def evaluate_expression(self, expression: str, parameters: Dict[str, Any]) -> float:
        """
        Évalue une expression mathématique en utilisant les paramètres fournis.
        """
        try:
            # Identifier les symboles dans l'expression
            variables = re.findall(r'[a-zA-Z_][a-zA-Z0-9_]*', expression)
            
            # Créer les symboles sympy
            syms = symbols(variables)
            
            # Créer une fonction lambda pour l'évaluation rapide
            expr = sympify(expression)
            func = lambdify(syms, expr, "numpy")
            
            # Préparer les arguments pour la fonction lambda
            args = [parameters.get(str(s), 0.0) for s in syms]
            
            return float(func(*args))
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation de l'expression '{expression}': {e}")
            return float('inf') # Retourne une valeur qui causera une pénalité

    def calculate_penalty(self, parameters: Dict[str, Any]) -> float:
        """
        Calcule la pénalité totale pour toutes les contraintes violées.
        """
        total_penalty = 0.0
        
        for name, constraint in self.constraints.items():
            value = self.evaluate_expression(constraint["expression"], parameters)
            bound = constraint["bound"]
            penalty_weight = constraint["penalty_weight"]
            
            if constraint["type"] == 'inequality':
                # Contrainte: value <= bound
                violation = max(0, value - bound)
                total_penalty += penalty_weight * violation**2
            
            elif constraint["type"] == 'equality':
                # Contrainte: value = bound
                violation = abs(value - bound)
                total_penalty += penalty_weight * violation**2

        return total_penalty

    def validate_parameters(self, parameters: Dict[str, Any]) -> bool:
        """
        Vérifie si un ensemble de paramètres satisfait toutes les contraintes.
        """
        for name, constraint in self.constraints.items():
            value = self.evaluate_expression(constraint["expression"], parameters)
            bound = constraint["bound"]
            
            if constraint["type"] == 'inequality':
                if value > bound + 1e-6: # Tolérance
                    logger.warning(f"Validation échouée pour '{name}': {value} > {bound}")
                    return False
            
            elif constraint["type"] == 'equality':
                if abs(value - bound) > 1e-6:
                    logger.warning(f"Validation échouée pour '{name}': {value} != {bound}")
                    return False
                    
        logger.info("Validation des paramètres réussie.")
        return True

# Exemple d'utilisation
if __name__ == "__main__":
    manager = ConstraintManager()
    
    # Contrainte 1: La température maximale (T_max) doit être <= 350
    manager.add_constraint("MaxTemp", "inequality", "T_max", 350.0)
    
    # Contrainte 2: Le débit (flow_rate) doit être égal à 10.0
    manager.add_constraint("FlowRate", "equality", "flow_rate", 10.0)
    
    # Test 1: Paramètres valides
    valid_params = {"T_max": 300.0, "flow_rate": 10.0000001}
    print(f"Validation des paramètres valides: {manager.validate_parameters(valid_params)}")
    print(f"Pénalité pour les paramètres valides: {manager.calculate_penalty(valid_params)}")
    
    # Test 2: Paramètres invalides
    invalid_params = {"T_max": 400.0, "flow_rate": 5.0}
    print(f"Validation des paramètres invalides: {manager.validate_parameters(invalid_params)}")
    print(f"Pénalité pour les paramètres invalides: {manager.calculate_penalty(invalid_params)}")
