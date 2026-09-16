from typing import Any

import httpx

from app.normalizers.ioc import normalize_ioc
from app.services.deduplication import create_or_update_ioc
from sqlalchemy.orm import Session


class FeedService:

    async def fetch_urlhaus(self) -> dict[str, Any]:
        url = "https://urlhaus.abuse.ch/api/v1/urls/recent/"

        headers = {
            "User-Agent": "ThreatLens/0.2.0"
        }

        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
        ) as client:
            response = await client.get(url, headers=headers)

        response.raise_for_status()

        return response.json()

    async def ingest_ioc(
        self,
        db: Session,
        ioc_type: str,
        value: str,
        source: str,
        confidence: int = 0,
        tags: str | None = None,
        raw_data: str | None = None,
    ):
        normalized = normalize_ioc(ioc_type, value)

        return create_or_update_ioc(
            db=db,
            ioc_type=normalized["ioc_type"],
            value=normalized["value"],
            source=source,
            confidence=confidence,
            tags=tags,
            raw_data=raw_data,
        )


feed_service = FeedService()
