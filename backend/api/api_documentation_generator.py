# /backend/api/api_documentation_generator.py
from typing import Dict, Any, List
import inspect
from fastapi import APIRouter
from pydantic import BaseModel

class APIDocumentationGenerator:
    """Générateur de documentation technique pour les APIs scientifiques"""
    
    def generate_openapi_schema(self) -> Dict[str, Any]:
        """Génère la documentation OpenAPI complète"""
        
        return {
            "openapi": "3.0.0",
            "info": {
                "title": "Platform R&D Accelerator - API Scientifique",
                "description": """
                API pour l'ingénierie accélérée par IA - Three Engine Architecture
                
                MOTEUR 1: Solveurs PINN - Simulation physique accélérée
                MOTEUR 2: Scientific Copilot - Assistance IA pour le code scientifique  
                MOTEUR 3: Digital Twins - Optimisation et jumeaux numériques
                """,
                "version": "1.0.0"
            },
            "components": {
                "schemas": self._generate_schemas(),
                "parameters": self._generate_parameters()
            },
            "paths": self._generate_paths()
        }
    
    def _generate_schemas(self) -> Dict[str, Any]:
        """Génère les schémas Pydantic pour la documentation"""
        
        return {
            "PhysicsModelCreate": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "example": "Cavity Flow Re=1000"},
                    "physics_type": {"type": "string", "enum": ["navier_stokes", "heat_transfer"]},
                    "equations": {"type": "object", "description": "Équations physiques au format JSON"},
                    "boundary_conditions": {"type": "object", "description": "Conditions aux limites"}
                }
            },
            "SimulationResponse": {
                "type": "object", 
                "properties": {
                    "id": {"type": "string", "format": "uuid"},
                    "status": {"type": "string", "enum": ["pending", "running", "completed", "failed"]},
                    "pinn_predictions": {"type": "object", "description": "Champs physiques prédits"},
                    "convergence_metrics": {"type": "object", "description": "Métriques de convergence"}
                }
            }
        }
    
    def _generate_parameters(self) -> Dict[str, Any]:
        """Paramètres communs pour les APIs scientifiques"""
        
        return {
            "MeshFormatParameter": {
                "name": "mesh_format",
                "in": "query",
                "schema": {
                    "type": "string",
                    "enum": ["gmsh", "stl", "json"],
                    "default": "json"
                },
                "description": "Format du maillage pour mesh_handler.py"
            }
        }
    
    def _generate_paths(self) -> Dict[str, Any]:
        """Définition des endpoints scientifiques"""
        
        return {
            "/api/v1/pinn/simulations": {
                "post": {
                    "summary": "Lancer une simulation PINN",
                    "description": "Exécute une simulation physique via Physics-Informed Neural Networks",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/PhysicsModelCreate"}
                            }
                        }
                    },
                    "responses": {
                        "202": {
                            "description": "Simulation acceptée - monitoring via WebSocket",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/SimulationResponse"}
                                }
                            }
                        }
                    }
                }
            },
            "/ws/simulations/{simulation_id}": {
                "get": {
                    "summary": "WebSocket pour monitoring temps réel",
                    "description": "Connection WebSocket pour suivre la progression des simulations",
                    "parameters": [
                        {
                            "name": "simulation_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"}
                        }
                    ]
                }
            }
        }
