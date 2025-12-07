import json
from typing import Dict, Any, List
import openai
from enum import Enum

from core.config import get_settings

settings = get_settings()

class ScientificDomain(Enum):
    COMPUTATIONAL_FLUID_DYNAMICS = "computational_fluid_dynamics"
    HEAT_TRANSFER = "heat_transfer"
    STRUCTURAL_MECHANICS = "structural_mechanics"
    ELECTROMAGNETISM = "electromagnetism"
    MULTIPHYSICS = "multiphysics"
    DATA_SCIENCE = "data_science"
    CODE_ANALYSIS = "code_analysis"

class ComplexityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    EXTREME = "extreme"

class DecisionEngine:
    """Moteur de décision scientifique pour NeuroPhysics Lab"""
    
    def __init__(self):
        self.openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.engine_capabilities = self._load_engine_capabilities()
        
    def _load_engine_capabilities(self) -> Dict[str, Any]:
        """Charge les capacités des différents moteurs"""
        return {
            "PINN_SOLVER": {
                "domains": [
                    ScientificDomain.COMPUTATIONAL_FLUID_DYNAMICS.value,
                    ScientificDomain.HEAT_TRANSFER.value,
                    ScientificDomain.STRUCTURAL_MECHANICS.value,
                    ScientificDomain.MULTIPHYSICS.value
                ],
                "complexity_handling": {
                    "low": True,
                    "medium": True,
                    "high": True,
                    "extreme": False
                },
                "execution_time_estimate": {
                    "low": 60,     # secondes
                    "medium": 300,
                    "high": 1800,
                    "extreme": 3600
                },
                "resource_requirements": {
                    "cpu": "high",
                    "gpu": "recommended",
                    "memory": "high"
                }
            },
            "CODE_COPILOT": {
                "domains": [
                    ScientificDomain.CODE_ANALYSIS.value,
                    ScientificDomain.DATA_SCIENCE.value
                ],
                "complexity_handling": {
                    "low": True,
                    "medium": True,
                    "high": True,
                    "extreme": True
                },
                "execution_time_estimate": {
                    "low": 10,
                    "medium": 30,
                    "high": 120,
                    "extreme": 300
                },
                "resource_requirements": {
                    "cpu": "low",
                    "gpu": "optional",
                    "memory": "medium"
                }
            },
            "DIGITAL_TWIN": {
                "domains": [
                    ScientificDomain.MULTIPHYSICS.value,
                    ScientificDomain.DATA_SCIENCE.value
                ],
                "complexity_handling": {
                    "low": True,
                    "medium": True,
                    "high": True,
                    "extreme": False
                },
                "execution_time_estimate": {
                    "low": 120,
                    "medium": 600,
                    "high": 3600,
                    "extreme": 7200
                },
                "resource_requirements": {
                    "cpu": "high",
                    "gpu": "recommended",
                    "memory": "high"
                }
            }
        }
    
    async def generate_optimal_plan(self, analysis: Dict[str, Any], 
                                  context: Dict[str, Any], 
                                  available_engines: List[str]) -> Dict[str, Any]:
        """Génère un plan d'exécution optimal basé sur l'analyse scientifique"""
        
        # Étape 1: Identification des moteurs appropriés
        suitable_engines = self._identify_suitable_engines(analysis, available_engines)
        
        # Étape 2: Optimisation avec IA
        optimized_plan = await self._optimize_with_ai(
            analysis, 
            context, 
            suitable_engines
        )
        
        # Étape 3: Validation scientifique
        validated_plan = self._scientifically_validate_plan(optimized_plan, analysis)
        
        return validated_plan
    
    def _identify_suitable_engines(self, analysis: Dict[str, Any], 
                                 available_engines: List[str]) -> List[Dict[str, Any]]:
        """Identifie les moteurs adaptés au problème scientifique"""
        
        suitable = []
        domain = analysis.get("domain", "")
        complexity = analysis.get("complexity", "medium")
        
        for engine_name in available_engines:
            if engine_name in self.engine_capabilities:
                capabilities = self.engine_capabilities[engine_name]
                
                # Vérification du domaine
                if domain in capabilities["domains"]:
                    # Vérification de la complexité
                    if capabilities["complexity_handling"].get(complexity, False):
                        suitable.append({
                            "engine": engine_name,
                            "capabilities": capabilities,
                            "suitability_score": self._calculate_suitability_score(
                                domain, complexity, capabilities
                            )
                        })
        
        # Tri par score de pertinence
        suitable.sort(key=lambda x: x["suitability_score"], reverse=True)
        
        return suitable
    
    def _calculate_suitability_score(self, domain: str, complexity: str, 
                                   capabilities: Dict[str, Any]) -> float:
        """Calcule un score de pertinence pour un moteur donné"""
        
        score = 0.0
        
        # Score basé sur le domaine (40%)
        if domain in capabilities["domains"]:
            score += 0.4
            
        # Score basé sur la complexité (30%)
        if capabilities["complexity_handling"].get(complexity, False):
            score += 0.3
            
        # Score basé sur les ressources (20%)
        resource_score = {
            "low": 1.0,
            "medium": 0.8,
            "high": 0.6,
            "extreme": 0.4
        }
        
        # Pondération simplifiée
        resource_level = capabilities["resource_requirements"].get("memory", "medium")
        score += 0.2 * resource_score.get(resource_level, 0.6)
        
        # Score basé sur le temps d'exécution estimé (10%)
        time_estimate = capabilities["execution_time_estimate"].get(complexity, 300)
        time_score = max(0.1, 1.0 - (time_estimate / 3600))  # Normalisé sur 1 heure
        score += 0.1 * time_score
        
        return round(score, 2)
    
    async def _optimize_with_ai(self, analysis: Dict[str, Any], 
                              context: Dict[str, Any], 
                              suitable_engines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Utilise l'IA pour optimiser le plan d'exécution"""
        
        optimization_prompt = f"""
En tant que planificateur scientifique expert, optimisez ce plan d'exécution:

ANALYSE DU PROBLÈME:
Domaine: {analysis.get('domain')}
Complexité: {analysis.get('complexity')}
Hypothèses: {analysis.get('hypotheses', [])[:3]}

MOTEURS DISPONIBLES (avec scores de pertinence):
{json.dumps(suitable_engines, indent=2)}

CONTEXTE SUPPLÉMENTAIRE:
{json.dumps(context, indent=2)}

CRITÈRES D'OPTIMISATION:
1. Minimiser le temps total d'exécution
2. Maximiser la précision scientifique
3. Équilibrer la charge des ressources
4. Respecter les dépendances entre étapes

Générez un plan d'exécution optimal au format JSON:
{{
  "optimized_steps": [
    {{
      "step_id": string,
      "engine": string,
      "task": string,
      "priority": number (1-10),
      "estimated_duration": number (secondes),
      "dependencies": string[],
      "parameters": object
    }}
  ],
  "total_estimated_duration": number,
  "resource_allocation": {{
    "cpu_cores_required": number,
    "gpu_required": boolean,
    "memory_gb_required": number
  }},
  "risk_assessment": {{
    "high_risk_steps": string[],
    "mitigation_strategies": string[]
  }}
}}
"""
        
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Expert en optimisation de workflows scientifiques"},
                {"role": "user", "content": optimization_prompt}
            ],
            temperature=0.2,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        optimized_plan = json.loads(response.choices[0].message.content)
        
        return optimized_plan
    
    def _scientifically_validate_plan(self, plan: Dict[str, Any], 
                                    analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Valide scientifiquement le plan d'exécution"""
        
        validation_issues = []
        
        # Vérification de la cohérence scientifique
        if not self._check_scientific_coherence(plan, analysis):
            validation_issues.append("Incohérence scientifique détectée")
        
        # Vérification des dépendances circulaires
        if self._has_circular_dependencies(plan):
            validation_issues.append("Dépendances circulaires détectées")
        
        # Vérification des ressources
        resource_issues = self._validate_resource_requirements(plan)
        validation_issues.extend(resource_issues)
        
        # Ajout des validations au plan
        if validation_issues:
            plan["validation_issues"] = validation_issues
            plan["validation_status"] = "needs_review"
        else:
            plan["validation_status"] = "approved"
        
        # Ajout de métadonnées scientifiques
        plan["scientific_metadata"] = {
            "domain": analysis.get("domain"),
            "complexity": analysis.get("complexity"),
            "validation_timestamp": datetime.utcnow().isoformat(),
            "validator_version": "1.0.0"
        }
        
        return plan
    
    def _check_scientific_coherence(self, plan: Dict[str, Any], 
                                  analysis: Dict[str, Any]) -> bool:
        """Vérifie la cohérence scientifique du plan"""
        
        # Vérification basique - à améliorer
        steps = plan.get("optimized_steps", [])
        
        for step in steps:
            engine = step.get("engine")
            task = step.get("task", "")
            
            # Vérifier que le moteur est adapté à la tâche
            if engine in self.engine_capabilities:
                capabilities = self.engine_capabilities[engine]
                
                # Vérification simple basée sur les mots-clés
                domain_keywords = {
                    "navier_stokes": ScientificDomain.COMPUTATIONAL_FLUID_DYNAMICS.value,
                    "heat_transfer": ScientificDomain.HEAT_TRANSFER.value,
                    "structural": ScientificDomain.STRUCTURAL_MECHANICS.value
                }
                
                for keyword, domain in domain_keywords.items():
                    if keyword in task.lower() and domain not in capabilities["domains"]:
                        return False
        
        return True
    
    def _has_circular_dependencies(self, plan: Dict[str, Any]) -> bool:
        """Détecte les dépendances circulaires"""
        
        steps = plan.get("optimized_steps", [])
        dependency_graph = {}
        
        # Construction du graphe de dépendances
        for step in steps:
            step_id = step.get("step_id")
            dependencies = step.get("dependencies", [])
            dependency_graph[step_id] = dependencies
        
        # Détection de cycles avec DFS
        visited = set()
        rec_stack = set()
        
        def dfs(node):
            visited.add(node)
            rec_stack.add(node)
            
            for neighbor in dependency_graph.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            
            rec_stack.remove(node)
            return False
        
        for node in dependency_graph:
            if node not in visited:
                if dfs(node):
                    return True
        
        return False
    
    def _validate_resource_requirements(self, plan: Dict[str, Any]) -> List[str]:
        """Valide les exigences en ressources"""
        
        issues = []
        resource_allocation = plan.get("resource_allocation", {})
        
        # Vérification des ressources CPU
        cpu_required = resource_allocation.get("cpu_cores_required", 0)
        if cpu_required > 32:  # Limite arbitraire
            issues.append(f"Exigence CPU trop élevée: {cpu_required} cœurs")
        
        # Vérification de la mémoire
        memory_required = resource_allocation.get("memory_gb_required", 0)
        if memory_required > 128:  # Limite arbitraire
            issues.append(f"Exigence mémoire trop élevée: {memory_required} GB")
        
        return issues
