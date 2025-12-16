from celery import Celery
from core.config import get_settings
from utils.logger import logger

settings = get_settings()

# Configuration Celery (simulée)
app = Celery(
    'neurophysics_worker',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        'celery_app.pinn_tasks',
        'celery_app.copilot_tasks',
        'celery_app.optimization_tasks'
    ]
)

# Configuration de l'application Celery
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(task_name)s[%(task_id)s]: %(message)s",
)

logger.info("Celery worker configuré.")

# Tâche de base pour le test
@app.task(name="test_task")
def test_task(x, y):
    logger.info(f"Exécution de la tâche de test avec {x} et {y}")
    return x + y
