from typing import List, Union, Optional
from pydantic import BaseModel

class AssessmentResponseItem(BaseModel):
    questionId: str
    answer: Union[str, int, float]
    timeMs: Optional[int] = None

class AssessmentSubmitRequest(BaseModel):
    responses: List[AssessmentResponseItem]
