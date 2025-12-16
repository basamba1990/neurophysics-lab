# backend/services/analytics/pinn_performance_dashboard.py

from typing import Dict, Any, List
import random
import time
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    """
    Service pour agréger et analyser les métriques de performance
    des simulations PINN et l'utilisation globale de la plateforme.
    """

    def __init__(self):
        # Simulation de données pour l'exemple
        self.simulation_data = self._generate_mock_data()
        logger.info("AnalyticsService initialisé avec des données simulées.")

    def _generate_mock_data(self) -> List[Dict[str, Any]]:
        """Génère des données de simulation factices pour l'analyse."""
        data = []
        model_types = ["NavierStokes", "HeatTransfer", "Structural"]
        statuses = ["COMPLETED", "FAILED"]
        
        for i in range(50):
            model = random.choice(model_types)
            status = random.choice(statuses)
            data.append({
                "simulation_id": f"sim_{i:03d}",
                "model_type": model,
                "status": status,
                "execution_time": random.uniform(10.0, 300.0),
                "final_loss": random.uniform(1e-6, 1e-4) if status == "COMPLETED" else None,
                "organization_id": "org_a" if i < 40 else "org_b",
                "user_id": f"user_{random.randint(1, 5)}"
            })
        return data

    async def get_usage_metrics(self, organization_id: str) -> Dict[str, Any]:
        """
        Calcule les métriques d'utilisation pour une organisation.
        """
        org_simulations = [s for s in self.simulation_data if s["organization_id"] == organization_id]
        
        # Simuler les requêtes Copilot et l'utilisation du stockage
        copilot_requests = len(org_simulations) * random.randint(2, 5)
        storage_used_mb = len(org_simulations) * random.uniform(5.0, 50.0)
        
        return {
            "pinn_simulations_this_month": len(org_simulations),
            "copilot_requests_this_month": copilot_requests,
            "storage_used_mb": round(storage_used_mb, 2),
            "subscription_usage": {
                "used": len(org_simulations),
                "total": 100, # Exemple de limite
                "percentage": round(len(org_simulations) / 100 * 100, 1)
            }
        }

    async def get_performance_analytics(self, organization_id: str) -> Dict[str, Any]:
        """
        Calcule les analyses de performance des simulations.
        """
        org_simulations = [s for s in self.simulation_data if s["organization_id"] == organization_id]
        completed_simulations = [s for s in org_simulations if s["status"] == "COMPLETED"]
        
        if not org_simulations:
            return {
                "average_simulation_time": 0.0,
                "success_rate": 0.0,
                "most_used_physics_models": [],
                "resource_utilization": {"cpu_percent": 0.0, "memory_percent": 0.0}
            }

        # Temps moyen
        avg_time = sum(s["execution_time"] for s in completed_simulations) / len(completed_simulations) if completed_simulations else 0.0
        
        # Taux de succès
        success_rate = len(completed_simulations) / len(org_simulations)
        
        # Modèles les plus utilisés
        model_counts = {}
        for s in org_simulations:
            model_counts[s["model_type"]] = model_counts.get(s["model_type"], 0) + 1
        most_used = sorted(model_counts, key=model_counts.get, reverse=True)[:3]
        
        # Utilisation des ressources (simulée)
        resource_utilization = {
            "cpu_percent": random.uniform(40.0, 95.0),
            "memory_percent": random.uniform(50.0, 85.0),
            "gpu_utilization": random.uniform(30.0, 90.0)
        }

        return {
            "average_simulation_time": round(avg_time, 2),
            "success_rate": round(success_rate, 2),
            "most_used_physics_models": most_used,
            "resource_utilization": resource_utilization
        }

    async def get_simulation_history(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère l'historique détaillé d'une simulation.
        """
        for s in self.simulation_data:
            if s["simulation_id"] == simulation_id:
                # Ajouter des détails d'historique simulés
                s["history"] = [
                    {"timestamp": time.time() - 3600, "event": "Simulation started"},
                    {"timestamp": time.time() - 1800, "event": "Loss reduced to 1e-3"},
                    {"timestamp": time.time(), "event": f"Simulation {s['status']}"}
                ]
                return s
        return None

# Exemple d'utilisation
if __name__ == "__main__":
    import asyncio
    
    async def main():
        service = AnalyticsService()
        org_a_usage = await service.get_usage_metrics("org_a")
        print("Usage Metrics (Org A):", org_a_usage)
        
        org_a_perf = await service.get_performance_analytics("org_a")
        print("Performance Analytics (Org A):", org_a_perf)
        
        sim_history = await service.get_simulation_history("sim_005")
        print("Simulation History (sim_005):", sim_history)

    # asyncio.run(main()) # Commenté pour éviter l'exécution dans le contexte de l'agent
    pass
