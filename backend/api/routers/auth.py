from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from supabase import Client

from database.supabase_client import supabase
from models.pydantic_models import UserCreate, UserResponse, Token
from core.security import create_access_token, verify_password, get_password_hash
from api.dependencies import get_repository_factory, RepoFactory
from core.exceptions import AuthenticationError

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate, 
    repo_factory: RepoFactory = Depends(get_repository_factory)
):
    # Check if user already exists
    existing_user = await repo_factory.users.get_by_email(user_data.email)
    if existing_user:
        raise AuthenticationError("User with this email already exists")
    
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user:
            # Create user profile
            user_profile = await repo_factory.users.create(
                user_data, 
                auth_response.user.id
            )
            
            # Create access token
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
        # Authenticate with Supabase
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
    # Token refresh logic would go here
    return {"message": "Token refresh endpoint"}
