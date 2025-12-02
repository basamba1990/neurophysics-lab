import logging
import sys
import json
import os
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'extra_data'):
            log_entry.update(record.extra_data)
            
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)

def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger(name)
    
    if logger.hasHandlers():
        logger.handlers.clear()
    
    logger.setLevel(getattr(logging, level.upper()))
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    
    # --- FIX : créer le dossier logs s'il n'existe pas ---
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "application.log")
    # ------------------------------------------------------
    
    # File handler for errors
    file_handler = logging.FileHandler(log_path)
    file_handler.setFormatter(JSONFormatter())
    file_handler.setLevel(logging.ERROR)
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    logger.propagate = False
    return logger

# Create loggers for different modules
pinn_logger = setup_logger("pinn_solver")
copilot_logger = setup_logger("scientific_copilot")
optimization_logger = setup_logger("optimization_engine")
api_logger = setup_logger("api")
database_logger = setup_logger("database")

def log_extra_data(logger: logging.Logger, message: str, extra_data: Dict[str, Any], level: str = "info"):
    log_method = getattr(logger, level.lower())
    log_method(message, extra={"extra_data": extra_data})
