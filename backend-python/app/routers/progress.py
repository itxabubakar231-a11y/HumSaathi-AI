from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.progress_service import get_dashboard_stats

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/{user_id}")
def get_user_progress_summary(user_id: str, db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db, user_id)
    if not stats.get("user"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    progress_list = stats.get("progress", [])
    attempts_list = stats.get("attempts", [])
    weakest = stats.get("weakest")

    return {
        "skills": [p.skill for p in progress_list],
        "levels": {p.skill: p.level for p in progress_list},
        "accuracy": {p.skill: p.accuracy for p in progress_list},
        "attempts": {p.skill: p.attempts for p in progress_list},
        "recentActivity": [
            {
                "id": a.id,
                "score": round(a.score * 100),
                "title": a.activity.title if a.activity else "",
                "topic": a.activity.topic if a.activity else "",
                "difficulty": a.difficultyAtAttempt,
                "completedAt": a.completedAt.isoformat() if a.completedAt else (a.createdAt.isoformat() if a.createdAt else None),
            }
            for a in attempts_list
        ],
        "needsPractice": (
            {"skill": weakest.skill, "accuracy": weakest.accuracy}
            if weakest
            else None
        ),
    }
