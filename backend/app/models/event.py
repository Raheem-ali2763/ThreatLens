from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class InternalEvent(Base):
    __tablename__ = "internal_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    source_ip = Column(String(100), nullable=True)
    destination_ip = Column(String(100), nullable=True)
    destination_domain = Column(String(255), nullable=True)
    hostname = Column(String(255), nullable=True)
    username = Column(String(255), nullable=True)
    severity = Column(String(20), default="low")
    raw_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
