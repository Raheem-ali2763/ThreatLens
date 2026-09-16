import re
import httpx
from urllib.parse import urlparse

from app.core_config import settings


URLHAUS_API = "https://urlhaus-api.abuse.ch/v1/url/"


def normalize_url(raw_url: str) -> str:

    url = raw_url.strip()

    if not url:
        raise ValueError("URL is required")

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "http://" + url

    parsed = urlparse(url)

    if not parsed.netloc:
        raise ValueError("Invalid URL")

    return url


async def scan_url(raw_url: str):

    url = normalize_url(raw_url)

    auth_key = getattr(
        settings,
        "URLHAUS_AUTH_KEY",
        None
    )

    if not auth_key:
        raise RuntimeError(
            "URLhaus Auth-Key is not configured."
        )

    headers = {
        "Auth-Key": auth_key,
        "User-Agent": "ThreatLens/1.0"
    }

    async with httpx.AsyncClient(
        timeout=20,
        follow_redirects=False
    ) as client:

        response = await client.post(
            URLHAUS_API,
            data={"url": url},
            headers=headers
        )

    try:
        data = response.json()
    except Exception:
        raise RuntimeError(
            f"URLhaus returned invalid JSON. HTTP {response.status_code}"
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"URLhaus API returned HTTP {response.status_code}"
        )

    status = data.get("query_status")

    if status == "ok":
        score = 95
        severity = "Critical"
        malicious = True

        message = "URL is listed by URLhaus."

    elif status == "no_results":
        score = 5
        severity = "Unknown"
        malicious = False

        message = (
            "No URLhaus record found. "
            "This does not guarantee that the URL is safe."
        )

    else:
        score = 0
        severity = "Unknown"
        malicious = False

        message = (
            f"URLhaus returned query status: {status}"
        )

    return {
        "url": url,
        "source": "URLhaus",
        "query_status": status,
        "risk_score": score,
        "severity": severity,
        "url_status": data.get("url_status"),
        "threat": data.get("threat"),
        "tags": data.get("tags") or [],
        "host": data.get("host"),
        "date_added": data.get("date_added"),
        "reference": data.get("urlhaus_reference"),
        "blacklists": data.get("blacklists") or {},
        "malicious": malicious,
        "message": message
    }
