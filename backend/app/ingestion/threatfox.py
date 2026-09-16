from typing import Any
import httpx
from app.core_config import settings
from app.normalizers.ioc import normalize_ioc
from app.services.deduplication import create_or_update_ioc


class ThreatFoxService:

    async def fetch_recent(self) -> dict[str, Any]:
        url = "https://threatfox-api.abuse.ch/api/v1/"
        payload = {
            "query": "get_iocs",
            "days": 1
        }

        headers = {
    "User-Agent": "ThreatLens/0.2.0",
    "Auth-Key": settings.THREATFOX_AUTH_KEY
}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers
            )

        response.raise_for_status()
        return response.json()

    async def ingest(
        self,
        db,
        ioc_type: str,
        value: str,
        confidence: int,
        raw_data: str
    ):
        normalized = normalize_ioc(ioc_type, value)

        return create_or_update_ioc(
            db=db,
            ioc_type=normalized["ioc_type"],
            value=normalized["value"],
            source="threatfox",
            confidence=confidence,
            tags="threatfox",
            raw_data=raw_data,
        )


threatfox_service = ThreatFoxService()
