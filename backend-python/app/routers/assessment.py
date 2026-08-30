from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User, Assessment
from app.schemas.common import parse_json, stringify_json
from app.schemas.assessment import AssessmentSubmitRequest
from app.services.assessment_service import get_assessment_questions
from app.services.scoring_service import score_assessment, level_from_score
from app.services.progress_service import (
    build_area_levels_from_questions,
    upsert_progress_from_assessment,
)
from app.services.ai.assessment_interpreter import interpret_assessment
from app.dependencies.auth import get_optional_current_user

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.get("/{user_id}/questions")
def get_user_assessment_questions(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot access another user's assessment questions.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.persona:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete setup first",
        )

    questions = get_assessment_questions(user.persona, user.language)
    return {
        "questions": [
            {
                "id": q["id"],
                "area": q["area"],
                "skill": q["skill"],
                "prompt": q["prompt"],
                "options": q["options"],
            }
            for q in questions
        ],
        "persona": user.persona,
        "language": user.language,
    }

@router.post("/{user_id}/submit")
async def submit_assessment(
    user_id: str,
    payload: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot submit assessments for another user.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.persona:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete setup first",
        )

    questions = get_assessment_questions(user.persona, user.language)
    raw_responses = [r.model_dump() for r in payload.responses]
    score_res = score_assessment(questions, raw_responses)
    score = score_res["score"]
    graded = score_res["graded"]
    correct = score_res["correct"]
    total = score_res["total"]

    area_levels = build_area_levels_from_questions(questions, graded, score)
    est_level = level_from_score(score)

    interpretation = await interpret_assessment(
        persona=user.persona,
        language=user.language,
        score=score,
        area_levels=area_levels,
        responses=graded,
    )

    final_level = interpretation.get("recommendedDifficulty") or est_level

    assessment = Assessment(
        userId=user.id,
        persona=user.persona,
        language=user.language,
        questions=stringify_json(questions),
        responses=stringify_json(graded),
        score=score,
        estimatedLevel=final_level,
        areaLevels=stringify_json(area_levels),
        aiSummary=stringify_json({
            "summary": interpretation.get("summary"),
            "areas": interpretation.get("areas"),
            "source": interpretation.get("source"),
        }),
        createdAt=datetime.utcnow(),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    upsert_progress_from_assessment(db, user.id, area_levels)

    return {
        "assessment": {
            "id": assessment.id,
            "score": score,
            "correct": correct,
            "total": total,
            "estimatedLevel": assessment.estimatedLevel,
            "areaLevels": area_levels,
            "summary": interpretation.get("summary"),
            "areas": interpretation.get("areas"),
            "source": interpretation.get("source"),
        }
    }

@router.get("/{user_id}/latest")
def get_latest_assessment(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's assessment.",
        )
    assessment = (
        db.query(Assessment)
        .filter(Assessment.userId == user_id)
        .order_by(desc(Assessment.createdAt))
        .first()
    )

    if not assessment:
        return {"assessment": None}

    ai_summary_data = parse_json(assessment.aiSummary, {})

    return {
        "assessment": {
            "id": assessment.id,
            "score": assessment.score,
            "estimatedLevel": assessment.estimatedLevel,
            "areaLevels": parse_json(assessment.areaLevels, {}),
            "summary": ai_summary_data.get("summary") if isinstance(ai_summary_data, dict) else None,
            "createdAt": assessment.createdAt.isoformat() if assessment.createdAt else None,
        }
    }
