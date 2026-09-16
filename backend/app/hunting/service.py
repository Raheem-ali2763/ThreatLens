from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.ioc import IOC
from app.models.event import InternalEvent
from app.models.alert import Alert
from app.models.incident import Incident


def search_threats(db: Session, query: str):
    pattern = f"%{query}%"

    iocs = (
        db.query(IOC)
        .filter(
            or_(
                IOC.value.ilike(pattern),
                IOC.ioc_type.ilike(pattern),
                IOC.source.ilike(pattern),
                IOC.tags.ilike(pattern),
            )
        )
        .limit(50)
        .all()
    )

    events = (
        db.query(InternalEvent)
        .filter(
            or_(
                InternalEvent.source_ip.ilike(pattern),
                InternalEvent.destination_ip.ilike(pattern),
                InternalEvent.destination_domain.ilike(pattern),
                InternalEvent.hostname.ilike(pattern),
                InternalEvent.username.ilike(pattern),
            )
        )
        .limit(50)
        .all()
    )

    alerts = (
        db.query(Alert)
        .filter(
            or_(
                Alert.title.ilike(pattern),
                Alert.description.ilike(pattern),
                Alert.severity.ilike(pattern),
                Alert.status.ilike(pattern),
            )
        )
        .limit(50)
        .all()
    )

    incidents = (
        db.query(Incident)
        .filter(
            or_(
                Incident.title.ilike(pattern),
                Incident.description.ilike(pattern),
                Incident.severity.ilike(pattern),
                Incident.status.ilike(pattern),
            )
        )
        .limit(50)
        .all()
    )

    return {
        "query": query,
        "iocs": iocs,
        "events": events,
        "alerts": alerts,
        "incidents": incidents,
        "total": (
            len(iocs)
            + len(events)
            + len(alerts)
            + len(incidents)
        ),
    }
