from datetime import datetime

from pydantic import BaseModel


class EventCreate(BaseModel):
    event_type: str
    source_ip: str | None = None
    destination_ip: str | None = None
    destination_domain: str | None = None
    hostname: str | None = None
    username: str | None = None
    raw_data: str | None = None


class EventResponse(BaseModel):
    id: int
    event_type: str
    source_ip: str | None
    destination_ip: str | None
    destination_domain: str | None
    hostname: str | None
    username: str | None
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True
