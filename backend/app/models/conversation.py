import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.user import generate_cuid

class CommunicationScenario(Base):
    __tablename__ = "CommunicationScenario"

    id = Column(String, primary_key=True, default=generate_cuid)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    aiRole = Column(String, nullable=False)
    personas = Column(String, nullable=False)  # JSON array
    languages = Column(String, nullable=False)  # JSON array
    difficulty = Column(String, nullable=False)
    objectives = Column(String, nullable=False)  # JSON array
    context = Column(String, nullable=False)
    initialPrompt = Column(String, nullable=False)  # JSON object
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sessions = relationship("ConversationSession", back_populates="scenario", cascade="all, delete-orphan")

class ConversationSession(Base):
    __tablename__ = "ConversationSession"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    scenarioId = Column(String, ForeignKey("CommunicationScenario.id", ondelete="CASCADE"), nullable=False)
    mode = Column(String, default="text", nullable=False)  # "text" or "voice"
    language = Column(String, default="en", nullable=False)
    transcript = Column(String, default="[]", nullable=False)  # JSON array
    turnCount = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    completedAt = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="conversationSessions")
    scenario = relationship("CommunicationScenario", back_populates="sessions")
    evaluation = relationship("ConversationEvaluation", back_populates="session", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_conv_session_userId", "userId"),
        Index("ix_conv_session_scenarioId", "scenarioId"),
    )

class ConversationEvaluation(Base):
    __tablename__ = "ConversationEvaluation"

    id = Column(String, primary_key=True, default=generate_cuid)
    sessionId = Column(String, ForeignKey("ConversationSession.id", ondelete="CASCADE"), unique=True, nullable=False)
    clarity = Column(Integer, nullable=False)
    relevance = Column(Integer, nullable=False)
    appropriateness = Column(Integer, nullable=False)
    communication = Column(Integer, nullable=False)
    conversationFlow = Column(Integer, nullable=False)
    overallScore = Column(Integer, nullable=False)
    strengths = Column(String, default="[]", nullable=False)  # JSON array
    improvements = Column(String, default="[]", nullable=False)  # JSON array
    betterResponse = Column(String, default="", nullable=False)
    feedback = Column(String, default="", nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("ConversationSession", back_populates="evaluation")
