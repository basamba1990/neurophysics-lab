# /app/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

# MODIFIEZ CETTE IMPORTATION
from database.supabase_client import get_supabase
from database.repositories import RepositoryFactory
from core.security import verify_token
from models.domain_models import User

security = HTTPBearer()

# Créez l'instance supabase au niveau du module
supabase = get_supabase()

async def get_current_user(token: dict = Depends(verify_token)) -> User:
    repo_factory = RepositoryFactory(supabase)
    user = await repo_factory.users.get_by_id(token.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.role == "inactive":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_repository_factory():
    return RepositoryFactory(supabase)
