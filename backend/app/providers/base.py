from abc import ABC, abstractmethod
from typing import Any


class ThreatProvider(ABC):
    name: str

    @abstractmethod
    async def check(self, indicator: str) -> dict[str, Any]:
        """Check an indicator against the threat intelligence provider."""
        raise NotImplementedError

    @abstractmethod
    async def health_check(self) -> bool:
        """Check whether the provider is reachable/configured."""
        raise NotImplementedError
