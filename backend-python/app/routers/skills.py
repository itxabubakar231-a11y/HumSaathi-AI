from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.skill_module_service import (
    get_skill_modules,
    get_skill_module_details,
    evaluate_skill_solution,
)

router = APIRouter(prefix="/skills", tags=["Skills"])

class EvaluateSkillRequest(BaseModel):
    userId: str
    moduleId: str
    scenarioId: str
    optionId: Optional[str] = None
    customSolution: Optional[str] = None

@router.get("/modules/{persona}")
def list_skill_modules(persona: str, language: Optional[str] = Query("en")):
    modules = get_skill_modules(persona, language or "en")
    return {"modules": modules}

@router.get("/module/{module_id}")
def get_skill_module(module_id: str, language: Optional[str] = Query("en")):
    details = get_skill_module_details(module_id, language or "en")
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )
    return {"module": details}

@router.post("/evaluate")
async def evaluate_solution(
    body: EvaluateSkillRequest,
    db: Session = Depends(get_db),
):
    try:
        result = await evaluate_skill_solution(
            db=db,
            user_id=body.userId,
            module_id=body.moduleId,
            scenario_id=body.scenarioId,
            option_id=body.optionId,
            custom_solution=body.customSolution,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
