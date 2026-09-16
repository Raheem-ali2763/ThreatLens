from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.hunting.service import search_threats


router = APIRouter(
    prefix="/api/hunting",
    tags=["Threat Hunting"],
)


@router.get("/search")
def hunt(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    result = search_threats(db, q)

    return {
        "query": result["query"],
        "total": result["total"],
        "iocs": [
            {
                "id": item.id,
                "ioc_type": item.ioc_type,
                "value": item.value,
                "source": item.source,
                "confidence": item.confidence,
                "tags": item.tags,
                "is_active": item.is_active,
            }
            for item in result["iocs"]
        ],
        "events": [
            {
                "id": item.id,
                "event_type": item.event_type,
                "source_ip": item.source_ip,
                "destination_ip": item.destination_ip,
                "destination_domain": item.destination_domain,
                "hostname": item.hostname,
                "username": item.username,
                "severity": item.severity,
                "created_at": item.created_at,
            }
            for item in result["events"]
        ],
        "alerts": [
            {
                "id": item.id,
                "title": item.title,
                "severity": item.severity,
                "status": item.status,
                "ioc_id": item.ioc_id,
                "event_id": item.event_id,
                "created_at": item.created_at,
            }
            for item in result["alerts"]
        ],
        "incidents": [
            {
                "id": item.id,
                "title": item.title,
                "severity": item.severity,
                "status": item.status,
                "alert_id": item.alert_id,
                "created_at": item.created_at,
            }
            for item in result["incidents"]
        ],
    }
