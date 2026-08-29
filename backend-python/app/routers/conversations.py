from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.conversation import CommunicationScenario, ConversationSession
from app.schemas.common import parse_json
from app.schemas.conversation import StartConversationRequest, SendMessageRequest
from app.services.conversation_service import start_session, send_message, end_session

router = APIRouter(prefix="/conversations", tags=["Conversations"])

def format_scenario(s: CommunicationScenario):
    return {
        "id": s.id,
        "title": s.title,
        "description": s.description,
        "aiRole": s.aiRole,
        "personas": parse_json(s.personas, []),
        "languages": parse_json(s.languages, []),
        "difficulty": s.difficulty,
        "objectives": parse_json(s.objectives, []),
        "context": s.context,
        "initialPrompt": parse_json(s.initialPrompt, {}),
        "isActive": s.isActive,
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
        "scenario": format_scenario(s.scenario) if s.scenario else None,
    }

@router.get("/scenarios")
def list_scenarios(
    persona: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(CommunicationScenario).filter(CommunicationScenario.isActive == True)

    if difficulty:
        query = query.filter(CommunicationScenario.difficulty == difficulty)

    all_scenarios = query.all()
    results = []

    for s in all_scenarios:
        s_personas = parse_json(s.personas, [])
        s_languages = parse_json(s.languages, [])

        if persona and persona not in s_personas:
            continue
        if language and language not in s_languages:
            continue

        results.append(format_scenario(s))

    return {"scenarios": results}

@router.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    s = db.query(CommunicationScenario).filter(CommunicationScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found",
        )
    return {"scenario": format_scenario(s)}

@router.post("/start")
def start_conversation(
    payload: StartConversationRequest,
    db: Session = Depends(get_db),
):
    try:
        res = start_session(db, payload.userId, payload.scenarioId, payload.mode or "text")
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
):
    try:
        res = await send_message(db, session_id, payload.userId, payload.message)
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
):
    try:
        sess = end_session(db, session_id)
        return {"session": sess}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("/session/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return {"session": format_session(sess)}

@router.get("/sessions/{user_id}")
def list_user_sessions(user_id: str, db: Session = Depends(get_db)):
    sessions = (
        db.query(ConversationSession)
        .filter(ConversationSession.userId == user_id)
        .order_by(desc(ConversationSession.createdAt))
        .all()
    )
    return {"sessions": [format_session(s) for s in sessions]}

