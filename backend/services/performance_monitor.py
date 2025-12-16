# /backend/services/performance_monitor.py
import psutil
import GPUtil
from typing import Dict, List, Any
import asyncio
from datetime import datetime, timedelta

class ScientificComputeMonitor:
    """Système de monitoring des ressources de calcul scientifique"""
    
    def __init__(self):
        self.alert_thresholds = {
            'cpu_percent': 90,
            'memory_percent': 85,
            'gpu_memory_percent': 90,
            'gpu_utilization': 95,
            'disk_usage_percent': 90
        }
        self.active_alerts = []
    
    async def monitor_resources(self) -> Dict[str, Any]:
        """Surveille l'utilisation des ressources en temps réel"""
        
        current_metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'cpu': self._get_cpu_metrics(),
            'memory': self._get_memory_metrics(),
            'gpu': self._get_gpu_metrics(),
            'disk': self._get_disk_metrics(),
            'active_processes': self._get_scientific_processes()
        }
        
        # Vérifier les alertes
        alerts = self._check_alert_thresholds(current_metrics)
        if alerts:
            self.active_alerts.extend(alerts)
            await self._trigger_alerts(alerts)
        
        return {
            'current_metrics': current_metrics,
            'active_alerts': alerts,
            'historical_trend': await self._get_historical_trend()
        }
    
    async def calculate_compute_costs(self, simulation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcule les coûts de calcul pour les simulations"""
        
        gpu_hours = simulation_data.get('gpu_hours', 0)
        cpu_hours = simulation_data.get('cpu_hours', 0)
        memory_gb = simulation_data.get('memory_gb', 0)
        
        # Coûts cloud approximatifs (USD)
        cloud_costs = {
            'aws': {
                'gpu_cost_per_hour': 0.95,  # p3.2xlarge
                'cpu_cost_per_hour': 0.20,   # c5.2xlarge
                'memory_cost_per_gb_hour': 0.01
            },
            'gcp': {
                'gpu_cost_per_hour': 0.78,   # NVIDIA T4
                'cpu_cost_per_hour': 0.15,
                'memory_cost_per_gb_hour': 0.008
            },
            'azure': {
                'gpu_cost_per_hour': 0.90,   # NVIDIA K80
                'cpu_cost_per_hour': 0.18,
                'memory_cost_per_gb_hour': 0.009
            }
        }
        
        total_costs = {}
        for provider, rates in cloud_costs.items():
            total_costs[provider] = (
                gpu_hours * rates['gpu_cost_per_hour'] +
                cpu_hours * rates['cpu_cost_per_hour'] + 
                memory_gb * rates['memory_cost_per_gb_hour']
            )
        
        return {
            'resource_usage': {
                'gpu_hours': gpu_hours,
                'cpu_hours': cpu_hours,
                'memory_gb_hours': memory_gb
            },
            'estimated_costs': total_costs,
            'cost_optimization_recommendations': self._generate_cost_recommendations(
                gpu_hours, cpu_hours, memory_gb
            )
        }
    
    def _get_cpu_metrics(self) -> Dict[str, float]:
        """Récupère les métriques CPU"""
        return {
            'percent': psutil.cpu_percent(interval=1),
            'cores_physical': psutil.cpu_count(logical=False),
            'cores_logical': psutil.cpu_count(logical=True),
            'load_1min': psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0
        }
    
    def _get_memory_metrics(self) -> Dict[str, Any]:
        """Récupère les métriques mémoire"""
        memory = psutil.virtual_memory()
        return {
            'total_gb': round(memory.total / (1024**3), 2),
            'available_gb': round(memory.available / (1024**3), 2),
            'used_gb': round(memory.used / (1024**3), 2),
            'percent': memory.percent
        }
    
    def _get_gpu_metrics(self) -> List[Dict[str, Any]]:
        """Récupère les métriques GPU"""
        try:
            gpus = GPUtil.getGPUs()
            return [{
                'id': gpu.id,
                'name': gpu.name,
                'load_percent': gpu.load * 100,
                'memory_used_mb': gpu.memoryUsed,
                'memory_total_mb': gpu.memoryTotal,
                'memory_percent': gpu.memoryUtil * 100,
                'temperature_c': gpu.temperature
            } for gpu in gpus]
        except:
            return []
    
    def _get_disk_metrics(self) -> Dict[str, Any]:
        """Récupère les métriques disque"""
        disk = psutil.disk_usage('/')
        return {
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'free_gb': round(disk.free / (1024**3), 2),
            'percent': disk.percent
        }
    
    def _get_scientific_processes(self) -> List[Dict[str, Any]]:
        """Identifie les processus scientifiques actifs"""
        scientific_keywords = ['python', 'pinn', 'tensorflow', 'pytorch', 'julia']
        scientific_processes = []
        
        for process in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                process_name = process.info['name'] or ''
                if any(keyword in process_name.lower() for keyword in scientific_keywords):
                    scientific_processes.append({
                        'pid': process.info['pid'],
                        'name': process_name,
                        'cpu_percent': process.info['cpu_percent'],
                        'memory_mb': round(process.info['memory_info'].rss / (1024**2), 2)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return scientific_processes
    
    def _check_alert_thresholds(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Vérifie les dépassements de seuils"""
        alerts = []
        
        # CPU
        if metrics['cpu']['percent'] > self.alert_thresholds['cpu_percent']:
            alerts.append({
                'resource': 'cpu',
                'metric': 'usage_percent',
                'value': metrics['cpu']['percent'],
                'threshold': self.alert_thresholds['cpu_percent'],
                'severity': 'high',
                'message': 'CPU usage critically high'
            })
        
        # Mémoire
        if metrics['memory']['percent'] > self.alert_thresholds['memory_percent']:
            alerts.append({
                'resource': 'memory',
                'metric': 'usage_percent', 
                'value': metrics['memory']['percent'],
                'threshold': self.alert_thresholds['memory_percent'],
                'severity': 'high',
                'message': 'Memory usage critically high'
            })
        
        # GPU
        for gpu in metrics['gpu']:
            if gpu['memory_percent'] > self.alert_thresholds['gpu_memory_percent']:
                alerts.append({
                    'resource': f"gpu_{gpu['id']}",
                    'metric': 'memory_percent',
                    'value': gpu['memory_percent'],
                    'threshold': self.alert_thresholds['gpu_memory_percent'],
                    'severity': 'medium',
                    'message': f"GPU {gpu['id']} memory usage high"
                })
        
        return alerts
    
    async def _trigger_alerts(self, alerts: List[Dict[str, Any]]):
        """Déclenche les alertes (intégration Slack/Email)"""
        for alert in alerts:
            # Intégration avec les services de notification
            print(f"ALERT: {alert['resource']} - {alert['message']}")
    
    async def _get_historical_trend(self) -> Dict[str, Any]:
        """Récupère les tendances historiques d'utilisation"""
        # Implémentation simplifiée - à connecter avec une base de données time-series
        return {
            'cpu_trend': 'stable',
            'memory_trend': 'increasing',
            'gpu_utilization_trend': 'variable'
        }
    
    def _generate_cost_recommendations(self, gpu_hours: float, cpu_hours: float, 
                                    memory_gb: float) -> List[str]:
        """Génère des recommandations d'optimisation des coûts"""
        recommendations = []
        
        if gpu_hours > 100:
            recommendations.append("Considérer l'utilisation de spot instances pour les entraînements longs")
        
        if cpu_hours > gpu_hours * 10:
            recommendations.append("Optimiser l'utilisation GPU pour réduire les coûts CPU")
        
        if memory_gb > 64:
            recommendations.append("Utiliser la compression des données pour réduire l'utilisation mémoire")
        
        return recommendations
