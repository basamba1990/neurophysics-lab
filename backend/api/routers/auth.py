from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin):
    # Logique de connexion (ex: via Supabase)
    if user.email == "test@example.com" and user.password == "password":
        return {"message": "Connexion réussie", "token": "fake-jwt-token"}
    raise HTTPException(status_code=401, detail="Identifiants invalides")

@router.post("/signup")
def signup(user: UserLogin):
    # Logique d'inscription
    return {"message": "Inscription réussie"}
