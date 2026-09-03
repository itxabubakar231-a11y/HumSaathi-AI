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

CHILD_SKILLS = {
    'letters', 'letter', 'numbers', 'number', 'colors', 'shapes', 'shape_color_match',
    'counting', 'animals', 'animal_matching', 'emotions', 'emotion_learning', 'routines', 'routine_sequencing', 'general'
}

TEEN_SKILLS = {
    'teen_reading_vocab', 'reading_vocabulary', 'reading_vocab',
    'teen_problem_solving', 'problem_solving',
    'teen_communication', 'teen_social_comm', 'communication', 'social_comm', 'conversation',
    'teen_decision_making', 'decision_making'
}

ADULT_SKILLS = {
    'adult_functional_reading', 'functional_reading',
    'adult_problem_solving', 'workplace_problem_solving', 'everyday_problem_solving', 'problem_solving',
    'adult_everyday_comm', 'adult_workplace_comm', 'everyday_communication', 'workplace_communication', 'communication', 'conversation',
    'adult_decision_making', 'independent_decision_making'
}

def is_skill_for_persona(skill: str, target_persona: str) -> bool:
    s = (skill or "").lower().strip()
    if target_persona == 'teen':
        return s in TEEN_SKILLS or s.startswith('teen_')
    elif target_persona == 'adult':
        return s in ADULT_SKILLS or s.startswith('adult_')
    else:  # child
        return s in CHILD_SKILLS or (not s.startswith('teen_') and not s.startswith('adult_') and s not in TEEN_SKILLS and s not in ADULT_SKILLS)

def is_attempt_for_persona(attempt: Attempt, target_persona: str) -> bool:
    mod_id = None
    try:
        ans = parse_json(attempt.answers, [])
        if ans and isinstance(ans, list) and len(ans) > 0 and isinstance(ans[0], dict):
            mod_id = ans[0].get('moduleId')
    except Exception:
        pass

    target_id = (mod_id or attempt.activityId or "").lower()
    topic = ((attempt.activity.topic if attempt.activity else None) or target_id).lower()
    if mod_id:
        topic = mod_id.lower()

    if target_persona == 'teen':
        return target_id.startswith('teen_') or topic in TEEN_SKILLS
    elif target_persona == 'adult':
        return target_id.startswith('adult_') or topic in ADULT_SKILLS
    else:  # child
        return not target_id.startswith('teen_') and not target_id.startswith('adult_') and topic not in TEEN_SKILLS and topic not in ADULT_SKILLS

def get_user_progress(db: Session, user_id: str, persona: Optional[str] = None) -> List[Dict[str, Any]]:
    user = db.query(User).filter(User.id == user_id).first()
    active_persona = persona or (user.persona if user else 'child') or 'child'
    records = db.query(Progress).filter(Progress.userId == user_id).order_by(Progress.skill.asc()).all()
    filtered = [p for p in records if is_skill_for_persona(p.skill, active_persona)]
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
        for p in filtered
    ]

SKILL_TRANSLATIONS = {
    'reading_vocabulary': {'en': 'Reading & Vocabulary', 'ur': 'مطالعہ اور الفاظ', 'ur_rm': 'Reading & Vocabulary'},
    'problem_solving': {'en': 'Problem Solving', 'ur': 'مسائل کا حل', 'ur_rm': 'Problem Solving'},
    'communication': {'en': 'Social Communication', 'ur': 'گفتگو اور سماجی مہارتیں', 'ur_rm': 'Social Communication'},
    'functional_reading': {'en': 'Functional Reading', 'ur': 'عملی مطالعہ', 'ur_rm': 'Functional Reading'},
    'everyday_communication': {'en': 'Everyday Communication', 'ur': 'روزمرہ گفتگو', 'ur_rm': 'Everyday Communication'},
    'workplace_communication': {'en': 'Workplace Communication', 'ur': 'دفتری گفتگو', 'ur_rm': 'Workplace Communication'},
    'letters': {'en': 'Letters', 'ur': 'حروف', 'ur_rm': 'Huroof'},
    'numbers': {'en': 'Numbers', 'ur': 'اعداد', 'ur_rm': 'Numbers'},
    'shapes': {'en': 'Shapes & Colors', 'ur': 'اشکال اور رنگ', 'ur_rm': 'Shapes aur Colors'},
}

def format_strengths_for_language(skills: List[str], language: str = 'en') -> List[str]:
    res = []
    for s in skills:
        trans = SKILL_TRANSLATIONS.get(s, {})
        res.append(trans.get(language, trans.get('en', s.replace('_', ' ').title())))
    return res

