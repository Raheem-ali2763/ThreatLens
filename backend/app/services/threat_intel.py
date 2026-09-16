from typing import Any

from app.core_config import settings
from app.providers.registry import ProviderRegistry


class ThreatIntelService:
    def __init__(self):
        self.registry = ProviderRegistry(
            abuseipdb_api_key=settings.ABUSEIPDB_API_KEY
        )

    async def check_indicator(
        self,
        provider_name: str,
        indicator: str,
    ) -> dict[str, Any]:
        provider = self.registry.get(provider_name)

        result = await provider.check(indicator)

        return {
            "provider": provider.name,
            "indicator": indicator,
            "data": result,
        }

    def available_providers(self) -> list[str]:
        return self.registry.list_providers()


threat_intel_service = ThreatIntelService()
