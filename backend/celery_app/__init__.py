from celery import Celery
import os

# Configuration Celery pour NeuroPhysics Lab
celery_app = Celery(
    'neurophysics_tasks',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    include=[
        'celery_app.pinn_tasks',
        'celery_app.copilot_tasks', 
        'celery_app.optimization_tasks'
    ]
)

# Configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max
    task_soft_time_limit=25 * 60,
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1,
    
    # Routes de tâches
    task_routes={
        'pinn_tasks.*': {'queue': 'pinn_queue'},
        'copilot_tasks.*': {'queue': 'copilot_queue'},
        'optimization_tasks.*': {'queue': 'optimization_queue'}
    },
    
    # Résultats
    result_extended=True,
    result_expires=3600,  # 1 heure
)

# Configuration pour le monitoring
celery_app.conf.broker_transport_options = {
    'visibility_timeout': 1800,  # 30 minutes
    'fanout_prefix': True,
    'fanout_patterns': True
}

if __name__ == '__main__':
    celery_app.start()
