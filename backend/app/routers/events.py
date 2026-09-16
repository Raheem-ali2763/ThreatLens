from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import InternalEvent
from app.schemas.event import EventCreate, EventResponse
from app.correlation.service import correlate_event


router = APIRouter(
    prefix="/api/events",
    tags=["Internal Events"]
)


@router.post("/", response_model=EventResponse)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
):
    event = InternalEvent(**event_data.model_dump())

    db.add(event)
    db.flush()

    correlate_event(db, event)

    db.commit()
    db.refresh(event)

    return event


@router.get("/", response_model=list[EventResponse])
def list_events(
    db: Session = Depends(get_db),
):
    return (
        db.query(InternalEvent)
        .order_by(InternalEvent.created_at.desc())
        .limit(100)
        .all()
    )
