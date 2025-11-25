from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, organizations, pinn_solver, copilot, digital_twins, analytics
from ..core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API pour la Plateforme d'Ingénierie Accélérée par IA",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À ajuster en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(pinn_solver.router, prefix="/api/v1/pinn", tags=["pinn"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["copilot"])
app.include_router(digital_twins.router, prefix="/api/v1/dt", tags=["digital-twins"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
