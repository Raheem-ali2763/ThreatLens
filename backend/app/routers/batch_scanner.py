from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.ioc import IOC


router = APIRouter(
    prefix="/api/scanner",
    tags=["Batch Scanner"],
)


class BatchScanRequest(BaseModel):
    indicators: list[str] = Field(..., min_length=1, max_length=100)


def detect_type(value: str) -> str:
    import ipaddress

    try:
        ipaddress.ip_address(value)
        return "ip"
    except ValueError:
        pass

    if value.startswith(("http://", "https://")):
        return "url"

    if "@" in value:
        return "email"

    return "domain"


@router.post("/batch")
def batch_scan(payload: BatchScanRequest):
    values = []

    for raw in payload.indicators:
        value = raw.strip().lower()
        if value and value not in values:
            values.append(value)

    if not values:
        raise HTTPException(
            status_code=400,
            detail="No valid indicators supplied",
        )

    db: Session = SessionLocal()

    try:
        results = []

        for value in values:
            ioc_type = detect_type(value)

            matches = (
                db.query(IOC)
                .filter(IOC.value.ilike(value))
                .all()
            )

            if matches:
                best = max(
                    matches,
                    key=lambda item: item.confidence or 0,
                )

                confidence = best.confidence or 0

                if confidence >= 85:
                    severity = "critical"
                elif confidence >= 60:
                    severity = "high"
                elif confidence >= 30:
                    severity = "medium"
                else:
                    severity = "low"

                results.append({
                    "value": value,
                    "ioc_type": best.ioc_type,
                    "found": True,
                    "source": best.source,
                    "confidence": confidence,
                    "severity": severity,
                    "tags": best.tags,
                    "ioc_id": best.id,
                    "is_active": best.is_active,
                })
            else:
                results.append({
                    "value": value,
                    "ioc_type": ioc_type,
                    "found": False,
                    "source": None,
                    "confidence": 0,
                    "severity": "unknown",
                    "tags": None,
                    "ioc_id": None,
                    "is_active": False,
                })

        found = sum(1 for item in results if item["found"])

        return {
            "total": len(results),
            "found": found,
            "not_found": len(results) - found,
            "results": results,
        }

    finally:
        db.close()
