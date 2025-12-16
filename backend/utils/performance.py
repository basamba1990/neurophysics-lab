import time
from functools import wraps
from typing import Callable, Any, Dict
import psutil
import GPUtil
import threading
from contextlib import contextmanager

def timer(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"{func.__name__} executed in {execution_time:.4f} seconds")
        return result
    return wrapper

class PerformanceMonitor:
    """Performance monitoring for simulations and AI models"""
    
    def __init__(self):
        self.metrics_history = []
        self._lock = threading.Lock()
    
    @staticmethod
    def get_system_metrics() -> Dict[str, Any]:
        """Get current system metrics"""
        try:
            gpus = GPUtil.getGPUs()
            gpu_metrics = [{
                "id": gpu.id,
                "name": gpu.name,
                "load": gpu.load * 100,
                "memory_used": gpu.memoryUsed,
                "memory_total": gpu.memoryTotal,
                "memory_utilization": gpu.memoryUtil * 100,
                "temperature": gpu.temperature
            } for gpu in gpus]
        except Exception:
            gpu_metrics = []
            
        return {
            "timestamp": time.time(),
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage_percent": psutil.disk_usage('/').percent,
            "gpu_metrics": gpu_metrics
        }
    
    def monitor_convergence(self, loss_history: list, threshold: float = 1e-6) -> bool:
        """Monitor training convergence"""
        if len(loss_history) < 10:
            return False
            
        recent_losses = loss_history[-10:]
        improvements = [abs(recent_losses[i-1] - recent_losses[i]) for i in range(1, len(recent_losses))]
        
        avg_improvement = sum(improvements) / len(improvements)
        return avg_improvement < threshold
    
    def record_metrics(self, metrics: Dict[str, Any]):
        """Record performance metrics"""
        with self._lock:
            self.metrics_history.append({
                "timestamp": time.time(),
                **metrics
            })
            
            # Keep only last 1000 records
            if len(self.metrics_history) > 1000:
                self.metrics_history = self.metrics_history[-1000:]
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        if not self.metrics_history:
            return {}
            
        recent_metrics = self.metrics_history[-100:]  # Last 100 records
        
        return {
            "total_records": len(self.metrics_history),
            "average_cpu_usage": sum(m.get('cpu_percent', 0) for m in recent_metrics) / len(recent_metrics),
            "average_memory_usage": sum(m.get('memory_percent', 0) for m in recent_metrics) / len(recent_metrics),
            "peak_memory_usage": max(m.get('memory_percent', 0) for m in recent_metrics)
        }

@contextmanager
def performance_context(monitor: PerformanceMonitor, operation_name: str):
    """Context manager for performance monitoring"""
    start_time = time.time()
    start_metrics = monitor.get_system_metrics()
    
    try:
        yield
    finally:
        end_time = time.time()
        end_metrics = monitor.get_system_metrics()
        
        monitor.record_metrics({
            "operation": operation_name,
            "duration": end_time - start_time,
            "start_metrics": start_metrics,
            "end_metrics": end_metrics
        })

class MemoryOptimizer:
    """Memory optimization utilities"""
    
    @staticmethod
    def estimate_memory_usage(data_structure: Any) -> int:
        """Estimate memory usage of a data structure in bytes"""
        # Simplified estimation - in production use pympler or similar
        if isinstance(data_structure, (list, tuple)):
            return sum(MemoryOptimizer.estimate_memory_usage(item) for item in data_structure)
        elif isinstance(data_structure, dict):
            return sum(MemoryOptimizer.estimate_memory_usage(k) + 
                      MemoryOptimizer.estimate_memory_usage(v) 
                      for k, v in data_structure.items())
        elif isinstance(data_structure, (int, float)):
            return 24  # Approximate size for Python integers/floats
        elif isinstance(data_structure, str):
            return len(data_structure) + 49  # Python string overhead
        else:
            return 100  # Default estimate for unknown objects
    
    @staticmethod
    def optimize_array_size(original_size: int, target_memory_mb: float) -> int:
        """Calculate optimal array size to fit in target memory"""
        element_size_bytes = 8  # Assuming double precision
        target_bytes = target_memory_mb * 1024 * 1024
        
        max_elements = int(target_bytes / element_size_bytes)
        return min(original_size, max_elements)