def get_dashboard_stats(db: Session, user_id: str, persona: Optional[str] = None) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {'user': None}

    active_persona = persona or user.persona or 'child'

    all_progress = db.query(Progress).filter(Progress.userId == user_id).all()
    all_attempts = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(Attempt.completedAt.desc(), Attempt.createdAt.desc())
        .all()
    )

    # Strictly isolate data by active persona
    progress_records = [p for p in all_progress if is_skill_for_persona(p.skill, active_persona)]
    attempts_records = [a for a in all_attempts if is_attempt_for_persona(a, active_persona)]

    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.userId == user_id, Assessment.persona == active_persona)
        .order_by(Assessment.createdAt.desc())
        .first()
    )
    if not latest_assessment:
        latest_assessment = (
            db.query(Assessment)
            .filter(Assessment.userId == user_id)
            .order_by(Assessment.createdAt.desc())
            .first()
        )

    # Query completed conversation sessions for this user & persona
    from app.models.conversation import ConversationSession
    from datetime import datetime, timedelta

    all_sessions = (
        db.query(ConversationSession)
        .filter(ConversationSession.userId == user_id, ConversationSession.completed == True)
        .all()
    )

    # Filter sessions by persona
    persona_sessions = []
    for s in all_sessions:
        scen_personas = []
        if s.scenario and s.scenario.personas:
            p_val = s.scenario.personas
            scen_personas = parse_json(p_val, []) if isinstance(p_val, str) else p_val
        elif s.scenarioId:
            # Fallback check from ALL_SCENARIOS
            from app.data.scenarios import ALL_SCENARIOS
            sc = next((x for x in ALL_SCENARIOS if x["id"] == s.scenarioId), None)
            if sc:
                scen_personas = sc.get("personas", [])
        if active_persona in scen_personas or not scen_personas:
            persona_sessions.append(s)

    # Real Activity Dates calculation for streaks
    active_dates = set()
    for a in attempts_records:
        if a.completedAt:
            active_dates.add(a.completedAt.date())
        elif a.createdAt:
            active_dates.add(a.createdAt.date())

    for s in persona_sessions:
        if s.completedAt:
            active_dates.add(s.completedAt.date())
        elif s.createdAt:
            active_dates.add(s.createdAt.date())

    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    current_streak = 0
    check_date = today if today in active_dates else (yesterday if yesterday in active_dates else None)
    while check_date and check_date in active_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    start_of_week = today - timedelta(days=today.weekday())
    weekly_activity_days = []
    for i in range(7):
        d = start_of_week + timedelta(days=i)
        if d in active_dates:
            weekly_activity_days.append(i)

    today_attempts = sum(1 for a in attempts_records if (a.completedAt and a.completedAt.date() == today) or (not a.completedAt and a.createdAt and a.createdAt.date() == today))
    today_sessions = sum(1 for s in persona_sessions if (s.completedAt and s.completedAt.date() == today) or (not s.completedAt and s.createdAt and s.createdAt.date() == today))
    today_completed_count = today_attempts + today_sessions

    completed_count = len(attempts_records) + len(persona_sessions)
    total_score_sum = sum(a.score for a in attempts_records)
    avg_accuracy = (
        (total_score_sum / len(attempts_records))
        if len(attempts_records) > 0
        else (progress_records[0].accuracy if progress_records else 0.0)
    )

    practiced = [p for p in progress_records if p.attempts > 0]
    practiced_sorted = sorted(practiced, key=lambda p: (p.accuracy, p.attempts), reverse=True)

    # Evidence-based strengths from real performance and attempt history for this persona
    strengths_records = [p for p in practiced_sorted if p.accuracy >= 0.6]
    needs_practice_records = [p for p in practiced_sorted if p.accuracy < 0.6]

    sorted_by_accuracy = sorted(progress_records, key=lambda p: p.accuracy, reverse=True)
    strongest = practiced_sorted[0] if practiced_sorted else (sorted_by_accuracy[0] if sorted_by_accuracy else None)
    weakest = sorted(practiced, key=lambda p: p.accuracy)[0] if practiced else (progress_records[0] if progress_records else None)

    current_level = (
        latest_assessment.estimatedLevel
        if latest_assessment
        else (progress_records[0].level if progress_records else ('beginner' if active_persona == 'child' else 'easy'))
    )

    return {
        'user': user,
        'persona': active_persona,
        'progress': progress_records,
        'attempts': attempts_records[:10],
        'completedCount': completed_count,
        'todayCompletedCount': today_completed_count,
        'currentStreak': current_streak,
        'weeklyActivityDays': weekly_activity_days,
        'avgAccuracy': avg_accuracy,
        'strongest': strongest,
        'weakest': weakest,
        'strengths': strengths_records,
        'needsPracticeList': needs_practice_records,
        'currentLevel': current_level,
        'latestAssessment': latest_assessment,
    }
