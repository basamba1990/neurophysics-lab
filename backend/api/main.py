import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import des routers (assurez-vous que tous les imports sont corrects)
from .routers import (
    auth, 
    organization, # <-- CORRIGÉ : organizations remplacé par organization
    pinn_solver, 
    copilot, 
    digital_twins, 
    analytics, 
    orchestrator, 
    async_tasks, 
    vector_db
)

# NOTE CRITIQUE: La fonction run_database_migrations() a été retirée de l'événement de démarrage.
# Les migrations doivent être exécutées séparément via un script CI/CD (migrate_db.sh)
# avant le déploiement de l'application.

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialisation des ressources (ex: connexion Redis, etc.)
    print("Application démarrée. Les migrations de base de données ne sont PAS exécutées ici.")
    yield
    # Nettoyage des ressources (ex: fermeture des connexions)
    print("Application arrêtée.")

app = FastAPI(lifespan=lifespan)

# --- Configuration CORS Corrigée ---
# NOTE: allow_origins doit être restreint aux domaines de production/prévisualisation.
# Pour l'exemple, nous utilisons "*" mais il est fortement recommandé de le limiter.
# Les en-têtes 'Authorization' et 'Content-Type' sont critiques pour l'authentification.

# Récupérer les origines autorisées depuis les variables d'environnement
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    # Correction critique: Ajout des en-têtes nécessaires pour Supabase et l'authentification
    allow_headers=["Authorization", "Content-Type", "X-Client-Info", "apikey"], 
)

# --- Inclusion des Routers Corrigée ---
# Assurez-vous que tous les routers sont inclus pour éviter les erreurs 404

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(organization.router, prefix="/api/v1/organizations", tags=["Organizations"]) # <-- NOTE: Le router est inclus sous le nom 'organization'
app.include_router(pinn_solver.router, prefix="/api/v1/pinn", tags=["PINN Solver"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["Copilot"])
app.include_router(digital_twins.router, prefix="/api/v1/digital-twins", tags=["Digital Twins"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(orchestrator.router, prefix="/api/v1/orchestrator", tags=["Orchestrator"])
app.include_router(async_tasks.router, prefix="/api/v1/tasks", tags=["Async Tasks"])
app.include_router(vector_db.router, prefix="/api/v1/vector-db", tags=["Vector DB"])

# --- Health Check Ajouté ---
# Endpoint essentiel pour la vérification de l'état du service par les outils de déploiement

@app.get("/health")
def health():
    """Vérification de l'état de santé de l'API."""
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}

# Point d'entrée principal pour le serveur Uvicorn
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
