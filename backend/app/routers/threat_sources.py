from fastapi import APIRouter
from app.core_config import settings
import httpx

router = APIRouter(prefix="/api/threat-sources", tags=["Threat Sources"])


async def check_abuseipdb():
    key = getattr(settings, "ABUSEIPDB_API_KEY", None)
    if not key:
        return {"status": "not_configured", "message": "API key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": "8.8.8.8"},
                headers={
                    "Key": key,
                    "Accept": "application/json",
                },
            )

        if r.status_code == 200:
            return {"status": "connected", "message": "API responding"}
        return {"status": "error", "message": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)[:100]}


async def check_urlhaus():
    key = getattr(settings, "URLHAUS_AUTH_KEY", None)
    if not key:
        return {"status": "not_configured", "message": "Auth-Key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://urlhaus-api.abuse.ch/v1/url/",
                data={"url": "https://example.com"},
                headers={
                    "Auth-Key": key,
                    "User-Agent": "ThreatLens/1.0",
                },
            )

        if r.status_code == 200:
            return {"status": "connected", "message": "API responding"}
        return {"status": "error", "message": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)[:100]}


async def check_threatfox():
    key = getattr(settings, "THREATFOX_AUTH_KEY", None)
    if not key:
        return {"status": "not_configured", "message": "Auth-Key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://threatfox-api.abuse.ch/api/v1/",
                json={"query": "get_iocs", "days": 1},
                headers={
                    "Auth-Key": key,
                    "User-Agent": "ThreatLens/1.0",
                },
            )

        if r.status_code == 200:
            return {"status": "connected", "message": "API responding"}
        return {"status": "error", "message": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)[:100]}


async def check_virustotal():
    key = getattr(settings, "VIRUSTOTAL_API_KEY", None)
    if not key:
        return {"status": "not_configured", "message": "API key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://www.virustotal.com/api/v3/files/44d88612fea8a8f36de82e1278abb02f",
                headers={"x-apikey": key},
            )

        if r.status_code == 200:
            return {"status": "connected", "message": "API responding"}
        return {"status": "error", "message": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)[:100]}


@router.get("")
async def threat_sources():
    abuseipdb = await check_abuseipdb()
    urlhaus = await check_urlhaus()
    threatfox = await check_threatfox()
    virustotal = await check_virustotal()

    return {
        "sources": [
            {
                "name": "AbuseIPDB",
                "type": "IP Reputation",
                "description": "IP reputation and abuse reporting",
                **abuseipdb,
            },
            {
                "name": "VirusTotal",
                "type": "Multi-Engine Intelligence",
                "description": "File, URL and IP threat intelligence",
                **virustotal,
            },
            {
                "name": "URLhaus",
                "type": "Malicious URLs",
                "description": "Malware distribution URL intelligence",
                **urlhaus,
            },
            {
                "name": "ThreatFox",
                "type": "IOC Intelligence",
                "description": "Malware-associated IOC intelligence",
                **threatfox,
            },
            {
                "name": "AlienVault OTX",
                "type": "Threat Intelligence",
                "description": "Community threat intelligence",
                "status": "not_configured",
                "message": "Integration pending",
            },
            {
                "name": "MalwareBazaar",
                "type": "Malware Samples",
                "description": "Malware sample intelligence",
                "status": "not_configured",
                "message": "Integration pending",
            },
        ]
    }
