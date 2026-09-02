from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.user import User, Progress, Attempt, Assessment
from app.models.activity import Activity
from app.schemas.common import parse_json
from app.services.scoring_service import clamp_difficulty
from app.services.progress_service import is_skill_for_persona

TYPE_PRIORITY = {
    'letters': 'letter',
    'numbers': 'number',
    'colors': 'shape_color_match',
    'shapes': 'shape_color_match',
    'counting': 'counting',
    'animals': 'animal_matching',
    'emotions': 'emotion_learning',
    'routines': 'routine_sequencing',
    'vocabulary': 'letter',
    'reading': 'number',
    'problem_solving': 'number',
    'reading_vocabulary': 'letter',
    'teen_reading_vocab': 'letter',
    'teen_problem_solving': 'number',
    'teen_communication': 'letter',
    'functional_reading': 'letter',
    'adult_functional_reading': 'letter',
    'adult_problem_solving': 'number',
    'everyday_communication': 'letter',
    'adult_everyday_comm': 'letter',
}

def find_matching_activity(
    db: Session,
    persona: str,
    language: str,
    activity_type: str,
    topic: Optional[str] = None,
    difficulty: str = "easy",
) -> Optional[Activity]:
    VALID_ENUM_TYPES = {'letter', 'number', 'shape_color_match', 'counting', 'animal_matching', 'emotion_learning', 'routine_sequencing', 'general'}
    query = db.query(Activity).filter(Activity.isActive == True)
    if activity_type in VALID_ENUM_TYPES:
        query = query.filter(Activity.type == activity_type)
    else:
        query = query.filter(Activity.topic == activity_type)

    if language:
        query = query.filter(Activity.language == language)
    if difficulty:
        query = query.filter(Activity.difficulty == difficulty)

    activities = query.all()

    filtered = []
    for a in activities:
        personas = parse_json(a.personas, [])
        if isinstance(personas, str):
            personas = [p.strip() for p in personas.split(',')]
        if persona in personas:
            filtered.append(a)

    if topic:
        by_topic = [a for a in filtered if a.topic == topic]
        if by_topic:
            return by_topic[0]

    return filtered[0] if filtered else None

