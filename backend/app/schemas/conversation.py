from typing import Optional
from pydantic import BaseModel

class StartConversationRequest(BaseModel):
    userId: Optional[str] = None
    scenarioId: str
    mode: Optional[str] = "text"
    language: Optional[str] = None

class SendMessageRequest(BaseModel):
    userId: Optional[str] = None
    message: str
    language: Optional[str] = None

class EvaluateConversationRequest(BaseModel):
    sessionId: str
    userId: Optional[str] = None
