from pydantic import BaseModel, Field

class ParentPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=8)
