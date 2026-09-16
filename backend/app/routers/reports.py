from app.auth import get_current_user
import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ioc import IOC
from app.models.event import InternalEvent
from app.models.alert import Alert
from app.models.incident import Incident


router = APIRouter(dependencies=[Depends(get_current_user)], 
    prefix="/api/reports",
    tags=["Reports"],
)


@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "record_type",
        "id",
        "value",
        "ioc_type",
        "source",
        "confidence",
        "severity",
        "status",
        "related_ioc",
        "related_event",
        "related_alert",
        "created_at",
    ])

    for ioc in db.query(IOC).order_by(IOC.id).all():
        writer.writerow([
            "IOC",
            ioc.id,
            ioc.value,
            ioc.ioc_type,
            ioc.source,
            ioc.confidence,
            "",
            "active" if ioc.is_active else "inactive",
            ioc.id,
            "",
            "",
            ioc.first_seen,
        ])

    for event in (
        db.query(InternalEvent)
        .order_by(InternalEvent.id)
        .all()
    ):
        writer.writerow([
            "EVENT",
            event.id,
            event.destination_ip or event.destination_domain or "",
            "",
            event.event_type,
            "",
            event.severity,
            "",
            "",
            event.id,
            "",
            event.created_at,
        ])

    for alert in db.query(Alert).order_by(Alert.id).all():
        writer.writerow([
            "ALERT",
            alert.id,
            alert.title,
            "",
            "",
            "",
            alert.severity,
            alert.status,
            alert.ioc_id or "",
            alert.event_id or "",
            alert.id,
            alert.created_at,
        ])

    for incident in (
        db.query(Incident)
        .order_by(Incident.id)
        .all()
    ):
        writer.writerow([
            "INCIDENT",
            incident.id,
            incident.title,
            "",
            "",
            "",
            incident.severity,
            incident.status,
            "",
            "",
            incident.alert_id or "",
            incident.created_at,
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=threatlens-report.csv"
        },
    )
