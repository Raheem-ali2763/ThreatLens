from pydantic import BaseModel, Field


class RiskScoreRequest(BaseModel):
    malicious: int = Field(default=0, ge=0)
    suspicious: int = Field(default=0, ge=0)
    source_count: int = Field(default=1, ge=1)
    confidence: int = Field(default=0, ge=0, le=100)
    is_kev: bool = False
    recent: bool = False


class RiskScoreResponse(BaseModel):
    score: int
    severity: str
