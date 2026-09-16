from datetime import datetime

from pydantic import BaseModel


class IncidentResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    alert_id: int | None
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True
