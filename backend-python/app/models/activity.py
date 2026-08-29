import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.user import generate_cuid

class Activity(Base):
    __tablename__ = "Activity"

    id = Column(String, primary_key=True, default=generate_cuid)
    type = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    language = Column(String, nullable=False)
    personas = Column(String, nullable=False)
    content = Column(String, nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    attempts = relationship("Attempt", back_populates="activity", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_activity_type_diff_lang", "type", "difficulty", "language"),
    )
