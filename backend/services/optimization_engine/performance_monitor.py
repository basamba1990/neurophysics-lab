import time
import numpy as np
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timedelta

from utils.logger import optimization_logger

class PerformanceMonitor:
    """Performance monitoring for digital twins and optimization systems"""
    
    def __init__(self):
        self.performance_metrics = {}
        self.optimization_history = []
        self.system_health_metrics = {}
        
        optimization_logger.info("PerformanceMonitor initialized")
    
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
        
        optimization_logger.info(f"Tracked performance for optimization {optimization_id}")
    
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
                "average_convergence_time": np.mean(convergence_times),
                "average_improvement": np.mean(objective_improvements),
                "performance_trend": self._calculate_performance_trend(objective_improvements),
                "system_health": self._assess_system_health(recent_optimizations)
            },
            "recent_metrics": recent_optimizations[-5:],  # Last 5 optimizations
            "recommendations": self._generate_performance_recommendations(recent_optimizations)
        }
    
    async def monitor_system_health(self, system_id: str, health_metrics: Dict[str, Any]):
        """Monitor overall system health"""
        
        self.system_health_metrics[system_id] = {
            'timestamp': datetime.utcnow(),
            'metrics': health_metrics,
            'health_score': self._calculate_health_score(health_metrics)
        }
        
        optimization_logger.info(f"Updated health metrics for system {system_id}")
    
    async def get_system_health(self, system_id: str) -> Dict[str, Any]:
        """Get system health status"""
        
        if system_id not in self.system_health_metrics:
            return {"status": "unknown"}
        
        health_data = self.system_health_metrics[system_id]
        
        return {
            "health_score": health_data['health_score'],
            "health_status": self._get_health_status(health_data['health_score']),
            "last_updated": health_data['timestamp'],
            "detailed_metrics": health_data['metrics'],
            "health_trend": await self._calculate_health_trend(system_id)
        }
    
    def _calculate_performance_trend(self, improvements: List[float]) -> str:
        """Calculate performance trend"""
        
        if len(improvements) < 2:
            return "stable"
        
        recent_avg = np.mean(improvements[-3:]) if len(improvements) >= 3 else improvements[-1]
        previous_avg = np.mean(improvements[:-3]) if len(improvements) >= 6 else improvements[0]
        
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
    
    def _calculate_health_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall health score"""
        
        weights = {
            'convergence_rate': 0.3,
            'objective_improvement': 0.3,
            'constraint_satisfaction': 0.2,
            'computation_efficiency': 0.2
        }
        
        score = 0.0
        for metric, weight in weights.items():
            value = metrics.get(metric, 0.5)  # Default to 0.5 if missing
            score += value * weight
        
        return min(1.0, max(0.0, score))
    
    def _get_health_status(self, health_score: float) -> str:
        """Convert health score to status"""
        
        if health_score >= 0.9:
            return "optimal"
        elif health_score >= 0.7:
            return "good"
        elif health_score >= 0.5:
            return "fair"
        else:
            return "needs_attention"
    
    async def _calculate_health_trend(self, system_id: str) -> str:
        """Calculate health trend over time"""
        
        # This would analyze historical health data
        # Simplified implementation
        return "stable"
    
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
        
        avg_convergence = np.mean(convergence_times)
        if avg_convergence > 60:  # More than 60 seconds
            recommendations.append("Consider using surrogate models to reduce computation time")
        
        # Analyze constraint satisfaction
        constraint_violations = [
            opt['metrics'].get('constraint_violation', 0)
            for opt in optimizations
        ]
        
        avg_violation = np.mean(constraint_violations)
        if avg_violation > 0.1:
            recommendations.append("Improve constraint handling with penalty methods or feasibility repair")
        
        # Analyze objective improvements
        improvements = [
            opt['metrics'].get('objective_improvement', 0)
            for opt in optimizations
        ]
        
        if len(improvements) >= 3 and improvements[-1] < improvements[-3]:
            recommendations.append("Recent performance declining - consider exploring different optimization methods")
        
        return recommendations if recommendations else ["System performing well - continue current approach"]
    
    async def generate_performance_report(self, system_id: str, 
                                       timeframe_days: int = 30) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        
        cutoff_time = datetime.utcnow() - timedelta(days=timeframe_days)
        
        relevant_optimizations = [
            opt for opt in self.optimization_history
            if (opt['optimization_id'] == system_id and 
                opt['timestamp'] >= cutoff_time)
        ]
        
        if not relevant_optimizations:
            return {"status": "no_data", "message": f"No optimizations in last {timeframe_days} days"}
        
        # Calculate comprehensive metrics
        metrics = self._calculate_comprehensive_metrics(relevant_optimizations)
        
        return {
            "report_period": {
                "start": cutoff_time,
                "end": datetime.utcnow(),
                "total_optimizations": len(relevant_optimizations)
            },
            "performance_metrics": metrics,
            "key_insights": self._extract_key_insights(metrics, relevant_optimizations),
            "actionable_recommendations": self._generate_actionable_recommendations(metrics)
        }
    
    def _calculate_comprehensive_metrics(self, optimizations: List[Dict]) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics"""
        
        success_rates = [1 if opt['metrics'].get('success', False) else 0 for opt in optimizations]
        convergence_times = [opt['metrics'].get('convergence_time', 0) for opt in optimizations]
        improvements = [opt['metrics'].get('objective_improvement', 0) for opt in optimizations]
        
        return {
            "success_rate": np.mean(success_rates),
            "average_convergence_time": np.mean(convergence_times),
            "average_improvement": np.mean(improvements),
            "best_improvement": max(improvements) if improvements else 0,
            "consistency_score": 1.0 - (np.std(improvements) / (np.mean(improvements) + 1e-8)) if improvements else 0,
            "efficiency_ratio": self._calculate_efficiency_ratio(optimizations)
        }
    
    def _calculate_efficiency_ratio(self, optimizations: List[Dict]) -> float:
        """Calculate optimization efficiency ratio"""
        
        if not optimizations:
            return 0.0
        
        total_improvement = sum(opt['metrics'].get('objective_improvement', 0) for opt in optimizations)
        total_time = sum(opt['metrics'].get('convergence_time', 0) for opt in optimizations)
        
        if total_time == 0:
            return 0.0
        
        return total_improvement / total_time
    
    def _extract_key_insights(self, metrics: Dict[str, Any], 
                            optimizations: List[Dict]) -> List[str]:
        """Extract key insights from performance data"""
        
        insights = []
        
        if metrics["success_rate"] >= 0.9:
            insights.append("High success rate indicates robust optimization setup")
        elif metrics["success_rate"] <= 0.5:
            insights.append("Low success rate suggests need for method adjustment or constraint relaxation")
        
        if metrics["efficiency_ratio"] > 1.0:
            insights.append("Excellent efficiency - optimization provides good value for computation time")
        elif metrics["efficiency_ratio"] < 0.1:
            insights.append("Low efficiency - consider method optimization or problem reformulation")
        
        if metrics["consistency_score"] >= 0.8:
            insights.append("Highly consistent performance across multiple optimizations")
        else:
            insights.append("Performance variability detected - system may be sensitive to initial conditions")
        
        return insights
    
    def _generate_actionable_recommendations(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations with priority"""
        
        recommendations = []
        
        if metrics["success_rate"] < 0.7:
            recommendations.append({
                "action": "Improve optimization success rate",
                "priority": "high",
                "suggestions": [
                    "Review constraint definitions",
                    "Adjust optimization parameters",
                    "Consider alternative optimization methods"
                ]
            })
        
        if metrics["average_convergence_time"] > 60:
            recommendations.append({
                "action": "Reduce computation time",
                "priority": "medium", 
                "suggestions": [
                    "Implement surrogate modeling",
                    "Use parallel computing",
                    "Optimize objective function evaluation"
                ]
            })
        
        if metrics["consistency_score"] < 0.7:
            recommendations.append({
                "action": "Improve result consistency",
                "priority": "medium",
                "suggestions": [
                    "Run multiple optimizations with different initial points",
                    "Implement robust optimization techniques",
                    "Add noise reduction to objective evaluation"
                ]
            })
        
        return recommendations
