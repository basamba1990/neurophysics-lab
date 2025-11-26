# /backend/utils/architecture_diagram_generator.py
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.programming.language import Python
from diagrams.generic.storage import Storage
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Nginx
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.compute import Rack

class ArchitectureDiagramGenerator:
    """Générateur de diagrammes d'architecture pour la plateforme"""
    
    def generate_tri_engine_architecture(self) -> Dict[str, Any]:
        """Génère la documentation d'architecture tri-moteur"""
        
        architecture_spec = {
            "frontend": {
                "technology": "React/Vite",
                "components": [
                    "PhysicsModelForm.jsx - Configuration modèles physiques",
                    "SimulationRunner.jsx - Interface simulations PINN", 
                    "CodeEditor.jsx - Éditeur scientifique intelligent",
                    "OptimizationDashboard.jsx - Tableau de bord optimisation"
                ],
                "communication": "REST API + WebSocket pour monitoring temps réel"
            },
            "backend": {
                "technology": "FastAPI/Python",
                "engine_1": {
                    "name": "MOTEUR PINN",
                    "components": [
                        "pinn_solver.py - Solveurs Physics-Informed Neural Networks",
                        "physics_loss.py - Fonctions de perte physiques",
                        "training_manager.py - Gestion entraînement distribué",
                        "navier_stokes_pinn.py - Solveur Navier-Stokes spécialisé"
                    ],
                    "apis": [
                        "POST /pinn/simulations - Lancement simulations",
                        "GET /pinn/simulations/{id} - Récupération résultats", 
                        "WS /ws/simulations/{id} - Monitoring temps réel"
                    ]
                },
                "engine_2": {
                    "name": "MOTEUR SCIENTIFIC COPILOT", 
                    "components": [
                        "copilot.py - Assistance IA code scientifique",
                        "gpt_wrapper.py - Interface OpenAI avancée",
                        "code_analyzer.py - Analyse syntaxique et sémantique",
                        "fortran_modernizer.py - Conversion Fortran → Python"
                    ],
                    "apis": [
                        "POST /copilot/analyze-code - Analyse de code",
                        "POST /copilot/modernize-fortran - Modernisation Fortran",
                        "POST /copilot/validate-physics - Validation physique"
                    ]
                },
                "engine_3": {
                    "name": "MOTEUR DIGITAL TWINS",
                    "components": [
                        "digital_twins.py - Gestion jumeaux numériques", 
                        "optimization_solver.py - Solveurs d'optimisation",
                        "surrogate_models.py - Modèles substituts IA",
                        "performance_monitor.py - Monitoring performance"
                    ],
                    "apis": [
                        "POST /digital-twins - Création jumeaux",
                        "POST /digital-twins/optimize - Lancement optimisation",
                        "GET /digital-twins/{id}/performance - Métriques performance"
                    ]
                }
            },
            "database": {
                "technology": "PostgreSQL/Supabase",
                "tables": [
                    "physics_models - Configuration modèles physiques",
                    "simulations - Résultats simulations PINN", 
                    "code_analysis - Analyses du Scientific Copilot",
                    "digital_twins - Configuration jumeaux numériques",
                    "usage_metrics - Métriques d'utilisation et coûts"
                ]
            },
            "data_flow": {
                "simulation_pipeline": [
                    "PhysicsModelForm.jsx → Configuration modèle",
                    "mesh_handler.py → Génération maillage", 
                    "training_manager.py → Entraînement PINN",
                    "results_processor.py → Post-processing",
                    "optimization_solver.py → Optimisation (optionnel)",
                    "visualization_generator.py → Visualisation résultats"
                ],
                "integration_points": [
                    "WebSocket: Monitoring progression simulations",
                    "Shared Context: Contexte physique entre moteurs", 
                    "Event Bus: Communication inter-moteurs (Redis)",
                    "File Upload: Téléversement maillages et données"
                ]
            }
        }
        
        return architecture_spec
    
    def generate_data_flow_diagram(self) -> Dict[str, Any]:
        """Génère le diagramme de flux de données scientifique"""
        
        data_flow = {
            "steps": [
                {
                    "step": "Configuration Physique",
                    "component": "PhysicsModelForm.jsx",
                    "inputs": ["Équations physiques", "Conditions limites", "Paramètres"],
                    "outputs": "PhysicsModel JSON",
                    "next_step": "mesh_generation"
                },
                {
                    "step": "Génération Maillage", 
                    "component": "mesh_handler.py",
                    "inputs": ["PhysicsModel", "Géométrie", "Résolution"],
                    "outputs": "Mesh Data",
                    "next_step": "pinn_training"
                },
                {
                    "step": "Simulation PINN",
                    "component": "training_manager.py + navier_stokes_pinn.py", 
                    "inputs": ["Mesh Data", "PhysicsModel", "Hyperparamètres"],
                    "outputs": "PINN Predictions",
                    "next_step": "post_processing"
                },
                {
                    "step": "Post-Processing",
                    "component": "results_processor.py", 
                    "inputs": ["PINN Predictions", "Physics Context"],
                    "outputs": "Processed Results",
                    "next_step": "optimization"
                },
                {
                    "step": "Optimisation", 
                    "component": "optimization_solver.py",
                    "inputs": ["Processed Results", "Objectives", "Constraints"],
                    "outputs": "Optimized Parameters", 
                    "next_step": "visualization"
                },
                {
                    "step": "Visualisation",
                    "component": "visualization_generator.py",
                    "inputs": ["Processed Results/Optimized Parameters"],
                    "outputs": "Interactive Plots",
                    "next_step": "end"
                }
            ],
            "error_handling": {
                "mesh_generation_failure": "Retry avec résolution réduite",
                "pinn_divergence": "Checkpoint + Hyperparameter adjustment", 
                "optimization_timeout": "Fallback sur surrogate models",
                "visualization_memory": "Streaming pour gros datasets"
            }
        }
        
        return data_flow
