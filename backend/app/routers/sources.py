from fastapi import APIRouter, HTTPException

from app.services.threat_intel import threat_intel_service

router = APIRouter(
    prefix="/api/sources",
    tags=["Threat Intelligence Sources"],
)


@router.get("/")
def list_sources():
    return {
        "providers": threat_intel_service.available_providers()
    }


@router.get("/abuseipdb/check/{ip}")
async def check_abuseipdb(ip: str):
    try:
        return await threat_intel_service.check_indicator(
            provider_name="abuseipdb",
            indicator=ip,
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Threat provider request failed: {exc}",
        )
