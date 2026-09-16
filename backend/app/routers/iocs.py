from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ioc import IOC
from app.services.deduplication import create_or_update_ioc
from app.schemas.ioc import IOCCreate, IOCResponse

router = APIRouter(
    prefix="/api/iocs",
    tags=["IOCs"]
)


@router.post("/", response_model=IOCResponse)
def create_ioc(
    ioc_data: IOCCreate,
    db: Session = Depends(get_db)
):
    ioc, created = create_or_update_ioc(
        db=db,
        ioc_type=ioc_data.ioc_type.strip().lower(),
        value=ioc_data.value.strip(),
        source=ioc_data.source,
        confidence=ioc_data.confidence,
        tags=ioc_data.tags,
        raw_data=ioc_data.raw_data,
    )

    return ioc


@router.get("/", response_model=list[IOCResponse])
def list_iocs(
    ioc_type: str | None = Query(default=None),
    active: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = select(IOC)

    if ioc_type:
        query = query.where(IOC.ioc_type == ioc_type)

    if active is not None:
        query = query.where(IOC.is_active == active)

    if search:
        query = query.where(IOC.value.ilike(f"%{search}%"))

    query = query.offset(skip).limit(limit)

    return list(db.scalars(query).all())


@router.get("/{ioc_id}", response_model=IOCResponse)
def get_ioc(
    ioc_id: int,
    db: Session = Depends(get_db)
):
    ioc = db.get(IOC, ioc_id)

    if not ioc:
        raise HTTPException(
            status_code=404,
            detail="IOC not found"
        )

    return ioc


@router.patch("/{ioc_id}", response_model=IOCResponse)
def update_ioc(
    ioc_id: int,
    ioc_data: IOCCreate,
    db: Session = Depends(get_db)
):
    ioc = db.get(IOC, ioc_id)

    if not ioc:
        raise HTTPException(
            status_code=404,
            detail="IOC not found"
        )

    ioc.ioc_type = ioc_data.ioc_type
    ioc.value = ioc_data.value
    ioc.source = ioc_data.source
    ioc.confidence = ioc_data.confidence
    ioc.tags = ioc_data.tags
    ioc.raw_data = ioc_data.raw_data
    ioc.last_seen = datetime.utcnow()

    db.commit()
    db.refresh(ioc)

    return ioc


@router.delete("/{ioc_id}")
def delete_ioc(
    ioc_id: int,
    db: Session = Depends(get_db)
):
    ioc = db.get(IOC, ioc_id)

    if not ioc:
        raise HTTPException(
            status_code=404,
            detail="IOC not found"
        )

    db.delete(ioc)
    db.commit()

    return {
        "message": "IOC deleted successfully",
        "id": ioc_id
    }
