from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class IOC(Base):
    __tablename__ = "iocs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    ioc_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(500), nullable=False, index=True)

    source: Mapped[str] = mapped_column(String(100), nullable=False)

    first_seen: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    last_seen: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    confidence: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    tags: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    raw_data: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "value",
            "ioc_type",
            name="uq_ioc_value_type"
        ),
    )

