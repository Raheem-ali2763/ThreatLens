from app.auth import get_current_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentResponse


router = APIRouter(dependencies=[Depends(get_current_user)], 
    prefix="/api/incidents",
    tags=["Incidents"],
)


@router.get("/", response_model=list[IncidentResponse])
def list_incidents(
    db: Session = Depends(get_db),
):
    return (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .limit(100)
        .all()
    )


@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        return {"error": "Incident not found"}

    incident.status = status
    db.commit()
    db.refresh(incident)

    return incident
