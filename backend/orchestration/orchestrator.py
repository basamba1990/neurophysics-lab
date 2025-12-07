from typing import Dict, Any, List, Optional
import asyncio
import json
from datetime import datetime
import uuid

from supabase import create_client
import openai
from celery import Celery

from core.config import get_settings
from models.pydantic_models import OrchestrationRequest, ExecutionPlan, ScientificAnalysis
from .decision_engine import DecisionEngine
from .task_dispatcher import TaskDispatcher
from .context_manager import VectorContextManager

settings = get_settings()

class NeuroPhysicsOrchestrator:
    """Orchestrateur principal NeuroPhysics Lab"""
    
    def __init__(self):
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.decision_engine = DecisionEngine()
        self.task_dispatcher = TaskDispatcher()
        self.context_manager = VectorContextManager()
        
        # Configuration Celery pour les tâches asynchrones
        self.celery_app = Celery(
            'neurophysics_tasks',
            broker=settings.REDIS_URL,
            backend=settings.REDIS_URL
        )
    
    async def process_scientific_query(self, request: OrchestrationRequest) -> Dict[str, Any]:
        """Traite une requête scientifique complexe avec orchestration IA"""
        
        # Étape 1: Analyse scientifique initiale
        scientific_analysis = await self._analyze_scientific_problem(request)
        
        # Étape 2: Plan d'exécution généré par IA
        execution_plan = await self._generate_execution_plan(scientific_analysis, request)
        
        # Étape 3: Exécution orchestrée
        execution_results = await self._execute_orchestrated_plan(execution_plan, request)
        
        # Étape 4: Synthèse scientifique
        final_synthesis = await self._synthesize_results(
            scientific_analysis, 
            execution_results, 
            request
        )
        
        # Étape 5: Sauvegarde pour traçabilité
        await self._save_orchestration_trace(
            request, 
            scientific_analysis, 
            execution_plan, 
            execution_results, 
            final_synthesis
        )
        
        return {
            "orchestration_id": str(uuid.uuid4()),
            "scientific_analysis": scientific_analysis.dict(),
            "execution_plan": execution_plan.dict(),
            "execution_results": execution_results,
            "final_synthesis": final_synthesis,
            "recommended_next_steps": self._generate_next_steps(final_synthesis),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _analyze_scientific_problem(self, request: OrchestrationRequest) -> ScientificAnalysis:
        """Analyse scientifique approfondie avec IA"""
        
        # Récupération du contexte historique
        historical_context = await self.context_manager.get_similar_problems(
            request.query, 
            request.project_id
        )
        
        # Prompt NeuroPhysics Lab
        neurophysics_prompt = f"""
Tu es l'IA principale de NeuroPhysics Lab. Analyse ce problème scientifique:

PROBLÈME: {request.query}
CONTEXTE: {request.context or 'Aucun contexte fourni'}
FICHIERS: {len(request.files or [])} fichiers attachés
HISTORIQUE: {len(historical_context)} problèmes similaires trouvés

Fournis une analyse structurée avec:
1. Domaine scientifique principal et sous-domaines
2. Hypothèses de travail
3. Complexité estimée (LOW/MEDIUM/HIGH)
4. Méthodologies recommandées
5. Risques scientifiques identifiés
6. Validation nécessaire

Format JSON requis."""
        
        # Appel à OpenAI avec le prompt NeuroPhysics
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Expert scientifique NeuroPhysics Lab"},
                {"role": "user", "content": neurophysics_prompt}
            ],
            temperature=0.1,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        analysis_data = json.loads(response.choices[0].message.content)
        
        return ScientificAnalysis(**analysis_data)
    
    async def _generate_execution_plan(self, analysis: ScientificAnalysis, request: OrchestrationRequest) -> ExecutionPlan:
        """Génère un plan d'exécution optimisé"""
        
        # Utilisation du moteur de décision pour optimiser le plan
        optimal_plan = await self.decision_engine.generate_optimal_plan(
            analysis, 
            request.context,
            available_engines=self._get_available_engines()
        )
        
        # Validation scientifique du plan
        validated_plan = await self._validate_scientific_plan(optimal_plan, analysis)
        
        return ExecutionPlan(**validated_plan)
    
    async def _execute_orchestrated_plan(self, plan: ExecutionPlan, request: OrchestrationRequest) -> List[Dict[str, Any]]:
        """Exécute le plan de manière orchestrée"""
        
        execution_results = []
        
        # Exécution parallèle des tâches avec gestion des dépendances
        async with asyncio.TaskGroup() as tg:
            for step in plan.steps:
                # Vérification des dépendances
                if self._check_dependencies(step, execution_results):
                    task = tg.create_task(
                        self.task_dispatcher.execute_step(step, request)
                    )
                    execution_results.append({
                        "step_id": step.step_id,
                        "task": task,
                        "status": "running"
                    })
        
        # Collecte des résultats
        final_results = []
        for result in execution_results:
            try:
                step_result = await result["task"]
                final_results.append({
                    "step_id": result["step_id"],
                    "status": "completed",
                    "result": step_result,
                    "execution_time": datetime.utcnow().isoformat()
                })
            except Exception as e:
                final_results.append({
                    "step_id": result["step_id"],
                    "status": "failed",
                    "error": str(e),
                    "execution_time": datetime.utcnow().isoformat()
                })
        
        return final_results
    
    async def _synthesize_results(self, analysis: ScientificAnalysis, 
                                results: List[Dict[str, Any]], 
                                request: OrchestrationRequest) -> Dict[str, Any]:
        """Synthétise les résultats en un rapport scientifique cohérent"""
        
        synthesis_prompt = f"""
En tant qu'expert scientifique NeuroPhysics Lab, synthétisez ces résultats:

ANALYSE INITIALE: {json.dumps(analysis.dict(), indent=2)}
RÉSULTATS D'EXÉCUTION: {json.dumps(results, indent=2)}
REQUÊTE ORIGINALE: {request.query}

Fournissez:
1. Conclusions scientifiques principales
2. Limitations identifiées
3. Implications pour la recherche
4. Recommandations professionnelles
5. Étapes suivantes recommandées

Format JSON structuré."""
        
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Expert en synthèse scientifique"},
                {"role": "user", "content": synthesis_prompt}
            ],
            temperature=0.2,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        synthesis = json.loads(response.choices[0].message.content)
        
        # Ajout de métadonnées
        synthesis.update({
            "synthesis_id": str(uuid.uuid4()),
            "generated_at": datetime.utcnow().isoformat(),
            "confidence_score": self._calculate_confidence_score(results)
        })
        
        return synthesis
    
    async def _save_orchestration_trace(self, request: OrchestrationRequest, 
                                      analysis: ScientificAnalysis, 
                                      plan: ExecutionPlan, 
                                      results: List[Dict[str, Any]], 
                                      synthesis: Dict[str, Any]):
        """Sauvegarde la trace complète de l'orchestration"""
        
        trace_data = {
            "project_id": request.project_id,
            "user_id": request.user_id,
            "original_query": request.query,
            "scientific_analysis": analysis.dict(),
            "execution_plan": plan.dict(),
            "execution_results": results,
            "final_synthesis": synthesis,
            "created_at": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        
        await self.supabase.table("neurophysics_orchestrations").insert(trace_data).execute()
    
    def _get_available_engines(self) -> List[Dict[str, Any]]:
        """Retourne la liste des moteurs disponibles"""
        return [
            {
                "name": "PINN_SOLVER",
                "capabilities": ["navier_stokes", "heat_transfer", "structural", "multiphysics"],
                "availability": "high",
                "avg_execution_time": 120  # secondes
            },
            {
                "name": "CODE_COPILOT", 
                "capabilities": ["analysis", "modernization", "debugging", "validation"],
                "availability": "high",
                "avg_execution_time": 30
            },
            {
                "name": "DIGITAL_TWIN",
                "capabilities": ["optimization", "monitoring", "scenario_analysis"],
                "availability": "medium", 
                "avg_execution_time": 180
            }
        ]
    
    def _check_dependencies(self, step: Dict[str, Any], results: List[Dict[str, Any]]) -> bool:
        """Vérifie si les dépendances d'une étape sont satisfaites"""
        if not step.get("dependencies"):
            return True
        
        for dep_id in step["dependencies"]:
            dep_result = next((r for r in results if r["step_id"] == dep_id), None)
            if not dep_result or dep_result["status"] != "completed":
                return False
        
        return True
    
    def _calculate_confidence_score(self, results: List[Dict[str, Any]]) -> float:
        """Calcule un score de confiance basé sur les résultats"""
        if not results:
            return 0.0
        
        completed = sum(1 for r in results if r["status"] == "completed")
        total = len(results)
        
        base_score = completed / total
        
        # Ajustement basé sur la qualité des résultats
        quality_factors = []
        for result in results:
            if result["status"] == "completed":
                # Ici, on pourrait ajouter une analyse de qualité plus sophistiquée
                quality_factors.append(0.9)  # Valeur par défaut
        
        quality_score = sum(quality_factors) / len(quality_factors) if quality_factors else 0.0
        
        return round((base_score * 0.4 + quality_score * 0.6) * 100, 2)
    
    def _generate_next_steps(self, synthesis: Dict[str, Any]) -> List[str]:
        """Génère les prochaines étapes recommandées"""
        recommendations = synthesis.get("professional_recommendations", {})
        
        next_steps = []
        
        # Étapes immédiates
        if "immediate_actions" in recommendations:
            next_steps.extend(recommendations["immediate_actions"][:3])
        
        # Directions de recherche futures
        if "future_research_directions" in synthesis.get("scientific_report", {}):
            next_steps.extend(synthesis["scientific_report"]["future_research_directions"][:2])
        
        # Limiter à 5 étapes maximum
        return next_steps[:5]
