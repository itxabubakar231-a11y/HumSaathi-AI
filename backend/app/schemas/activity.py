from typing import List, Union, Optional
from pydantic import BaseModel

class AnswerItem(BaseModel):
    questionId: str
    answer: Union[str, int, float]
    correct: Optional[bool] = None
    attemptsUsed: Optional[int] = 1

class AttemptSubmitRequest(BaseModel):
    activityId: Optional[str] = None
    answers: List[AnswerItem]
    timeMs: Optional[int] = None
