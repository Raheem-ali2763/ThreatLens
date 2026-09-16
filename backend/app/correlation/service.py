from sqlalchemy.orm import Session

from app.models.ioc import IOC
from app.alerts.service import create_alert
from app.incidents.service import create_incident


def correlate_event(db: Session, event):
    matches = []

    values = [
        event.source_ip,
        event.destination_ip,
        event.destination_domain,
    ]

    values = [v for v in values if v]

    for value in values:
        iocs = (
            db.query(IOC)
            .filter(
                IOC.value == value,
                IOC.is_active.is_(True),
            )
            .all()
        )

        matches.extend(iocs)

    unique_matches = {
        ioc.id: ioc
        for ioc in matches
    }

    if not unique_matches:
        return []

    highest_confidence = max(
        ioc.confidence
        for ioc in unique_matches.values()
    )

    if highest_confidence >= 80:
        event.severity = "critical"
    elif highest_confidence >= 60:
        event.severity = "high"
    elif highest_confidence >= 30:
        event.severity = "medium"
    else:
        event.severity = "low"

    highest_ioc = max(
        unique_matches.values(),
        key=lambda ioc: ioc.confidence,
    )

    alert = create_alert(
        db=db,
        title=f"Threat detected: {highest_ioc.value}",
        severity=event.severity,
        ioc_id=highest_ioc.id,
        event_id=event.id,
        description=(
            f"Internal event matched known threat IOC "
            f"{highest_ioc.value} from source "
            f"{highest_ioc.source}."
        ),
    )

    if event.severity in ("high", "critical"):
        create_incident(
            db=db,
            alert=alert,
        )

    return list(unique_matches.values())
