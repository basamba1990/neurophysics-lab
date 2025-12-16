from celery import Celery
from supabase import create_client
import os
import asyncio

# Configuration Celery avec Redis
celery_app = Celery('neurophysics_tasks',
                    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
                    backend=os.getenv('REDIS_URL'))

# Client Supabase pour la communication bidirectionnelle
# NOTE: Assurez-vous que SUPABASE_URL et SUPABASE_SERVICE_KEY sont définis dans l'environnement du worker Celery
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Fonction utilitaire pour exécuter des fonctions asynchrones dans Celery
def run_async(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    if loop.is_running():
        return loop.create_task(func(*args, **kwargs))
    else:
        return loop.run_until_complete(func(*args, **kwargs))

@celery_app.task(bind=True, name='pinn.tasks.start_simulation')
def start_pinn_simulation(self, simulation_params: dict, orchestration_id: str):
    """Tâche exécutée par un worker Celery, déclenchée par l'orchestrateur."""
    
    # NOTE: L'importation doit être faite ici pour éviter les problèmes de dépendances circulaires
    # et pour s'assurer que le worker Celery a accès au code du solveur.
    from services.pinns_solver import NavierStokesSolver # Assurez-vous que ce chemin est correct
    
    async def _run_simulation():
        try:
            # Mise à jour de l'état pour le suivi
            self.update_state(state='PROGRESS', meta={'progress': 10, 'status': 'Initializing physics model...'})
            
            # 1. Logique de simulation existante (adaptée)
            solver = NavierStokesSolver(simulation_params)
            # La méthode train_and_predict doit être awaitable
            results = await solver.train_and_predict() 
            
            # 2. Notification des résultats à l'orchestrateur principal
            # Utilisation de la méthode postgrest pour upsert (plus robuste)
            supabase.table('orchestration_results').upsert({
                'orchestration_id': orchestration_id,
                'engine': 'PINN_SOLVER',
                'results': results,
                'status': 'COMPLETED',
                'completed_at': 'now()'
            }).execute()
            
            return {'status': 'SUCCESS', 'results': results}
            
        except Exception as e:
            # Log d'erreur et notification
            supabase.table('orchestration_errors').insert({
                'orchestration_id': orchestration_id,
                'engine': 'PINN_SOLVER',
                'error': str(e),
                'occurred_at': 'now()'
            }).execute()
            raise

    # Exécuter la fonction asynchrone
    return run_async(_run_simulation)

# Exemple de tâche simple pour le test
@celery_app.task(name='test.add')
def add(x, y):
    return x + y
