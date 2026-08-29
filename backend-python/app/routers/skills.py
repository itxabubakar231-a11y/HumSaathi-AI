from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.services.skill_module_service import get_skill_modules, get_skill_module_details

router = APIRouter(prefix="/skills", tags=["Skills"])

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
