# backend/services/optimization_engine/performance_monitor.py

import time
import numpy as np
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Performance monitoring for digital twins and optimization systems"""
    
    def __init__(self):
        self.performance_metrics = {}
        self.optimization_history = []
        self.system_health_metrics = {}
        
        logger.info("PerformanceMonitor initialized")
    
    async def track_optimization_performance(self, optimization_id: str, 
                                           metrics: Dict[str, Any]):
        """Track optimization performance metrics"""
        
        timestamp = datetime.utcnow()
        
        performance_data = {
            'timestamp': timestamp,
            'optimization_id': optimization_id,
            'metrics': metrics
        }
        
        self.optimization_history.append(performance_data)
        
        # Keep only last 1000 records
        if len(self.optimization_history) > 1000:
            self.optimization_history = self.optimization_history[-1000:]
        
        logger.info(f"Tracked performance for optimization {optimization_id}")
    
    async def get_performance_metrics(self, system_id: str) -> Dict[str, Any]:
        """Get comprehensive performance metrics for a system"""
        
        # Calculate performance indicators
        recent_optimizations = [
            opt for opt in self.optimization_history 
            if opt['optimization_id'] == system_id
        ][-10:]  # Last 10 optimizations
        
        if not recent_optimizations:
            return {"status": "no_data"}
        
        # Calculate performance trends
        convergence_times = [
            opt['metrics'].get('convergence_time', 0) 
            for opt in recent_optimizations
        ]
        
        objective_improvements = [
            opt['metrics'].get('objective_improvement', 0)
            for opt in recent_optimizations
        ]
        
        return {
            "performance_summary": {
                "total_optimizations": len(recent_optimizations),
                "average_convergence_time": np.mean(convergence_times) if convergence_times else 0.0,
                "average_improvement": np.mean(objective_improvements) if objective_improvements else 0.0,
                "performance_trend": self._calculate_performance_trend(objective_improvements),
                "system_health": self._assess_system_health(recent_optimizations)
            },
            "recent_metrics": recent_optimizations[-5:],  # Last 5 optimizations
            "recommendations": self._generate_performance_recommendations(recent_optimizations)
        }
    
    def _calculate_performance_trend(self, improvements: List[float]) -> str:
        """Calculate performance trend"""
        
        if len(improvements) < 2:
            return "stable"
        
        # Simplification pour éviter les erreurs d'indexation
        if len(improvements) < 6:
            return "stable"
            
        recent_avg = np.mean(improvements[-3:])
        previous_avg = np.mean(improvements[:-3])
        
        if previous_avg == 0:
            return "stable" if recent_avg == 0 else "improving"

        if recent_avg > previous_avg * 1.1:
            return "improving"
        elif recent_avg < previous_avg * 0.9:
            return "declining"
        else:
            return "stable"
    
    def _assess_system_health(self, optimizations: List[Dict]) -> str:
        """Assess overall system health"""
        
        if not optimizations:
            return "unknown"
        
        success_rates = [
            1 if opt['metrics'].get('success', False) else 0 
            for opt in optimizations
        ]
        
        success_rate = np.mean(success_rates)
        
        if success_rate >= 0.9:
            return "excellent"
        elif success_rate >= 0.7:
            return "good"
        elif success_rate >= 0.5:
            return "fair"
        else:
            return "poor"
    
    def _generate_performance_recommendations(self, optimizations: List[Dict]) -> List[str]:
        """Generate performance improvement recommendations"""
        
        recommendations = []
        
        if not optimizations:
            return ["No optimization data available for recommendations"]
        
        # Analyze convergence times
        convergence_times = [
            opt['metrics'].get('convergence_time', 0) 
            for opt in optimizations
        ]
        
        avg_convergence = np.mean(convergence_times) if convergence_times else 0.0
        if avg_convergence > 60:  # More than 60 seconds
            recommendations.append("Consider using surrogate models to reduce computation time")
        
        return recommendations if recommendations else ["System performing well - continue current approach"]

# Exemple d'utilisation (simulé)
if __name__ == "__main__":
    async def main():
        monitor = PerformanceMonitor()
        
        # Simuler quelques optimisations
        await monitor.track_optimization_performance("twin_001", {"success": True, "convergence_time": 35.2, "objective_improvement": 0.8})
        await monitor.track_optimization_performance("twin_001", {"success": True, "convergence_time": 40.1, "objective_improvement": 0.75})
        await monitor.track_optimization_performance("twin_001", {"success": False, "convergence_time": 120.5, "objective_improvement": 0.1})
        
        report = await monitor.get_performance_metrics("twin_001")
        print(report)

    # asyncio.run(main()) # Commenté pour éviter l'exécution dans le contexte de l'agent
    pass
