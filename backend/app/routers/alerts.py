from app.auth import get_current_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse


router = APIRouter(dependencies=[Depends(get_current_user)], 
    prefix="/api/alerts",
    tags=["Alerts"],
)


@router.get("/", response_model=list[AlertResponse])
def list_alerts(
    db: Session = Depends(get_db),
):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(100)
        .all()
    )


@router.patch("/{alert_id}/status")
def update_alert_status(
    alert_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        return {"error": "Alert not found"}

    alert.status = status
    db.commit()
    db.refresh(alert)

    return alert
