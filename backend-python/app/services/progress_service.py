from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User, Progress, Attempt, Assessment
from app.models.activity import Activity
from app.schemas.common import parse_json, stringify_json
from app.services.scoring_service import adapt_difficulty, level_from_score

def build_area_levels_from_questions(
    questions: List[Dict[str, Any]],
    graded_responses: List[Dict[str, Any]],
    score: float,
) -> Dict[str, str]:
    areas = {}
    for question in questions:
        qid = question.get("id")
        response = next((r for r in graded_responses if r.get("questionId") == qid), None)
        area = question.get("area") or question.get("skill") or "general"
        if area not in areas:
            areas[area] = {"correct": 0, "total": 0}
        areas[area]["total"] += 1
        if response and response.get("correct"):
            areas[area]["correct"] += 1

    area_levels = {}
    for area, stats in areas.items():
        area_score = stats["correct"] / stats["total"] if stats["total"] > 0 else score
        area_levels[area] = level_from_score(area_score)
    return area_levels

def upsert_progress_from_assessment(db: Session, user_id: str, area_levels: Dict[str, str]):
    for skill, level in area_levels.items():
        existing = db.query(Progress).filter(Progress.userId == user_id, Progress.skill == skill).first()
        if existing:
            existing.level = level
            existing.updatedAt = datetime.utcnow()
        else:
            p = Progress(
                userId=user_id,
                skill=skill,
                level=level,
                accuracy=0.0,
                attempts=0,
            )
            db.add(p)
    db.commit()

def update_progress_from_attempt(
    db: Session,
    user_id: str,
    activity: Optional[Activity],
    attempt_result: Dict[str, Any],
    fallback_topic: str = "letters",
) -> Dict[str, Any]:
    skill = (activity.topic if activity and activity.topic else fallback_topic)
    difficulty = (activity.difficulty if activity and activity.difficulty else "easy")
    existing = db.query(Progress).filter(Progress.userId == user_id, Progress.skill == skill).first()

    current_level = existing.level if existing else difficulty
    adaptation = adapt_difficulty(current_level, attempt_result["score"], attempt_result["totalCount"])

    prev_attempts = existing.attempts if existing else 0
    prev_accuracy = existing.accuracy if existing else 0.0
    new_attempts = prev_attempts + 1
    new_accuracy = ((prev_accuracy * prev_attempts) + attempt_result["score"]) / new_attempts

    if existing:
        existing.level = adaptation["level"]
        existing.accuracy = new_accuracy
        existing.attempts = new_attempts
        existing.updatedAt = datetime.utcnow()
    else:
        p = Progress(
            userId=user_id,
            skill=skill,
            level=adaptation["level"],
            accuracy=new_accuracy,
            attempts=1,
        )
        db.add(p)

    db.commit()
    return adaptation

def get_user_progress(db: Session, user_id: str) -> List[Dict[str, Any]]:
    records = db.query(Progress).filter(Progress.userId == user_id).order_by(Progress.skill.asc()).all()
    return [
        {
            'id': p.id,
            'userId': p.userId,
            'skill': p.skill,
            'level': p.level,
            'accuracy': p.accuracy,
            'attempts': p.attempts,
            'updatedAt': p.updatedAt.isoformat() if p.updatedAt else None,
        }
        for p in records
    ]

def get_dashboard_stats(db: Session, user_id: str) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {'user': None}

    progress_records = db.query(Progress).filter(Progress.userId == user_id).all()
    attempts_records = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(Attempt.completedAt.desc(), Attempt.createdAt.desc())
        .all()
    )
    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.userId == user_id)
        .order_by(Assessment.createdAt.desc())
        .first()
    )

    completed_count = len(attempts_records)
    avg_accuracy = (
        sum(a.score for a in attempts_records) / completed_count
        if completed_count > 0
        else 0.0
    )

    sorted_by_accuracy = sorted(progress_records, key=lambda p: p.accuracy, reverse=True)
    strongest = sorted_by_accuracy[0] if sorted_by_accuracy else None
    weakest = sorted(progress_records, key=lambda p: p.accuracy)[0] if progress_records else None

    current_level = (
        latest_assessment.estimatedLevel
        if latest_assessment
        else (progress_records[0].level if progress_records else 'beginner')
    )

    return {
        'user': user,
        'progress': progress_records,
        'attempts': attempts_records[:10],
        'completedCount': completed_count,
        'avgAccuracy': avg_accuracy,
        'strongest': strongest,
        'weakest': weakest,
        'currentLevel': current_level,
        'latestAssessment': latest_assessment,
    }
