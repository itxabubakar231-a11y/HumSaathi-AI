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

router = APIRouter(prefix="/skills", tags=["Skills"])  # v1.0.6-deploy-sync

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
def get_skill_module(
    module_id: str,
    language: Optional[str] = Query("en"),
    difficulty: Optional[str] = Query(None),
):
    details = get_skill_module_details(module_id, language or "en", difficulty)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )
    return {"module": details}

from app.models.user import User
from app.dependencies.auth import get_optional_current_user

@router.post("/evaluate")
async def evaluate_solution(
    body: EvaluateSkillRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    target_user_id = current_user.id if current_user else body.userId
    try:
        result = await evaluate_skill_solution(
            db=db,
            user_id=target_user_id,
            module_id=body.moduleId,
            scenario_id=body.scenarioId,
            option_id=body.optionId,
            custom_solution=body.customSolution,
        )
        return result
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evaluation failed: {tb}",
        )
