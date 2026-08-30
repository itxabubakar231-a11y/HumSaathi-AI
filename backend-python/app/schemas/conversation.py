from typing import Optional
from pydantic import BaseModel

class StartConversationRequest(BaseModel):
    userId: Optional[str] = None
    scenarioId: str
    mode: Optional[str] = "text"

class SendMessageRequest(BaseModel):
    userId: Optional[str] = None
    message: str

class EvaluateConversationRequest(BaseModel):
    sessionId: str
    userId: Optional[str] = None
