import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import (
    auth,
    organization,
    pinn_solver,
    copilot,
    digital_twins,
    analytics,
    orchestrator,
    async_tasks,
    vector_db,
)


# ======================
# APP LIFECYCLE
# ======================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 NeuroPhysics API démarrée")
    yield
    print("🛑 NeuroPhysics API arrêtée")


app = FastAPI(
    title="NeuroPhysics Lab Backend",
    version="1.0.0",
    lifespan=lifespan,
)


# ======================
# CORS
# ======================

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Client-Info",
        "apikey",
    ],
)


# ======================
# ROOT (IMPORTANT)
# ======================

@app.get("/")
def root():
    return {
        "name": "NeuroPhysics Lab Backend",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# ======================
# ROUTERS
# ======================

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(organization.router, prefix="/api/v1/organizations", tags=["Organizations"])
app.include_router(pinn_solver.router, prefix="/api/v1/pinn", tags=["PINN Solver"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["Copilot"])
app.include_router(digital_twins.router, prefix="/api/v1/digital-twins", tags=["Digital Twins"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(orchestrator.router, prefix="/api/v1/orchestrator", tags=["Orchestrator"])
app.include_router(async_tasks.router, prefix="/api/v1/tasks", tags=["Async Tasks"])
app.include_router(vector_db.router, prefix="/api/v1/vector-db", tags=["Vector DB"])


# ======================
# HEALTH CHECK
# ======================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }
