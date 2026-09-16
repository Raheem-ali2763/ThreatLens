from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.ingestion.feed_service import feed_service

router = APIRouter(
    prefix="/api/ingestion",
    tags=["Threat Intelligence Ingestion"],
)


@router.get("/sources")
def ingestion_sources():
    return {
        "sources": ["urlhaus"]
    }


@router.post("/urlhaus")
async def ingest_urlhaus(
    db: Session = Depends(get_db),
):
    try:
        data = await feed_service.fetch_urlhaus()

        urls = data.get("urls", [])

        inserted = 0
        updated = 0

        for item in urls:
            url = item.get("url")

            if not url:
                continue

            ioc, created = await feed_service.ingest_ioc(
                db=db,
                ioc_type="url",
                value=url,
                source="urlhaus",
                confidence=80,
                tags="urlhaus,malware",
                raw_data=str(item),
            )

            if created:
                inserted += 1
            else:
                updated += 1

        return {
            "status": "success",
            "source": "urlhaus",
            "records_received": len(urls),
            "inserted": inserted,
            "updated": updated,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Feed ingestion failed: {exc}",
        )
