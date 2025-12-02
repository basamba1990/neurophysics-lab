# app/api/routers/auth.py

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from database.supabase_client import get_supabase
from models.pydantic_models import UserCreate, UserResponse, Token
from core.security import create_access_token
from api.dependencies import get_repository_factory, RepoFactory
from core.exceptions import AuthenticationError

router = APIRouter()
security = HTTPBearer()

# ✅ Récupérer le client Supabase via la fonction
supabase = get_supabase()


@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate, 
    repo_factory: RepoFactory = Depends(get_repository_factory)
):
    # Vérifier si l'utilisateur existe déjà
    existing_user = await repo_factory.users.get_by_email(user_data.email)
    if existing_user:
        raise AuthenticationError("User with this email already exists")
    
    try:
        # Créer l'utilisateur dans Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user:
            # Créer le profil utilisateur dans ta base
            user_profile = await repo_factory.users.create(
                user_data, 
                auth_response.user.id
            )
            
            # Générer le token d'accès
            access_token = create_access_token(
                data={"sub": auth_response.user.id}
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": UserResponse(
                    id=user_profile.id,
                    email=user_profile.email,
                    full_name=user_profile.full_name,
                    role=user_profile.role,
                    expertise_area=user_profile.expertise_area
                )
            }
        else:
            raise AuthenticationError("Failed to create user account")
            
    except Exception as e:
        raise AuthenticationError(f"Registration failed: {str(e)}")


@router.post("/login", response_model=Token)
async def login(
    user_data: UserCreate,
    repo_factory: RepoFactory = Depends(get_repository_factory)
):
    try:
        # Authentifier avec Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user:
            user = await repo_factory.users.get_by_id(auth_response.user.id)
            access_token = create_access_token(data={"sub": user.id})
            
            return {
                "access_token": access_token,
                "token_type": "bearer", 
                "user": UserResponse(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    expertise_area=user.expertise_area
                )
            }
        else:
            raise AuthenticationError("Invalid credentials")
            
    except Exception as e:
        raise AuthenticationError(f"Login failed: {str(e)}")


@router.post("/logout")
async def logout():
    supabase.auth.sign_out()
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: UserResponse = Depends(get_repository_factory)
):
    return current_user


@router.post("/refresh-token")
async def refresh_token():
    # Endpoint pour rafraîchir le token (à implémenter si nécessaire)
    return {"message": "Token refresh endpoint"}