def recommend_activity_rule_based(db: Session, user_id: str) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.persona:
        raise ValueError("User setup incomplete")

    progress_list = db.query(Progress).filter(Progress.userId == user_id).all()
    latest_attempt = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(desc(Attempt.completedAt), desc(Attempt.createdAt))
        .first()
    )

    default_skill = (
        'letters'
        if user.persona == 'child'
        else 'teen_reading_vocab'
        if user.persona == 'teen'
        else 'adult_functional_reading'
    )
    target_skill = default_skill
    difficulty = 'easy'
    should_retry = False

    if latest_attempt:
        score = latest_attempt.score
        total = latest_attempt.totalCount or 1
        correct = round(score * total)

        last_topic = default_skill
        try:
            ans = parse_json(latest_attempt.answers, [])
            if ans and isinstance(ans, list) and len(ans) > 0 and isinstance(ans[0], dict):
                mod_id = ans[0].get('moduleId')
                if mod_id:
                    last_topic = mod_id
        except Exception:
            pass

        if last_topic == default_skill and latest_attempt.activity and is_skill_for_persona(latest_attempt.activity.topic, user.persona):
            last_topic = latest_attempt.activity.topic

        accuracy_ratio = score if score <= 1.0 else (score / 100.0)
        is_struggling = accuracy_ratio < 0.6 or (total >= 3 and correct <= 1)

        if is_struggling:
            should_retry = True
            difficulty = clamp_difficulty(latest_attempt.difficultyAtAttempt, -1)
            target_skill = last_topic
        else:
            should_retry = False
            next_diff = (
                clamp_difficulty(latest_attempt.difficultyAtAttempt, 1)
                if accuracy_ratio >= 0.85
                else latest_attempt.difficultyAtAttempt
            )

            if len(progress_list) > 1:
                other_skills = [p for p in progress_list if p.skill != last_topic and is_skill_for_persona(p.skill, user.persona)]
                other_skills.sort(key=lambda p: (p.attempts, p.accuracy))
                if other_skills:
                    target_skill = other_skills[0].skill
                    difficulty = other_skills[0].level or next_diff
                else:
                    target_skill = last_topic
                    difficulty = next_diff
            else:
                skill_cycle = (
                    ['letters', 'numbers', 'colors', 'shapes', 'counting', 'animals', 'emotions', 'routines']
                    if user.persona == 'child'
                    else ['teen_reading_vocab', 'teen_problem_solving', 'teen_communication']
                    if user.persona == 'teen'
                    else ['adult_functional_reading', 'adult_problem_solving', 'adult_everyday_comm']
                )
                try:
                    current_idx = skill_cycle.index(last_topic)
                    next_idx = (current_idx + 1) % len(skill_cycle)
                except ValueError:
                    next_idx = 0
                target_skill = skill_cycle[next_idx]
                difficulty = next_diff
    elif progress_list:
        sorted_p = sorted(progress_list, key=lambda p: (p.accuracy, p.attempts))
        target_skill = sorted_p[0].skill
        difficulty = sorted_p[0].level
    else:
        assessment = (
            db.query(Assessment)
            .filter(Assessment.userId == user_id)
            .order_by(desc(Assessment.createdAt))
            .first()
        )
        if assessment:
            difficulty = assessment.estimatedLevel
            areas = parse_json(assessment.areaLevels, {})
            if areas and isinstance(areas, dict):
                order = ['beginner', 'easy', 'medium', 'hard', 'advanced']
                sorted_areas = sorted(
                    areas.items(),
                    key=lambda item: order.index(item[1]) if item[1] in order else 1,
                )
                if sorted_areas:
                    target_skill = sorted_areas[0][0]

    activity_type = TYPE_PRIORITY.get(target_skill, 'letter')
    activity = find_matching_activity(
        db=db,
        persona=user.persona,
        language=user.language,
        activity_type=activity_type,
        topic=target_skill,
        difficulty=difficulty,
    )

    reasons = {
        'retry': {
            'en': 'Let us practice this skill again with a simpler activity.',
            'ur': 'آئیے اس مہارت کی ایک آسان سرگرمی کے ساتھ دوبارہ مشق کریں۔',
            'ur_rm': 'Aaiye is maharat ki aik aasaan activity ke sath dobara mashq karein.',
        },
        'next': {
            'en': 'Based on your progress, here is a good next step.',
            'ur': 'آپ کی پیش رفت کی بنیاد پر، یہ اگلا اچھا قدم ہے۔',
            'ur_rm': 'Aap ki taraqqi ki bunyaad par, yeh agla acha step hai.',
        },
    }

    user_lang = user.language or 'en'
    reason_dict = reasons['retry'] if should_retry else reasons['next']
    reason_text = reason_dict.get(user_lang, reason_dict['en'])

    resolved_activity_id = target_skill
    if user.persona == 'child' and activity:
        resolved_activity_id = activity.id

    return {
        "activityType": activity_type,
        "topic": target_skill,
        "difficulty": difficulty,
        "questionCount": 5,
        "shouldRetry": should_retry,
        "reason": reason_text,
        "activityId": resolved_activity_id,
        "source": "rules_fallback",
    }

def clamp_recommendation(raw: Dict[str, Any], user_progress: Optional[List[Any]] = None) -> Dict[str, Any]:
    allowed_types = [
        'letter', 'number', 'shape_color_match', 'counting',
        'animal_matching', 'emotion_learning', 'routine_sequencing',
    ]
    activity_type = raw.get("activityType")
    if activity_type not in allowed_types:
        activity_type = 'letter'

    difficulty = raw.get("difficulty")
    if difficulty not in ['beginner', 'easy', 'medium', 'hard', 'advanced']:
        difficulty = 'easy'

    question_count = min(10, max(3, int(raw.get("questionCount", 5))))

    return {
        "activityType": activity_type,
        "topic": raw.get("topic") or "letters",
        "difficulty": difficulty,
        "questionCount": question_count,
        "shouldRetry": bool(raw.get("shouldRetry")),
        "reason": str(raw.get("reason") or "Recommended for your learning level.")[:300],
        "activityId": raw.get("activityId"),
    }
