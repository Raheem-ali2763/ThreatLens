from app.realtime import broadcast_sync
from sqlalchemy.orm import Session

from app.models.alert import Alert


def create_alert(
    db: Session,
    title: str,
    severity: str,
    ioc_id: int | None = None,
    event_id: int | None = None,
    description: str | None = None,
):
    alert = Alert(
        title=title,
        severity=severity,
        status="open",
        ioc_id=ioc_id,
        event_id=event_id,
        description=description,
    )

    db.add(alert)
    db.flush()


    # 🔥 REALTIME ALERT BROADCAST
    broadcast_sync({
        "type": "alert",
        "id": alert.id,
        "title": alert.title,
        "severity": alert.severity,
        "status": alert.status,
        "ioc_id": alert.ioc_id,
        "event_id": alert.event_id,
        "message": f"ThreatLens detected a {alert.severity.upper()} threat",
    })

    return alert
