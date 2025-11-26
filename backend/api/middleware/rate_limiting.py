from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)

# Rate limit configuration
rate_limit_config = {
    "default": "100/minute",
    "pinn_simulation": "10/minute",
    "copilot_analysis": "30/minute", 
    "auth": "5/minute",
    "digital_twin_optimization": "5/minute"
}

def get_rate_limit(key: str) -> str:
    return rate_limit_config.get(key, rate_limit_config["default"])
