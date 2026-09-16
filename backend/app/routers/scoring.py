from fastapi import APIRouter

from app.scoring.engine import risk_engine
from app.scoring.schemas import RiskScoreRequest, RiskScoreResponse


router = APIRouter(
    prefix="/api/scoring",
    tags=["Risk Scoring"]
)


@router.post("/", response_model=RiskScoreResponse)
def calculate_risk(request: RiskScoreRequest):
    return risk_engine.calculate(
        malicious=request.malicious,
        suspicious=request.suspicious,
        source_count=request.source_count,
        confidence=request.confidence,
        is_kev=request.is_kev,
        recent=request.recent,
    )
