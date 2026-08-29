from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import ParentPinRequest
from app.services.progress_service import get_dashboard_stats, get_user_progress
from app.services.reward_service import get_user_rewards
from app.services.ai.activity_recommender import recommend_activity

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

from app.routers.activities import ACTIVITY_TOPIC_DEFS

def get_attempt_title(a) -> str:
    if a.activity and a.activity.title:
        return a.activity.title
    if a.activityId and a.activityId in ACTIVITY_TOPIC_DEFS:
        return ACTIVITY_TOPIC_DEFS[a.activityId]['title']
    return a.activityId.capitalize() if a.activityId else "Learning Activity"

def get_attempt_topic(a) -> str:
    if a.activity and a.activity.topic:
        return a.activity.topic
    if a.activityId and a.activityId in ACTIVITY_TOPIC_DEFS:
        return ACTIVITY_TOPIC_DEFS[a.activityId]['topic']
    return a.activityId or "letters"

def format_dashboard(stats: Dict[str, Any], rewards: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    user = stats["user"]
    progress_list = stats.get("progress", [])
    attempts_list = stats.get("attempts", [])
    latest_assessment = stats.get("latestAssessment")
    strongest = stats.get("strongest")
    weakest = stats.get("weakest")

    return {
        "name": user.name,
        "persona": user.persona,
        "language": user.language,
        "currentLevel": stats.get("currentLevel", "beginner"),
        "completedCount": stats.get("completedCount", 0),
        "avgAccuracy": round(stats.get("avgAccuracy", 0) * 100),
        "strongest": (
            {"skill": strongest.skill, "accuracy": round(strongest.accuracy * 100)}
            if strongest
            else None
        ),
        "needsPractice": (
            {"skill": weakest.skill, "accuracy": round(weakest.accuracy * 100)}
            if weakest
            else None
        ),
        "rewards": rewards or {"totalStars": 0, "earnedCount": 0, "badges": []},
        "progress": [
            {
                "skill": p.skill,
                "level": p.level,
                "accuracy": round(p.accuracy * 100),
                "attempts": p.attempts,
            }
            for p in progress_list
        ],
        "recentAttempts": [
            {
                "id": a.id,
                "score": round(a.score * 100),
                "starsAwarded": a.starsAwarded,
                "title": get_attempt_title(a),
                "topic": get_attempt_topic(a),
                "difficulty": a.difficultyAtAttempt or "easy",
                "completedAt": a.completedAt.isoformat() if a.completedAt else (a.createdAt.isoformat() if a.createdAt else None),
            }
            for a in attempts_list
        ],
        "assessmentSummary": (
            {
                "score": round(latest_assessment.score * 100),
                "level": latest_assessment.estimatedLevel,
            }
            if latest_assessment
            else None
        ),
    }

def format_parent_view(stats: Dict[str, Any]) -> Dict[str, Any]:
    user = stats["user"]
    progress_list = stats.get("progress", [])
    attempts_list = stats.get("attempts", [])
    strongest = stats.get("strongest")
    weakest = stats.get("weakest")

    return {
        "learner": {
            "name": user.name,
            "persona": user.persona,
            "language": user.language,
        },
        "currentLevel": stats.get("currentLevel", "beginner"),
        "completedCount": stats.get("completedCount", 0),
        "avgAccuracy": round(stats.get("avgAccuracy", 0) * 100),
        "strengths": [strongest.skill] if strongest else [],
        "needsPractice": [weakest.skill] if weakest else [],
        "progress": [
            {
                "skill": p.skill,
                "level": p.level,
                "accuracy": round(p.accuracy * 100),
            }
            for p in progress_list
        ],
        "recentAttempts": [
            {
                "title": get_attempt_title(a),
                "topic": get_attempt_topic(a),
                "score": round(a.score * 100),
                "completedAt": a.completedAt.isoformat() if a.completedAt else (a.createdAt.isoformat() if a.createdAt else None),
            }
            for a in attempts_list
        ],
    }

@router.get("/{user_id}")
def get_user_dashboard(user_id: str, db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db, user_id)
    if not stats.get("user"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    rewards = get_user_rewards(db, user_id)
    return {"dashboard": format_dashboard(stats, rewards)}

@router.get("/{user_id}/progress")
def get_dashboard_progress(user_id: str, db: Session = Depends(get_db)):
    progress_list = get_user_progress(db, user_id)
    rewards = get_user_rewards(db, user_id)
    return {"progress": progress_list, "rewards": rewards}

@router.post("/{user_id}/recommend")
async def get_activity_recommendation(user_id: str, db: Session = Depends(get_db)):
    try:
        rec = await recommend_activity(db, user_id)
        return {"recommendation": rec}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{user_id}/parent")
def get_parent_view(
    user_id: str,
    payload: ParentPinRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.parentPin != payload.pin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid PIN")

    stats = get_dashboard_stats(db, user.id)
    return {"parentView": format_parent_view(stats)}
