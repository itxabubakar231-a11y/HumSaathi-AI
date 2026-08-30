from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.conversation import EvaluateConversationRequest
from app.services.evaluation_service import evaluate_session, get_evaluation, get_next_recommendation

from app.models.user import User
from app.models.conversation import ConversationSession
from app.dependencies.auth import get_optional_current_user

router = APIRouter(tags=["Evaluations"])

@router.post("/conversation")
async def evaluate_conversation(
    payload: EvaluateConversationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    sess = db.query(ConversationSession).filter(ConversationSession.id == payload.sessionId).first()
    if sess and current_user and sess.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot evaluate another user's conversation.",
        )
    target_user_id = current_user.id if current_user else payload.userId
    try:
        evaluation = await evaluate_session(db, payload.sessionId, target_user_id)
        recommendation = get_next_recommendation(db, target_user_id, evaluation.get("scenarioId", ""))
        return {
            "evaluation": evaluation,
            "recommendation": recommendation,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.get("/{session_id}")
def get_conversation_evaluation(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    sess = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if sess and current_user and sess.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot view another user's evaluation.",
        )
    evaluation = get_evaluation(db, session_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found",
        )
    return {"evaluation": evaluation}
