from typing import Any

import httpx

from app.providers.base import ThreatProvider


class AbuseIPDBProvider(ThreatProvider):
    name = "abuseipdb"

    BASE_URL = "https://api.abuseipdb.com/api/v2"

    def __init__(self, api_key: str | None):
        self.api_key = api_key

    async def check(self, indicator: str) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("AbuseIPDB API key is not configured")

        headers = {
            "Accept": "application/json",
            "Key": self.api_key,
        }

        params = {
            "ipAddress": indicator,
            "maxAgeInDays": 90,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{self.BASE_URL}/check",
                headers=headers,
                params=params,
            )

        response.raise_for_status()

        return response.json()

    async def health_check(self) -> bool:
        return bool(self.api_key)
