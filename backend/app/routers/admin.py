from fastapi import APIRouter, Depends

from app.auth import require_roles

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/test")
def admin_test(
    current_user=Depends(require_roles("admin"))
):
    return {
        "status": "authorized",
        "message": "Admin access granted",
        "user": current_user.username,
        "role": current_user.role
    }
