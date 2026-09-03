from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import ParentPinRequest, ParentChatRequest, ParentPinUpdateRequest
from app.schemas.common import parse_json, stringify_json
from app.services.progress_service import get_dashboard_stats, get_user_progress
from app.services.reward_service import get_user_rewards
from app.services.ai.activity_recommender import recommend_activity
from app.services.parent_service import (
    get_parent_companion_data,
    handle_parent_ai_chat,
    update_parent_pin as service_update_parent_pin,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

from app.routers.activities import ACTIVITY_TOPIC_DEFS

def get_attempt_title(a) -> str:
    try:
        ans = parse_json(a.answers, [])
        if ans and isinstance(ans, list) and len(ans) > 0 and isinstance(ans[0], dict):
            mod_id = ans[0].get('moduleId')
            if mod_id and mod_id in ACTIVITY_TOPIC_DEFS:
                return ACTIVITY_TOPIC_DEFS[mod_id]['title']
    except Exception:
        pass
    if a.activity and a.activity.title:
        return a.activity.title
    if a.activityId and a.activityId in ACTIVITY_TOPIC_DEFS:
        return ACTIVITY_TOPIC_DEFS[a.activityId]['title']
    return a.activityId.capitalize() if a.activityId else "Learning Activity"

def get_attempt_topic(a) -> str:
    try:
        ans = parse_json(a.answers, [])
        if ans and isinstance(ans, list) and len(ans) > 0 and isinstance(ans[0], dict):
            mod_id = ans[0].get('moduleId')
            if mod_id and mod_id in ACTIVITY_TOPIC_DEFS:
                return ACTIVITY_TOPIC_DEFS[mod_id]['topic']
    except Exception:
        pass
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
    strengths_list = stats.get("strengths", [])
    needs_practice_list = stats.get("needsPracticeList", [])

    return {
        "name": user.name,
        "persona": user.persona,
        "language": user.language,
        "currentLevel": stats.get("currentLevel", "beginner"),
        "completedCount": stats.get("completedCount", 0),
        "todayCompletedCount": stats.get("todayCompletedCount", 0),
        "currentStreak": stats.get("currentStreak", 0),
        "weeklyActivityDays": stats.get("weeklyActivityDays", []),
        "avgAccuracy": round(stats.get("avgAccuracy", 0) * 100),
        "strengths": [
            {
                "skill": p.skill,
                "accuracy": round(p.accuracy * 100),
                "attempts": p.attempts,
                "level": p.level,
            }
            for p in strengths_list
        ],
        "strongest": (
            {"skill": strongest.skill, "accuracy": round(strongest.accuracy * 100)}
            if strongest and getattr(strongest, "attempts", 0) > 0
            else None
        ),
        "needsPractice": (
            {"skill": weakest.skill, "accuracy": round(weakest.accuracy * 100)}
            if weakest and getattr(weakest, "attempts", 0) > 0
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
    strengths_list = stats.get("strengths", [])
    needs_practice_list = stats.get("needsPracticeList", [])

    return {
        "learner": {
            "name": user.name,
            "persona": user.persona,
            "language": user.language,
        },
        "currentLevel": stats.get("currentLevel", "beginner"),
        "completedCount": stats.get("completedCount", 0),
        "avgAccuracy": round(stats.get("avgAccuracy", 0) * 100),
        "strengths": [
            ACTIVITY_TOPIC_DEFS.get(p.skill, {}).get("title", p.skill.replace("_", " ").title())
            for p in strengths_list
        ] or ([ACTIVITY_TOPIC_DEFS.get(strongest.skill, {}).get("title", strongest.skill.title())] if strongest and getattr(strongest, "attempts", 0) > 0 else []),
        "needsPractice": [
            ACTIVITY_TOPIC_DEFS.get(p.skill, {}).get("title", p.skill.replace("_", " ").title())
            for p in needs_practice_list
        ] or ([ACTIVITY_TOPIC_DEFS.get(weakest.skill, {}).get("title", weakest.skill.title())] if weakest and getattr(weakest, "attempts", 0) > 0 else []),
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

from app.dependencies.auth import get_optional_current_user

@router.get("/{user_id}")
def get_user_dashboard(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot access another user's dashboard.",
        )
    stats = get_dashboard_stats(db, user_id)
    if not stats.get("user"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    rewards = get_user_rewards(db, user_id)
    return {"dashboard": format_dashboard(stats, rewards)}

@router.get("/{user_id}/progress")
def get_dashboard_progress(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot access another user's progress.",
        )
    progress_list = get_user_progress(db, user_id)
    rewards = get_user_rewards(db, user_id)
    return {"progress": progress_list, "rewards": rewards}

@router.post("/{user_id}/recommend")
async def get_activity_recommendation(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot generate recommendations for another user.",
        )
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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's parent dashboard.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.parentPin != payload.pin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid PIN")

    stats = get_dashboard_stats(db, user.id)
    companion_data = get_parent_companion_data(db, user.id, user.persona)
    return {
        "parentView": format_parent_view(stats),
        "parentCompanion": companion_data,
    }

@router.post("/{user_id}/parent/chat")
async def parent_ai_chat(
    user_id: str,
    payload: ParentChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot chat on another user's parent assistant.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    res = await handle_parent_ai_chat(db, user_id, payload.message, payload.history or [])
    return res

@router.post("/{user_id}/parent/pin")
def update_pin(
    user_id: str,
    payload: ParentPinUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot modify another user's PIN.",
        )
    try:
        res = service_update_parent_pin(db, user_id, payload.oldPin, payload.newPin)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{user_id}/parent/weekly-report")
def get_weekly_report(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's weekly report.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    companion_data = get_parent_companion_data(db, user_id, user.persona)
    return {"weeklyReport": companion_data.get("weeklyReport", {})}

@router.get("/{user_id}/parent/communication")
def get_communication_journey(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's communication journey.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    companion_data = get_parent_companion_data(db, user_id, user.persona)
    return {"communicationJourney": companion_data.get("communicationJourney", [])}

