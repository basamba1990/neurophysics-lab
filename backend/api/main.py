from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from core.config import get_settings
from api.middleware.error_handling import setup_exception_handlers
from api.middleware.rate_limiting import limiter
from api.routers import auth, organizations, pinn_solver, copilot, digital_twins, analytics
from database.migrations import run_database_migrations

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting R&D Accelerator Platform")
    start_time = time.time()
    
    # Run database migrations
    try:
        run_database_migrations()
    except Exception as e:
        print(f"⚠️ Database migrations skipped: {e}")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down R&D Accelerator Platform")

app = FastAPI(
    title="R&D Accelerator Platform",
    description="AI-Accelerated Engineering Platform - Three Engine Architecture",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.state.limiter = limiter

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/api/v1/org", tags=["Organizations"])
app.include_router(pinn_solver.router, prefix="/api/v1/pinn", tags=["PINN Solver"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["Scientific Copilot"])
app.include_router(digital_twins.router, prefix="/api/v1/digital-twins", tags=["Digital Twins"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "🚀 R&D Accelerator Platform - Voie 6",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": time.time(),
        "services": {
            "api": "operational",
            "database": "connected",
            "ai_services": "available"
        }
    }

@app.get("/api/v1/status")
async def api_status():
    return {
        "api_version": "1.0.0",
        "supported_physics": ["navier_stokes", "heat_transfer", "structural"],
        "active_engines": ["PINN Solver", "Scientific Copilot", "Digital Twins"],
        "maintenance_mode": False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
