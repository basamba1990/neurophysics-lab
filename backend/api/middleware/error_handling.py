from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
import logging

from core.exceptions import (
    RDAcceleratorException, 
    PhysicsValidationError,
    SimulationError,
    QuotaExceededError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError
)

logger = logging.getLogger("api")

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": "internal_error"
        }
    )

async def rd_accelerator_exception_handler(request: Request, exc: RDAcceleratorException):
    logger.warning(f"Business exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "type": exc.__class__.__name__
        }
    )

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded",
            "type": "rate_limit_exceeded"
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "type": "http_exception"
        }
    )

def setup_exception_handlers(app):
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(RDAcceleratorException, rd_accelerator_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    
    # Specific exception handlers
    app.add_exception_handler(PhysicsValidationError, rd_accelerator_exception_handler)
    app.add_exception_handler(SimulationError, rd_accelerator_exception_handler)
    app.add_exception_handler(QuotaExceededError, rd_accelerator_exception_handler)
    app.add_exception_handler(AuthenticationError, rd_accelerator_exception_handler)
    app.add_exception_handler(AuthorizationError, rd_accelerator_exception_handler)
    app.add_exception_handler(ResourceNotFoundError, rd_accelerator_exception_handler)
