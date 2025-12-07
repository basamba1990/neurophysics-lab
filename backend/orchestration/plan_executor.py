
## 🐍 **BACKEND PYTHON - FICHIERS MANQUANTS**

### **`/backend/orchestration/plan_executor.py`**
```python
from typing import Dict, Any, List, Optional
import asyncio
import json
from datetime import datetime
import uuid

from supabase import create_client
import openai

from core.config import get_settings
from models.pydantic_models import ExecutionPlan, ExecutionStep
from services.pinns_solver.prediction_service import PinnPredictionService
from services.copilot_ai_service.code_analyzer import CodeAnalyzer
from services.optimization_engine.optimization_solver import OptimizationSolver
from utils.logger import orchestrator_logger
from .task_dispatcher import TaskDispatcher

settings = get_settings()

class PlanExecutor:
    """Exécuteur de plans scientifiques générés par l'IA"""
    
    def __init__(self):
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.task_dispatcher = TaskDispatcher()
        
        # Services spécialisés
        self.pinn_service = PinnPredictionService()
        self.code_analyzer = CodeAnalyzer()
        self.optimization_solver = OptimizationSolver()
        
        # Cache pour les résultats intermédiaires
        self.results_cache = {}
    
    async def execute_plan(self, plan: ExecutionPlan, execution_id: str, user_id: str) -> Dict[str, Any]:
        """Exécute un plan scientifique complet"""
        
        orchestrator_logger.info(f"Début exécution plan {execution_id}")
        
        execution_context = {
            "execution_id": execution_id,
            "user_id": user_id,
            "started_at": datetime.utcnow().isoformat(),
            "plan_metadata": plan.metadata,
            "intermediate_results": {}
        }
        
        try:
            # Étape 1: Validation du plan
            validation_result = await self._validate_execution_plan(plan)
            if not validation_result["valid"]:
                raise ValueError(f"Plan invalide: {validation_result['issues']}")
            
            # Étape 2: Construction du graphe de dépendances
            dependency_graph = self._build_dependency_graph(plan.steps)
            
            # Étape 3: Exécution ordonnée
            execution_results = await self._execute_ordered_steps(
                plan.steps, 
                dependency_graph,
                execution_context
            )
            
            # Étape 4: Synthèse des résultats
            final_synthesis = await self._synthesize_execution_results(
                execution_results, 
                plan.metadata
            )
            
            # Étape 5: Sauvegarde et reporting
            await self._save_execution_results(
                execution_id,
                user_id,
                plan,
                execution_results,
                final_synthesis
            )
            
            orchestrator_logger.info(f"Exécution plan {execution_id} terminée avec succès")
            
            return {
                "execution_id": execution_id,
                "status": "completed",
                "total_steps": len(plan.steps),
                "completed_steps": len([r for r in execution_results if r["status"] == "completed"]),
                "failed_steps": len([r for r in execution_results if r["status"] == "failed"]),
                "final_synthesis": final_synthesis,
                "execution_time": self._calculate_execution_time(execution_context["started_at"]),
                "resources_used": self._calculate_resources_used(execution_results)
            }
            
        except Exception as e:
            orchestrator_logger.error(f"Erreur exécution plan {execution_id}: {e}")
            
            # Sauvegarde de l'erreur
            await self._save_execution_error(
                execution_id,
                user_id,
                plan,
                str(e)
            )
            
            raise
    
    async def _validate_execution_plan(self, plan: ExecutionPlan) -> Dict[str, Any]:
        """Valide la faisabilité et la cohérence scientifique du plan"""
        
        validation_issues = []
        
        for step in plan.steps:
            # Vérification des paramètres requis
            if step.engine == "PINN_SOLVER":
                required_params = ["physics_type", "boundary_conditions"]
                missing = [p for p in required_params if p not in step.parameters]
                if missing:
                    validation_issues.append(f"Step {step.step_id}: Paramètres manquants: {missing}")
            
            elif step.engine == "CODE_COPILOT":
                if "code" not in step.parameters:
                    validation_issues.append(f"Step {step.step_id}: Code manquant")
            
            # Vérification des dépendances circulaires
            if step.step_id in step.dependencies:
                validation_issues.append(f"Step {step.step_id}: Dépendance circulaire détectée")
        
        # Vérification des ressources
        resource_check = await self._check_resource_availability(plan)
        if not resource_check["available"]:
            validation_issues.extend(resource_check["constraints"])
        
        return {
            "valid": len(validation_issues) == 0,
            "issues": validation_issues,
            "warnings": resource_check.get("warnings", [])
        }
    
    def _build_dependency_graph(self, steps: List[ExecutionStep]) -> Dict[str, List[str]]:
        """Construit le graphe de dépendances entre les étapes"""
        
        graph = {}
        
        for step in steps:
            graph[step.step_id] = []
            for dep_id in step.dependencies:
                # Vérifier que la dépendance existe
                if any(s.step_id == dep_id for s in steps):
                    graph[step.step_id].append(dep_id)
                else:
                    orchestrator_logger.warning(f"Dépendance inexistante: {dep_id} pour {step.step_id}")
        
        return graph
    
    async def _execute_ordered_steps(self, steps: List[ExecutionStep], 
                                   dependency_graph: Dict[str, List[str]],
                                   context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Exécute les étapes dans l'ordre respectant les dépendances"""
        
        execution_results = []
        pending_steps = {step.step_id: step for step in steps}
        
        while pending_steps:
            # Trouver les étapes prêtes (dépendances satisfaites)
            ready_steps = []
            for step_id, step in pending_steps.items():
                dependencies = dependency_graph.get(step_id, [])
                if all(dep_id not in pending_steps for dep_id in dependencies):
                    ready_steps.append(step)
            
            if not ready_steps:
                # Deadlock détecté
                raise RuntimeError("Deadlock dans l'exécution du plan")
            
            # Exécuter les étapes prêtes en parallèle
            tasks = []
            for step in ready_steps:
                task = asyncio.create_task(
                    self._execute_single_step(step, context)
                )
                tasks.append((step.step_id, task))
            
            # Attendre les résultats
            for step_id, task in tasks:
                try:
                    result = await task
                    execution_results.append(result)
                    
                    # Mettre à jour le cache pour les dépendances futures
                    if result["status"] == "completed":
                        context["intermediate_results"][step_id] = result["result"]
                    
                    # Retirer l'étape des pending
                    del pending_steps[step_id]
                    
                except Exception as e:
                    execution_results.append({
                        "step_id": step_id,
                        "status": "failed",
                        "error": str(e),
                        "execution_time": datetime.utcnow().isoformat()
                    })
                    
                    # Gestion des erreurs : continuer ou arrêter ?
                    if step.parameters.get("critical", False):
                        raise
            
            # Petit délai entre les batches
            await asyncio.sleep(0.1)
        
        return execution_results
    
    async def _execute_single_step(self, step: ExecutionStep, context: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute une étape individuelle du plan"""
        
        step_start = datetime.utcnow()
        
        try:
            orchestrator_logger.info(f"Exécution étape {step.step_id}: {step.engine}")
            
            # Résolution des variables de contexte
            resolved_params = self._resolve_context_variables(step.parameters, context)
            
            # Exécution selon le moteur
            if step.engine == "PINN_SOLVER":
                result = await self._execute_pinn_step(resolved_params)
                
            elif step.engine == "CODE_COPILOT":
                result = await self._execute_copilot_step(resolved_params)
                
            elif step.engine == "DIGITAL_TWIN":
                result = await self._execute_digital_twin_step(resolved_params)
                
            elif step.engine == "DATA_ANALYSIS":
                result = await self._execute_data_analysis_step(resolved_params)
                
            else:
                raise ValueError(f"Moteur non supporté: {step.engine}")
            
            execution_time = (datetime.utcnow() - step_start).total_seconds()
            
            return {
                "step_id": step.step_id,
                "engine": step.engine,
                "status": "completed",
                "result": result,
                "execution_time": execution_time,
                "started_at": step_start.isoformat(),
                "completed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            orchestrator_logger.error(f"Erreur étape {step.step_id}: {e}")
            
            return {
                "step_id": step.step_id,
                "engine": step.engine,
                "status": "failed",
                "error": str(e),
                "execution_time": (datetime.utcnow() - step_start).total_seconds(),
                "started_at": step_start.isoformat()
            }
    
    async def _execute_pinn_step(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute une étape de simulation PINN"""
        
        # Validation des paramètres physiques
        physics_type = params.get("physics_type")
        if physics_type not in ["navier_stokes", "heat_transfer", "structural"]:
            raise ValueError(f"Type physique non supporté: {physics_type}")
        
        # Configuration de la simulation
        simulation_config = {
            "physics_type": physics_type,
            "parameters": params.get("simulation_parameters", {}),
            "boundary_conditions": params.get("boundary_conditions", {}),
            "mesh_config": params.get("mesh_config", {"nx": 50, "ny": 50}),
            "training_config": {
                "epochs": params.get("epochs", 1000),
                "learning_rate": params.get("learning_rate", 0.001)
            }
        }
        
        # Exécution via Celery (asynchrone)
        task_result = await self.task_dispatcher.dispatch_pinn_task(simulation_config)
        
        # Attente des résultats
        if task_result.get("status") == "SUCCESS":
            return {
                "simulation_id": task_result.get("task_id"),
                "results": task_result.get("results", {}),
                "convergence_metrics": task_result.get("convergence_metrics", {}),
                "performance_metrics": task_result.get("performance_metrics", {})
            }
        else:
            raise RuntimeError(f"Échec simulation: {task_result.get('error')}")
    
    async def _execute_copilot_step(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute une étape d'analyse de code"""
        
        code = params.get("code")
        if not code:
            raise ValueError("Code manquant pour l'analyse")
        
        analysis_type = params.get("analysis_type", "comprehensive")
        context = params.get("context", {})
        
        # Analyse avec le copilot scientifique
        analysis_result = await self.code_analyzer.analyze_code(
            code=code,
            language=params.get("language", "python"),
            context=context,
            analysis_type=analysis_type
        )
        
        # Validation physique supplémentaire
        if params.get("validate_physics", True):
            physics_validation = await self._validate_code_physics(code, context)
            analysis_result["physics_validation"] = physics_validation
        
        return {
            "analysis_id": f"analysis_{uuid.uuid4().hex[:8]}",
            "analysis_type": analysis_type,
            "results": analysis_result,
            "code_metrics": {
                "lines": len(code.split('\n')),
                "complexity": self._calculate_code_complexity(code),
                "issues_found": len(analysis_result.get("warnings", []))
            }
        }
    
    async def _execute_digital_twin_step(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute une étape d'optimisation avec jumeau numérique"""
        
        twin_id = params.get("twin_id")
        if not twin_id:
            # Création d'un jumeau temporaire
            twin_id = f"twin_temp_{uuid.uuid4().hex[:8]}"
        
        optimization_type = params.get("optimization_type", "single_objective")
        objectives = params.get("objectives", ["performance"])
        constraints = params.get("constraints", {})
        
        # Configuration de l'optimisation
        optimization_config = {
            "twin_id": twin_id,
            "optimization_type": optimization_type,
            "objectives": objectives,
            "constraints": constraints,
            "parameters": params.get("parameters", {}),
            "algorithm": params.get("algorithm", "genetic")
        }
        
        # Exécution
        optimization_result = await self.optimization_solver.optimize_system(
            optimization_config
        )
        
        return {
            "twin_id": twin_id,
            "optimization_type": optimization_type,
            "results": optimization_result,
            "pareto_front": optimization_result.get("pareto_front", []),
            "optimal_solutions": optimization_result.get("optimal_solutions", [])
        }
    
    async def _execute_data_analysis_step(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute une étape d'analyse de données"""
        
        data = params.get("data")
        analysis_type = params.get("analysis_type", "statistical")
        
        if analysis_type == "statistical":
            result = await self._perform_statistical_analysis(data, params)
        elif analysis_type == "trend":
            result = await self._perform_trend_analysis(data, params)
        elif analysis_type == "correlation":
            result = await self._perform_correlation_analysis(data, params)
        else:
            raise ValueError(f"Type d'analyse non supporté: {analysis_type}")
        
        return result
    
    async def _validate_code_physics(self, code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Valide la cohérence physique du code"""
        
        validation_prompt = f"""
        Valide la cohérence physique de ce code:
        
        CODE:
        {code[:2000]}...
        
        CONTEXTE PHYSIQUE:
        {json.dumps(context, indent=2)}
        
        Vérifie:
        1. Conservation des grandeurs physiques
        2. Respect des conditions aux limites
        3. Cohérence des unités
        4. Stabilité numérique
        
        Réponds en JSON.
        """
        
        response = await self.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {"role": "system", "content": "Expert en validation physique computationnelle"},
                {"role": "user", "content": validation_prompt}
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: {"type": "json_object"}
        })
        
        return json.loads(response.choices[0].message.content)
    
    def _resolve_context_variables(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Résout les variables de contexte dans les paramètres"""
        
        import re
        
        def resolve_value(value):
            if isinstance(value, str):
                # Recherche de variables ${step_id.result.field}
                matches = re.findall(r'\$\{([^}]+)\}', value)
                for match in matches:
                    parts = match.split('.')
                    if len(parts) >= 2:
                        step_id = parts[0]
                        field_path = '.'.join(parts[1:])
                        
                        # Récupération depuis les résultats intermédiaires
                        step_result = context["intermediate_results"].get(step_id, {})
                        
                        # Navigation dans le résultat
                        resolved = step_result
                        for part in field_path.split('.'):
                            if isinstance(resolved, dict) and part in resolved:
                                resolved = resolved[part]
                            else:
                                resolved = None
                                break
                        
                        if resolved is not None:
                            value = value.replace(f'${{{match}}}', str(resolved))
            
            elif isinstance(value, dict):
                return {k: resolve_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [resolve_value(v) for v in value]
            
            return value
        
        return resolve_value(parameters)
    
    async def _check_resource_availability(self, plan: ExecutionPlan) -> Dict[str, Any]:
        """Vérifie la disponibilité des ressources nécessaires"""
        
        constraints = []
        warnings = []
        
        # Estimation des ressources
        total_cpu_estimate = 0
        total_memory_estimate = 0
        gpu_required = False
        
        for step in plan.steps:
            if step.engine == "PINN_SOLVER":
                total_cpu_estimate += 4  # 4 cœurs par simulation
                total_memory_estimate += 8  # 8 GB
                gpu_required = True
                
            elif step.engine == "DIGITAL_TWIN":
                total_cpu_estimate += 2
                total_memory_estimate += 4
        
        # Vérifications
        available_cpu = 16  # À récupérer depuis l'environnement
        available_memory = 64  # GB
        
        if total_cpu_estimate > available_cpu:
            constraints.append(f"CPU insuffisant: {total_cpu_estimate}/{available_cpu}")
        
        if total_memory_estimate > available_memory:
            constraints.append(f"Mémoire insuffisante: {total_memory_estimate}GB/{available_memory}GB")
        
        if gpu_required:
            warnings.append("GPU recommandé pour les simulations PINN")
        
        return {
            "available": len(constraints) == 0,
            "constraints": constraints,
            "warnings": warnings,
            "resource_estimates": {
                "cpu_cores": total_cpu_estimate,
                "memory_gb": total_memory_estimate,
                "gpu_required": gpu_required
            }
        }
    
    async def _synthesize_execution_results(self, results: List[Dict[str, Any]], 
                                          metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Synthétise les résultats d'exécution"""
        
        synthesis_prompt = f"""
        En tant qu'expert scientifique, synthétise ces résultats d'exécution:
        
        MÉTADONNÉES DU PLAN:
        {json.dumps(metadata, indent=2)}
        
        RÉSULTATS D'EXÉCUTION:
        {json.dumps(results, indent=2)}
        
        Fournis une synthèse avec:
        1. Résumé exécutif
        2. Principales découvertes scientifiques
        3. Limitations identifiées
        4. Recommandations pour les prochaines étapes
        5. Implications pratiques
        
        Format JSON structuré.
        """
        
        response = await self.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {"role": "system", "content": "Expert en synthèse de résultats scientifiques"},
                {"role": "user", "content": synthesis_prompt}
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: {"type": "json_object"}
        })
        
        synthesis = json.loads(response.choices[0].message.content)
        
        # Ajout de métriques
        synthesis["execution_metrics"] = {
            "total_steps": len(results),
            "success_rate": len([r for r in results if r["status"] == "completed"]) / len(results),
            "total_execution_time": sum(r.get("execution_time", 0) for r in results),
            "critical_errors": len([r for r in results if r.get("error") and "critical" in str(r.get("error"))])
        }
        
        return synthesis
    
    async def _save_execution_results(self, execution_id: str, user_id: str, 
                                    plan: ExecutionPlan, results: List[Dict[str, Any]],
                                    synthesis: Dict[str, Any]):
        """Sauvegarde les résultats d'exécution"""
        
        execution_record = {
            "id": execution_id,
            "user_id": user_id,
            "plan_metadata": plan.metadata,
            "execution_steps": results,
            "final_synthesis": synthesis,
            "status": "completed",
            "started_at": results[0]["started_at"] if results else datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "execution_metrics": synthesis.get("execution_metrics", {})
        }
        
        await self.supabase.table("plan_executions").insert(execution_record).execute()
    
    async def _save_execution_error(self, execution_id: str, user_id: str, 
                                  plan: ExecutionPlan, error: str):
        """Sauvegarde une erreur d'exécution"""
        
        error_record = {
            "id": execution_id,
            "user_id": user_id,
            "plan_metadata": plan.metadata,
            "error": error,
            "status": "failed",
            "started_at": datetime.utcnow().isoformat(),
            "failed_at": datetime.utcnow().isoformat()
        }
        
        await self.supabase.table("plan_executions").insert(error_record).execute()
    
    def _calculate_code_complexity(self, code: str) -> int:
        """Calcule une métrique simplifiée de complexité de code"""
        
        lines = code.split('\n')
        
        # Métriques simplifiées
        complexity = 0
        complexity += len(lines) * 0.1
        complexity += code.count('for ') * 2
        complexity += code.count('while ') * 2
        complexity += code.count('if ') * 1
        complexity += code.count('def ') * 3
        complexity += code.count('class ') * 5
        
        return round(complexity, 2)
    
    def _calculate_execution_time(self, start_time: str) -> float:
        """Calcule le temps d'exécution total"""
        
        start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        return (datetime.utcnow() - start).total_seconds()
    
    def _calculate_resources_used(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calcule les ressources utilisées"""
        
        total_cpu = 0
        total_memory = 0
        gpu_used = False
        
        for result in results:
            if result.get("engine") == "PINN_SOLVER":
                total_cpu += 4
                total_memory += 8
                gpu_used = True
            elif result.get("engine") == "DIGITAL_TWIN":
                total_cpu += 2
                total_memory += 4
        
        return {
            "cpu_core_seconds": total_cpu,
            "memory_gb_seconds": total_memory,
            "gpu_used": gpu_used,
            "estimated_cost": self._estimate_cost(total_cpu, total_memory, gpu_used)
        }
    
    def _estimate_cost(self, cpu: float, memory: float, gpu: bool) -> float:
        """Estime le coût d'exécution"""
        
        # Tarifs approximatifs (à adapter)
        cpu_cost_per_hour = 0.05  # $/core-hour
        memory_cost_per_hour = 0.01  # $/GB-hour
        gpu_cost_per_hour = 0.50  # $/GPU-hour
        
        hours = cpu / 3600  # Conversion secondes → heures
        
        cost = (cpu * cpu_cost_per_hour * hours) + \
               (memory * memory_cost_per_hour * hours)
        
        if gpu:
            cost += gpu_cost_per_hour * hours
        
        return round(cost, 4)
