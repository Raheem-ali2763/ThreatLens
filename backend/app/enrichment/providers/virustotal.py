import httpx

from app.core_config import settings


class VirusTotalProvider:

    BASE_URL = "https://www.virustotal.com/api/v3"

    async def lookup_ip(self, ip: str) -> dict:
        headers = {
            "x-apikey": settings.VIRUSTOTAL_API_KEY
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.BASE_URL}/ip_addresses/{ip}",
                headers=headers
            )

        response.raise_for_status()

        data = response.json()

        attributes = data.get("data", {}).get("attributes", {})

        return {
            "ip": ip,
            "reputation": attributes.get("reputation", 0),
            "malicious": attributes.get("last_analysis_stats", {}).get(
                "malicious", 0
            ),
            "suspicious": attributes.get("last_analysis_stats", {}).get(
                "suspicious", 0
            ),
            "harmless": attributes.get("last_analysis_stats", {}).get(
                "harmless", 0
            ),
            "undetected": attributes.get("last_analysis_stats", {}).get(
                "undetected", 0
            ),
        }


virustotal_provider = VirusTotalProvider()
