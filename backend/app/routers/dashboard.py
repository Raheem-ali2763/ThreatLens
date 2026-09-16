from app.auth import get_current_user
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ioc import IOC
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.event import InternalEvent

router = APIRouter(dependencies=[Depends(get_current_user)], prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview(db: Session = Depends(get_db)):

    total_iocs = db.query(IOC).count()
    total_events = db.query(InternalEvent).count()

    open_alerts = (
        db.query(Alert)
        .filter(Alert.status == "open")
        .count()
    )

    active_incidents = (
        db.query(Incident)
        .filter(Incident.status == "open")
        .count()
    )

    alerts = db.query(Alert).order_by(
        Alert.created_at.desc()
    ).limit(8).all()

    critical = (
        db.query(Alert)
        .filter(
            Alert.status == "open",
            Alert.severity == "critical"
        )
        .count()
    )

    high = (
        db.query(Alert)
        .filter(
            Alert.status == "open",
            Alert.severity == "high"
        )
        .count()
    )

    medium = (
        db.query(Alert)
        .filter(
            Alert.status == "open",
            Alert.severity == "medium"
        )
        .count()
    )

    low = (
        db.query(Alert)
        .filter(
            Alert.status == "open",
            Alert.severity == "low"
        )
        .count()
    )

    total_open = critical + high + medium + low

    if total_open:
        risk_score = round(
            (
                critical * 100
                + high * 75
                + medium * 50
                + low * 25
            ) / total_open
        )
    else:
        risk_score = 0

    # Last 7 days activity
    now = datetime.now(timezone.utc)
    activity = []

    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()

        start = datetime.combine(
            day,
            datetime.min.time(),
            tzinfo=timezone.utc
        )

        end = start + timedelta(days=1)

        count = (
            db.query(Alert)
            .filter(
                Alert.created_at >= start,
                Alert.created_at < end
            )
            .count()
        )

        activity.append({
            "date": day.isoformat(),
            "alerts": count
        })

    latest_alerts = []

    for alert in alerts:
        latest_alerts.append({
            "id": alert.id,
            "title": alert.title,
            "description": alert.description,
            "severity": alert.severity,
            "status": alert.status,
            "ioc_id": alert.ioc_id,
            "event_id": alert.event_id,
            "created_at": (
                alert.created_at.isoformat()
                if alert.created_at
                else None
            ),
        })

    return {
        "total_iocs": total_iocs,
        "total_events": total_events,
        "open_alerts": open_alerts,
        "active_incidents": active_incidents,
        "environment_risk": risk_score,

        "severity": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },

        "activity": activity,
        "alerts": latest_alerts,
    }


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    return {
        "total_iocs": db.query(IOC).count(),
        "total_events": db.query(InternalEvent).count(),
        "open_alerts": db.query(Alert)
            .filter(Alert.status == "open")
            .count(),
        "active_incidents": db.query(Incident)
            .filter(Incident.status == "open")
            .count(),
    }
