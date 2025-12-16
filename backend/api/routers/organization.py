from fastapi import APIRouter, Depends
from typing import List

from api.dependencies import CurrentUser, RepoFactory
from models.pydantic_models import OrganizationResponse, UserResponse

router = APIRouter()

@router.get("/my-organization", response_model=OrganizationResponse)
async def get_my_organization(
    current_user: CurrentUser, 
    repo_factory: RepoFactory
):
    # Simplified implementation - in reality you'd get the user's organization
    return OrganizationResponse(
        id="org_123",
        name="Demo Organization",
        subscription_tier="premium",
        created_at="2024-01-01T00:00:00Z"
    )

@router.get("/team-members", response_model=List[UserResponse])
async def get_team_members(
    current_user: CurrentUser, 
    repo_factory: RepoFactory
):
    # Simplified implementation
    return [
        UserResponse(
            id="user_1",
            email="engineer1@company.com",
            full_name="Engineer One",
            role="engineer",
            expertise_area={"cfd": "expert", "python": "advanced"}
        ),
        UserResponse(
            id="user_2", 
            email="engineer2@company.com",
            full_name="Engineer Two",
            role="engineer", 
            expertise_area={"thermodynamics": "expert", "fortran": "advanced"}
        )
    ]

@router.get("/subscription")
async def get_subscription_info(current_user: CurrentUser):
    return {
        "plan": "premium",
        "status": "active",
        "limits": {
            "pinn_simulations": 100,
            "copilot_requests": 1000,
            "storage_gb": 100
        },
        "usage": {
            "pinn_simulations_used": 15,
            "copilot_requests_used": 45,
            "storage_used_gb": 0.125
        }
    }
