import os
from typing import Annotated
from fastapi import Depends, HTTPException, status, Header
from jose import JWTError, jwt


# ======================
# AUTH JWT RÉEL
# ======================

def get_current_active_user(
    authorization: str = Header(...)
):
    """
    Extrait et valide le JWT depuis l'en-tête Authorization.
    Format attendu: Bearer <token>
    """

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header invalide"
        )

    token = authorization.replace("Bearer ", "")

    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY non configurée"
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide (sub manquant)"
            )

        class User:
            def __init__(self, id: str, email: str | None):
                self.id = id
                self.email = email

        return User(id=user_id, email=email)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ======================
# SUPABASE (FACTORY)
# ======================

from supabase import create_client, Client


def get_repository_factory():
    """
    Initialise le client Supabase (singleton par requête)
    """

    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase mal configuré (URL ou KEY manquante)"
        )

    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    )

    return supabase


# ======================
# DEPENDENCY ALIASES
# ======================

CurrentUser = Annotated[object, Depends(get_current_active_user)]
RepoFactory = Annotated[object, Depends(get_repository_factory)]
