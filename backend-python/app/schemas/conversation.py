from typing import Optional
from pydantic import BaseModel

class StartConversationRequest(BaseModel):
    userId: str
    scenarioId: str
    mode: Optional[str] = "text"

class SendMessageRequest(BaseModel):
    userId: str
    message: str

class EvaluateConversationRequest(BaseModel):
    sessionId: str
    userId: str
