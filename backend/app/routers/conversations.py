from typing import Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.conversation import CommunicationScenario, ConversationSession
from app.schemas.common import parse_json
from app.schemas.conversation import StartConversationRequest, SendMessageRequest
from app.services.conversation_service import start_session, send_message, end_session
from app.data.scenarios import DEFAULT_SCENARIOS, ALL_SCENARIOS, GENERAL_CHAT_SCENARIO

router = APIRouter(prefix="/conversations", tags=["Conversations"])

def format_scenario(s: Union[CommunicationScenario, Dict[str, Any]], language: Optional[str] = None):
    s_id = s.id if hasattr(s, "id") else s.get("id")
    s_def = next((item for item in ALL_SCENARIOS if item["id"] == s_id), None)


    title_data = s_def["title"] if s_def and isinstance(s_def.get("title"), dict) else (getattr(s, "title", None) or (s.get("title") if isinstance(s, dict) else ""))
    desc_data = s_def["description"] if s_def and isinstance(s_def.get("description"), dict) else (getattr(s, "description", None) or (s.get("description") if isinstance(s, dict) else ""))
    role_data = s_def["aiRole"] if s_def and isinstance(s_def.get("aiRole"), dict) else (getattr(s, "aiRole", None) or (s.get("aiRole") if isinstance(s, dict) else ""))

    obj_raw = getattr(s, "objectives", None) if hasattr(s, "objectives") else (s.get("objectives") if isinstance(s, dict) else [])
    obj_data = s_def["objectives"] if s_def and isinstance(s_def.get("objectives"), dict) else parse_json(obj_raw, [])

    init_raw = getattr(s, "initialPrompt", None) if hasattr(s, "initialPrompt") else (s.get("initialPrompt") if isinstance(s, dict) else {})
    init_data = s_def["initialPrompt"] if s_def and isinstance(s_def.get("initialPrompt"), dict) else parse_json(init_raw, {})

    personas_raw = getattr(s, "personas", None) if hasattr(s, "personas") else (s.get("personas") if isinstance(s, dict) else [])
    personas = s_def["personas"] if s_def else parse_json(personas_raw, [])

    langs_raw = getattr(s, "languages", None) if hasattr(s, "languages") else (s.get("languages") if isinstance(s, dict) else [])
    languages = s_def["languages"] if s_def else parse_json(langs_raw, [])

    difficulty = s_def["difficulty"] if s_def else (getattr(s, "difficulty", "easy") if hasattr(s, "difficulty") else s.get("difficulty", "easy"))
    context = s_def["context"] if s_def else (getattr(s, "context", "") if hasattr(s, "context") else s.get("context", ""))
    options_data = s_def.get("options", []) if s_def else []

    lang = language or "en"

    # Resolve strings for requested language
    resolved_title = title_data.get(lang, title_data.get("en", str(title_data))) if isinstance(title_data, dict) else str(title_data)
    resolved_desc = desc_data.get(lang, desc_data.get("en", str(desc_data))) if isinstance(desc_data, dict) else str(desc_data)
    resolved_role = role_data.get(lang, role_data.get("en", str(role_data))) if isinstance(role_data, dict) else str(role_data)

    if isinstance(obj_data, dict):
        resolved_objs = obj_data.get(lang, obj_data.get("en", []))
    elif isinstance(obj_data, list):
        resolved_objs = obj_data
    else:
        resolved_objs = [str(obj_data)]

    resolved_options = []
    for o in options_data:
        o_text = o.get("text", {})
        o_feedback = o.get("feedback", {})
        resolved_options.append({
            "id": o.get("id"),
            "type": o.get("type", "best"),
            "score": o.get("score", 100),
            "text": o_text.get(lang, o_text.get("en", str(o_text))) if isinstance(o_text, dict) else str(o_text),
            "feedback": o_feedback.get(lang, o_feedback.get("en", str(o_feedback))) if isinstance(o_feedback, dict) else str(o_feedback),
        })

    category = s_def.get("category", "general") if s_def else (getattr(s, "category", "general") if hasattr(s, "category") else "general")

    return {
        "id": s_id,
        "title": resolved_title,
        "rawTitle": title_data if isinstance(title_data, dict) else {"en": str(title_data)},
        "description": resolved_desc,
        "rawDescription": desc_data if isinstance(desc_data, dict) else {"en": str(desc_data)},
        "aiRole": resolved_role,
        "rawAiRole": role_data if isinstance(role_data, dict) else {"en": str(role_data)},
        "personas": personas,
        "languages": languages,
        "difficulty": difficulty,
        "category": category,
        "objectives": resolved_objs,
        "rawObjectives": obj_data if isinstance(obj_data, dict) else {"en": resolved_objs},
        "context": context,
        "initialPrompt": init_data,
        "options": resolved_options,
        "isActive": True,
    }

