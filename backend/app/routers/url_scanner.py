from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.scanner.url_scanner import scan_url


router = APIRouter(
    prefix="/api/scanner",
    tags=["URL Scanner"]
)


class URLScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)


@router.post("/url")
async def scan_url_endpoint(payload: URLScanRequest):

    try:
        result = await scan_url(payload.url)

        return {
            "success": True,
            "scanner": "ThreatLens URL Scanner",
            "result": result
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
