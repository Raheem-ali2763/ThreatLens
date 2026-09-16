from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ioc import IOC


def find_existing_ioc(
    db: Session,
    ioc_type: str,
    value: str,
) -> IOC | None:
    return db.scalar(
        select(IOC).where(
            IOC.ioc_type == ioc_type,
            IOC.value == value,
        )
    )


def create_or_update_ioc(
    db: Session,
    ioc_type: str,
    value: str,
    source: str,
    confidence: int = 0,
    tags: str | None = None,
    raw_data: str | None = None,
) -> tuple[IOC, bool]:

    existing = find_existing_ioc(
        db,
        ioc_type,
        value,
    )

    if existing:
        existing.last_seen = __import__("datetime").datetime.utcnow()

        if confidence > existing.confidence:
            existing.confidence = confidence

        if tags:
            existing.tags = tags

        if raw_data:
            existing.raw_data = raw_data

        db.commit()
        db.refresh(existing)

        return existing, False

    ioc = IOC(
        ioc_type=ioc_type,
        value=value,
        source=source,
        confidence=confidence,
        tags=tags,
        raw_data=raw_data,
    )

    db.add(ioc)
    db.commit()
    db.refresh(ioc)

    return ioc, True
