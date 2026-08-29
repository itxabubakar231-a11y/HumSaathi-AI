from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.database import get_db
from app.models.user import User, Attempt
from app.models.activity import Activity
from app.schemas.common import parse_json, stringify_json
from app.schemas.activity import AttemptSubmitRequest
from app.activities.registry import get_activity_content
from app.routers.activities import ACTIVITY_TOPIC_DEFS
from app.services.scoring_service import score_activity
from app.services.reward_service import calculate_stars, evaluate_badges
from app.services.progress_service import update_progress_from_attempt
from app.services.ai.feedback_generator import generate_feedback

router = APIRouter(prefix="/attempts", tags=["Attempts"])

@router.post("/{user_id}/submit")
async def submit_attempt(
    user_id: str,
    payload: AttemptSubmitRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    activity_id = payload.activityId or "letters"
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        activity = (
            db.query(Activity)
            .filter(
                or_(Activity.topic == activity_id, Activity.type == activity_id),
                Activity.isActive == True,
            )
            .first()
        )

    # Fallback to dynamically creating/locating activity if not in DB
    if not activity:
        act_def = ACTIVITY_TOPIC_DEFS.get(activity_id, {'type': activity_id, 'topic': activity_id, 'title': f"{activity_id.capitalize()} Learning"})
        content_dict = get_activity_content(act_def['type'], "easy", user.language or "en")
        activity = Activity(
            id=activity_id,
            type=act_def['type'],
            topic=act_def['topic'],
            title=act_def['title'],
            difficulty="easy",
            language=user.language or "en",
            personas=stringify_json(["child", "teen", "adult"]),
            content=stringify_json(content_dict),
            isActive=True,
        )
        try:
            db.add(activity)
            db.commit()
            db.refresh(activity)
        except Exception:
            db.rollback()
            activity = db.query(Activity).filter(Activity.id == activity_id).first()

    stored_content = parse_json(activity.content, {}) if activity else {}
    if not stored_content or not stored_content.get("questions"):
        act_type = activity.type if activity else activity_id
        act_diff = activity.difficulty if activity else "easy"
        act_lang = activity.language if activity else (user.language or "en")
        stored_content = get_activity_content(act_type, act_diff, act_lang)

    answers_list = [a.model_dump() for a in payload.answers]
    result = score_activity(stored_content, answers_list)
    total_attempts_used = sum(a.get("attemptsUsed", 1) for a in answers_list)
    stars_awarded = calculate_stars(result["score"], True)

    attempt = Attempt(
        userId=user.id,
        activityId=activity.id if activity else activity_id,
        answers=stringify_json(result["graded"]),
        score=result["score"],
        correctCount=result["correctCount"],
        totalCount=result["totalCount"],
        starsAwarded=stars_awarded,
        attemptsUsed=total_attempts_used,
        timeMs=payload.timeMs,
        completed=True,
        difficultyAtAttempt=activity.difficulty if activity else "easy",
        createdAt=datetime.utcnow(),
        completedAt=datetime.utcnow(),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    adaptation = update_progress_from_attempt(db, user.id, activity, result)
    reward_result = evaluate_badges(db, user.id)

    feedback = await generate_feedback(
        persona=user.persona or "child",
        language=user.language or "en",
        score=result["score"],
        correct_count=result["correctCount"],
        total_count=result["totalCount"],
        topic=activity.topic if activity else activity_id,
        should_retry=adaptation["shouldRetry"],
    )

    return {
        "attempt": {
            "id": attempt.id,
            "score": attempt.score,
            "correctCount": attempt.correctCount,
            "totalCount": attempt.totalCount,
            "starsAwarded": attempt.starsAwarded,
            "totalStars": reward_result["totalStars"],
            "newlyUnlockedBadges": reward_result["newlyUnlockedBadges"],
            "adaptation": adaptation,
        },
        "feedback": feedback,
    }

@router.get("/{user_id}/recent")
def get_recent_attempts(user_id: str, db: Session = Depends(get_db)):
    attempts = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(desc(Attempt.completedAt), desc(Attempt.createdAt))
        .limit(10)
        .all()
    )

    return {
        "attempts": [
            {
                "id": a.id,
                "score": a.score,
                "correctCount": a.correctCount,
                "totalCount": a.totalCount,
                "completedAt": a.completedAt.isoformat() if a.completedAt else (a.createdAt.isoformat() if a.createdAt else None),
                "activity": {
                    "id": a.activity.id if a.activity else "",
                    "title": a.activity.title if a.activity else "",
                    "type": a.activity.type if a.activity else "",
                    "topic": a.activity.topic if a.activity else "",
                    "difficulty": a.difficultyAtAttempt,
                } if a.activity else None,
            }
            for a in attempts
        ]
    }
