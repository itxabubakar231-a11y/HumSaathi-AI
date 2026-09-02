import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User, Progress, Attempt, Assessment, AiRecommendation
from app.models.activity import Activity
from app.schemas.common import stringify_json
from app.services.ai.ai_service import call_ai_chat, is_ai_available
from app.services.recommendation_service import (
    recommend_activity_rule_based,
    clamp_recommendation,
    find_matching_activity,
)

async def recommend_activity(db: Session, user_id: str) -> Dict[str, Any]:
    rule_based = recommend_activity_rule_based(db, user_id)

    if not is_ai_available():
        return {**rule_based, "source": "rules_fallback"}

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {**rule_based, "source": "rules_fallback"}

    progress_list = db.query(Progress).filter(Progress.userId == user_id).all()
    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.userId == user_id)
        .order_by(desc(Assessment.createdAt))
        .first()
    )
    recent_attempts = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(desc(Attempt.completedAt))
        .limit(3)
        .all()
    )

    prog_summary = [
        {"skill": p.skill, "level": p.level, "accuracy": round(p.accuracy, 2), "attempts": p.attempts}
        for p in progress_list
    ]
    attempts_summary = [
        {"score": a.score, "topic": a.activity.topic if a.activity else "", "difficulty": a.difficultyAtAttempt}
        for a in recent_attempts
    ]

    prompt = (
        f"Recommend next learning activity for HumSaathi AI (educational only, not medical).\n"
        f"Return JSON: {{ activityType: letter|number|shape_color_match, topic, difficulty, questionCount (3-10), shouldRetry, reason }}.\n"
        f"Persona: {user.persona}. Language: {user.language}.\n"
        f"Progress: {json.dumps(prog_summary)}.\n"
        f"Assessment level: {latest_assessment.estimatedLevel if latest_assessment else 'unknown'}.\n"
        f"Recent attempts: {json.dumps(attempts_summary)}.\n"
        f"Keep reason under 2 sentences, supportive and non-judgmental."
    )

    messages = [
        {"role": "system", "content": "Return valid JSON only."},
        {"role": "user", "content": prompt},
    ]

    ai_result = await call_ai_chat(messages, temperature=0.3)
    if not ai_result or not isinstance(ai_result, dict):
        return {**rule_based, "source": "rules_fallback"}

    clamped = clamp_recommendation(ai_result, progress_list)
    activity = find_matching_activity(
        db=db,
        persona=user.persona,
        language=user.language,
        activity_type=clamped["activityType"],
        topic=clamped["topic"],
        difficulty=clamped["difficulty"],
    )

    result = {
        **clamped,
        "activityId": activity.id if activity else clamped["topic"],
        "source": "ai",
    }

    try:
        ai_rec = AiRecommendation(
            userId=user_id,
            kind="activity",
            input=stringify_json({"progress": prog_summary, "latestAssessmentId": latest_assessment.id if latest_assessment else None}),
            output=stringify_json(result),
            source=result["source"],
        )
        db.add(ai_rec)
        db.commit()
    except Exception:
        db.rollback()

    return result
