from fastapi import HTTPException, status

class RDAcceleratorException(HTTPException):
    """Base exception for R&D Accelerator Platform"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class PhysicsValidationError(RDAcceleratorException):
    """Physics laws validation error"""
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class SimulationError(RDAcceleratorException):
    """Simulation execution error"""
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ModelTrainingError(RDAcceleratorException):
    """Model training error"""
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CodeAnalysisError(RDAcceleratorException):
    """Code analysis error"""
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class QuotaExceededError(RDAcceleratorException):
    """Usage quota exceeded"""
    def __init__(self, detail: str = "Quota exceeded"):
        super().__init__(detail=detail, status_code=status.HTTP_429_TOO_MANY_REQUESTS)

class AuthenticationError(RDAcceleratorException):
    """Authentication error"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class AuthorizationError(RDAcceleratorException):
    """Authorization error"""
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class ResourceNotFoundError(RDAcceleratorException):
    """Resource not found error"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)
