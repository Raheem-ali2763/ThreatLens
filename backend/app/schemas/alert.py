from datetime import datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    ioc_id: int | None
    event_id: int | None
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True
