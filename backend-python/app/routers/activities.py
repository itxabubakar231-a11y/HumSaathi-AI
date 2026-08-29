from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.activity import Activity
from app.schemas.common import parse_json
from app.activities.registry import get_activity_content, ACTIVITY_BUILDERS

router = APIRouter(prefix="/activities", tags=["Activities"])

ACTIVITY_TOPIC_DEFS: Dict[str, Dict[str, str]] = {
    'letters': {'type': 'letter', 'topic': 'letters', 'title': 'Letter Learning'},
    'letter': {'type': 'letter', 'topic': 'letters', 'title': 'Letter Learning'},
    'numbers': {'type': 'number', 'topic': 'numbers', 'title': 'Number Learning'},
    'number': {'type': 'number', 'topic': 'numbers', 'title': 'Number Learning'},
    'colors': {'type': 'shape_color_match', 'topic': 'colors', 'title': 'Shape & Color Match'},
    'shapes': {'type': 'shape_color_match', 'topic': 'shapes', 'title': 'Shape Matching'},
    'shape_color_match': {'type': 'shape_color_match', 'topic': 'shapes', 'title': 'Shape Matching'},
    'counting': {'type': 'counting', 'topic': 'counting', 'title': 'Object Counting'},
    'animals': {'type': 'animal_matching', 'topic': 'animals', 'title': 'Animal Matching'},
    'animal_matching': {'type': 'animal_matching', 'topic': 'animals', 'title': 'Animal Matching'},
    'emotions': {'type': 'emotion_learning', 'topic': 'emotions', 'title': 'Emotion Learning'},
    'emotion_learning': {'type': 'emotion_learning', 'topic': 'emotions', 'title': 'Emotion Learning'},
    'routines': {'type': 'routine_sequencing', 'topic': 'routines', 'title': 'Daily Routine Sequence'},
    'routine_sequencing': {'type': 'routine_sequencing', 'topic': 'routines', 'title': 'Daily Routine Sequence'},
    # Teen Modules
    'teen_reading_vocab': {'type': 'reading_vocabulary', 'topic': 'reading_vocabulary', 'title': 'Reading & Vocabulary'},
    'reading_vocabulary': {'type': 'reading_vocabulary', 'topic': 'reading_vocabulary', 'title': 'Reading & Vocabulary'},
    'teen_problem_solving': {'type': 'problem_solving', 'topic': 'problem_solving', 'title': 'Problem Solving'},
    'problem_solving': {'type': 'problem_solving', 'topic': 'problem_solving', 'title': 'Problem Solving'},
    'teen_communication': {'type': 'communication', 'topic': 'communication', 'title': 'Social Communication'},
    'communication': {'type': 'communication', 'topic': 'communication', 'title': 'Communication'},
    'teen_decision_making': {'type': 'decision_making', 'topic': 'decision_making', 'title': 'Decision Making'},
    # Adult Modules
    'adult_functional_reading': {'type': 'functional_reading', 'topic': 'functional_reading', 'title': 'Functional Reading'},
    'functional_reading': {'type': 'functional_reading', 'topic': 'functional_reading', 'title': 'Functional Reading'},
    'adult_problem_solving': {'type': 'workplace_problem_solving', 'topic': 'workplace_problem_solving', 'title': 'Everyday Problem Solving'},
    'workplace_problem_solving': {'type': 'workplace_problem_solving', 'topic': 'workplace_problem_solving', 'title': 'Workplace Problem Solving'},
    'adult_everyday_comm': {'type': 'everyday_communication', 'topic': 'everyday_communication', 'title': 'Everyday Communication'},
    'everyday_communication': {'type': 'everyday_communication', 'topic': 'everyday_communication', 'title': 'Everyday Communication'},
    'adult_workplace_comm': {'type': 'workplace_communication', 'topic': 'workplace_communication', 'title': 'Workplace Communication'},
    'workplace_communication': {'type': 'workplace_communication', 'topic': 'workplace_communication', 'title': 'Workplace Communication'},
    'adult_decision_making': {'type': 'independent_decision_making', 'topic': 'independent_decision_making', 'title': 'Independent Decision Making'},
}

@router.get("/{activity_id}")
def get_activity_by_id(
    activity_id: str,
    language: Optional[str] = Query("en"),
    difficulty: Optional[str] = Query("easy"),
    db: Session = Depends(get_db),
):
    normalized_key = activity_id.lower().strip()
    lang = language or 'en'
    diff = difficulty or 'easy'

    # 1. Fast path for recognized foundational topics (letters, numbers, colors, shapes, counting, animals, emotions, routines)
    if normalized_key in ACTIVITY_TOPIC_DEFS:
        definition = ACTIVITY_TOPIC_DEFS[normalized_key]
        act_type = definition['type']
        act_topic = definition['topic']
        act_title = definition['title']

        # Always generate fresh, varied, non-repeating question sets
        generated_content = get_activity_content(act_type, diff, lang)
        safe_content = {
            "questions": [
                {
                    "id": q.get("id"),
                    "prompt": q.get("prompt"),
                    "options": q.get("options", []),
                    "visual": q.get("visual"),
                    "visualPrompt": q.get("visualPrompt"),
                    "hint": q.get("hint"),
                    "correctAnswer": q.get("correctAnswer"),
                }
                for q in generated_content.get("questions", [])
            ]
        }

        return {
            "activity": {
                "id": normalized_key,
                "type": act_type,
                "topic": act_topic,
                "title": act_title,
                "difficulty": diff,
                "language": lang,
                "content": safe_content,
            }
        }

    # 2. Look up by custom ID in database
    activity = None
    try:
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
    except Exception:
        activity = None

    if activity:
        content = parse_json(activity.content, {})
        questions = content.get("questions") if isinstance(content, dict) else None

        if not questions or len(questions) == 0:
            content = get_activity_content(activity.type, activity.difficulty, activity.language)
            questions = content.get("questions", [])

        safe_content = {
            "questions": [
                {
                    "id": q.get("id"),
                    "prompt": q.get("prompt"),
                    "options": q.get("options", []),
                    "visual": q.get("visual"),
                    "visualPrompt": q.get("visualPrompt"),
                    "hint": q.get("hint"),
                    "correctAnswer": q.get("correctAnswer"),
                }
                for q in questions
            ]
        }

        return {
            "activity": {
                "id": activity.id,
                "type": activity.type,
                "topic": activity.topic,
                "title": activity.title,
                "difficulty": activity.difficulty,
                "language": activity.language,
                "content": safe_content,
            }
        }

    # 3. Not found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Activity not found",
    )

@router.get("")
def list_activities(
    persona: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(Activity).filter(Activity.isActive == True)

        if language:
            query = query.filter(Activity.language == language)
        if type:
            query = query.filter(Activity.type == type)
        if difficulty:
            query = query.filter(Activity.difficulty == difficulty)

        activities = query.all()
    except Exception:
        activities = []

    filtered = []
    for a in activities:
        if persona:
            personas = parse_json(a.personas, [])
            if persona not in personas:
                continue
        filtered.append({
            "id": a.id,
            "type": a.type,
            "topic": a.topic,
            "title": a.title,
            "difficulty": a.difficulty,
            "language": a.language,
        })

    return {"activities": filtered}
