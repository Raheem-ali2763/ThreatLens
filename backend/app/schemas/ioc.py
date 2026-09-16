from datetime import datetime

from pydantic import BaseModel, Field


class IOCCreate(BaseModel):
    ioc_type: str = Field(..., min_length=2, max_length=50)
    value: str = Field(..., min_length=1, max_length=500)
    source: str = Field(default="manual", max_length=100)
    confidence: int = Field(default=0, ge=0, le=100)
    tags: str | None = None
    raw_data: str | None = None


class IOCResponse(BaseModel):
    id: int
    ioc_type: str
    value: str
    source: str
    first_seen: datetime
    last_seen: datetime
    confidence: int
    tags: str | None
    raw_data: str | None
    is_active: bool

    model_config = {
        "from_attributes": True
    }
