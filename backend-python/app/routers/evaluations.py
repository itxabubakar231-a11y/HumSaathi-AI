from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.conversation import EvaluateConversationRequest
from app.services.evaluation_service import evaluate_session, get_evaluation, get_next_recommendation

router = APIRouter(tags=["Evaluations"])

@router.post("/conversation")
async def evaluate_conversation(
    payload: EvaluateConversationRequest,
    db: Session = Depends(get_db),
):
    try:
        evaluation = await evaluate_session(db, payload.sessionId, payload.userId)
        recommendation = get_next_recommendation(db, payload.userId, evaluation.get("scenarioId", ""))
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
):
    evaluation = get_evaluation(db, session_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found",
        )
    return {"evaluation": evaluation}
