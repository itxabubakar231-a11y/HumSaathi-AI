import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

def generate_cuid() -> str:
    return "c" + uuid.uuid4().hex[:24]

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, nullable=False)
    role = Column(String, default="learner", nullable=False)
    persona = Column(String, nullable=True)
    language = Column(String, default="en", nullable=False)
    sensoryPrefs = Column(String, default="{}", nullable=False)
    parentPin = Column(String, default="1234", nullable=False)
    setupComplete = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("Badge", back_populates="user", cascade="all, delete-orphan")
    aiRecommendations = relationship("AiRecommendation", back_populates="user", cascade="all, delete-orphan")
    conversationSessions = relationship("ConversationSession", back_populates="user", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "Assessment"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    persona = Column(String, nullable=False)
    language = Column(String, nullable=False)
    questions = Column(String, nullable=False)
    responses = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    estimatedLevel = Column(String, nullable=False)
    areaLevels = Column(String, nullable=False)
    aiSummary = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="assessments")

    __table_args__ = (
        Index("ix_assessment_userId", "userId"),
    )

class Attempt(Base):
    __tablename__ = "Attempt"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    activityId = Column(String, ForeignKey("Activity.id", ondelete="CASCADE"), nullable=False)
    answers = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    correctCount = Column(Integer, nullable=False)
    totalCount = Column(Integer, nullable=False)
    starsAwarded = Column(Integer, default=0, nullable=False)
    attemptsUsed = Column(Integer, default=1, nullable=False)
    timeMs = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    difficultyAtAttempt = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    completedAt = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="attempts")
    activity = relationship("Activity", back_populates="attempts")

    __table_args__ = (
        Index("ix_attempt_userId_activityId", "userId", "activityId"),
        Index("ix_attempt_userId_createdAt", "userId", "createdAt"),
    )

class Progress(Base):
    __tablename__ = "Progress"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    skill = Column(String, nullable=False)
    level = Column(String, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="progress")

    __table_args__ = (
        UniqueConstraint("userId", "skill", name="uq_progress_userId_skill"),
        Index("ix_progress_userId", "userId"),
    )

class Badge(Base):
    __tablename__ = "Badge"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    code = Column(String, nullable=False)
    unlockedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="badges")

    __table_args__ = (
        UniqueConstraint("userId", "code", name="uq_badge_userId_code"),
        Index("ix_badge_userId", "userId"),
    )

class AiRecommendation(Base):
    __tablename__ = "AiRecommendation"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String, nullable=False)
    input = Column(String, nullable=False)
    output = Column(String, nullable=False)
    source = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="aiRecommendations")

    __table_args__ = (
        Index("ix_airec_userId", "userId"),
    )
