from sqlalchemy.orm import Session

from app.models.incident import Incident


def create_incident(
    db: Session,
    alert,
):
    incident = Incident(
        title=f"Incident: {alert.title}",
        severity=alert.severity,
        status="open",
        alert_id=alert.id,
        description=alert.description,
    )

    db.add(incident)
    db.flush()

    return incident