def format_session(s: ConversationSession):
    return {
        "id": s.id,
        "userId": s.userId,
        "scenarioId": s.scenarioId,
        "mode": s.mode,
        "language": s.language,
        "transcript": parse_json(s.transcript, []),
        "turnCount": s.turnCount,
        "completed": s.completed,
        "createdAt": s.createdAt.isoformat() if s.createdAt else None,
        "completedAt": s.completedAt.isoformat() if s.completedAt else None,
        "scenario": format_scenario(s.scenario or {"id": s.scenarioId}, language=s.language) if (s.scenario or s.scenarioId) else None,
    }

@router.get("/scenarios")
def list_scenarios(
    persona: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    include_general: bool = Query(False),
    db: Session = Depends(get_db),
):
    results = []
    pool = ALL_SCENARIOS if include_general else DEFAULT_SCENARIOS
    for s in pool:
        if persona and persona not in s["personas"]:
            continue
        if language and language not in s["languages"]:
            continue
        if difficulty and difficulty != "all" and s["difficulty"] != difficulty:
            continue
        if category and category != "all" and s.get("category") != category:
            continue
        results.append(format_scenario(s, language=language))

    return {"scenarios": results}

@router.get("/scenarios/{scenario_id}")
def get_scenario(
    scenario_id: str,
    language: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    s_def = next((item for item in ALL_SCENARIOS if item["id"] == scenario_id), None)
    if s_def:
        return {"scenario": format_scenario(s_def, language=language)}

    try:
        s = db.query(CommunicationScenario).filter(CommunicationScenario.id == scenario_id).first()
        if s:
            return {"scenario": format_scenario(s, language=language)}
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Scenario not found",
    )


from app.models.user import User
from app.dependencies.auth import get_optional_current_user

@router.post("/start")
def start_conversation(
    payload: StartConversationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    target_user_id = current_user.id if current_user else payload.userId
    try:
        res = start_session(db, target_user_id, payload.scenarioId, payload.mode or "text", language=payload.language)
        return res
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/{session_id}/message")
async def send_conversation_message(
    session_id: str,
    payload: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    sess = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if current_user and sess.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You cannot send messages in another user's session.")

    target_user_id = current_user.id if current_user else payload.userId
    try:
        res = await send_message(db, session_id, target_user_id, payload.message, language=payload.language)
        return res
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/{session_id}/end")
def end_conversation(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    sess = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if current_user and sess.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You cannot end another user's session.")

    try:
        res = end_session(db, session_id)
        return {"session": res}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("/session/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    sess = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if current_user and sess.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's conversation session.",
        )
    return {"session": format_session(sess)}

@router.get("/sessions/{user_id}")
def list_user_sessions(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's conversation sessions.",
        )
    sessions = (
        db.query(ConversationSession)
        .filter(ConversationSession.userId == user_id)
        .order_by(desc(ConversationSession.createdAt))
        .all()
    )
    return {"sessions": [format_session(s) for s in sessions]}

