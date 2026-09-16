from app.enrichment.providers.virustotal import virustotal_provider


class EnrichmentService:

    async def enrich_ip(self, ip: str) -> dict:
        result = await virustotal_provider.lookup_ip(ip)

        return {
            "provider": "virustotal",
            "ioc_type": "ip",
            "value": ip,
            "result": result,
        }


enrichment_service = EnrichmentService()
