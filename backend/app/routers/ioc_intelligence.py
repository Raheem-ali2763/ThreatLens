from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.ioc import IOC

router = APIRouter(prefix="/api/intelligence", tags=["IOC Intelligence"])


@router.get("/search")
def search_ioc(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    value = q.strip().lower()

    iocs = (
        db.query(IOC)
        .filter(
            or_(
                IOC.value.ilike(f"%{value}%"),
                IOC.tags.ilike(f"%{value}%"),
                IOC.source.ilike(f"%{value}%"),
            )
        )
        .order_by(IOC.last_seen.desc())
        .limit(50)
        .all()
    )

    results = []

    for ioc in iocs:
        confidence = ioc.confidence or 0

        if confidence >= 85:
            severity = "Critical"
        elif confidence >= 60:
            severity = "High"
        elif confidence >= 30:
            severity = "Medium"
        else:
            severity = "Low"

        results.append({
            "id": ioc.id,
            "ioc_type": ioc.ioc_type,
            "value": ioc.value,
            "source": ioc.source,
            "confidence": confidence,
            "severity": severity,
            "tags": ioc.tags,
            "first_seen": ioc.first_seen.isoformat() if ioc.first_seen else None,
            "last_seen": ioc.last_seen.isoformat() if ioc.last_seen else None,
            "is_active": ioc.is_active,
            "raw_data": ioc.raw_data,
        })

    return {
        "query": q,
        "count": len(results),
        "results": results
    }


@router.get("/{ioc_id}")
def get_ioc_intelligence(
    ioc_id: int,
    db: Session = Depends(get_db)
):
    ioc = db.query(IOC).filter(IOC.id == ioc_id).first()

    if not ioc:
        raise HTTPException(status_code=404, detail="IOC not found")

    confidence = ioc.confidence or 0

    if confidence >= 85:
        severity = "Critical"
    elif confidence >= 60:
        severity = "High"
    elif confidence >= 30:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "id": ioc.id,
        "ioc_type": ioc.ioc_type,
        "value": ioc.value,
        "source": ioc.source,
        "confidence": confidence,
        "severity": severity,
        "tags": ioc.tags,
        "first_seen": ioc.first_seen.isoformat() if ioc.first_seen else None,
        "last_seen": ioc.last_seen.isoformat() if ioc.last_seen else None,
        "is_active": ioc.is_active,
        "raw_data": ioc.raw_data,
    }
