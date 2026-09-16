from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.threatfox import threatfox_service


router = APIRouter(
    prefix="/api/ingestion",
    tags=["Threat Intelligence Ingestion"]
)


@router.post("/threatfox")
async def ingest_threatfox(
    db: Session = Depends(get_db)
):
    try:
        data = await threatfox_service.fetch_recent()

        if data.get("query_status") != "ok":
            return {
                "status": "success",
                "source": "threatfox",
                "records_received": 0,
                "message": data.get("query_status")
            }

        iocs = data.get("data", [])

        inserted = 0
        updated = 0

        for item in iocs:

            value = item.get("ioc")
            ioc_type = item.get("ioc_type")

            if not value or not ioc_type:
                continue

            confidence = int(
                item.get("confidence_level") or 50
            )

            _, created = await threatfox_service.ingest(
                db=db,
                ioc_type=ioc_type,
                value=value,
                confidence=confidence,
                raw_data=str(item)
            )

            if created:
                inserted += 1
            else:
                updated += 1

        return {
            "status": "success",
            "source": "threatfox",
            "records_received": len(iocs),
            "inserted": inserted,
            "updated": updated
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"ThreatFox ingestion failed: {exc}"
        )
