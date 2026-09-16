from app.providers.abuseipdb import AbuseIPDBProvider


class ProviderRegistry:
    def __init__(self, abuseipdb_api_key: str | None):
        self.providers = {
            "abuseipdb": AbuseIPDBProvider(abuseipdb_api_key),
        }

    def get(self, name: str):
        provider = self.providers.get(name)

        if not provider:
            raise ValueError(f"Unknown threat provider: {name}")

        return provider

    def list_providers(self):
        return list(self.providers.keys())
