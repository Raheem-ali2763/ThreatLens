from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/protected",
    tags=["Authentication"]
)


@router.get("/test")
def protected_test(current_user: User = Depends(get_current_user)):
    return {
        "status": "authenticated",
        "message": "ThreatLens protected API is working",
        "user": current_user.username,
        "role": current_user.role,
    }
