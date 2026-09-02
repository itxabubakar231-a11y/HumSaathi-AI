from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ParentPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=8)

class ParentChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: Optional[List[Dict[str, Any]]] = []

class ParentPinUpdateRequest(BaseModel):
    oldPin: str = Field(..., min_length=4, max_length=8)
    newPin: str = Field(..., min_length=4, max_length=8)
