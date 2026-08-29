from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

def is_ai_available() -> bool:
    return bool(settings.AI_API_KEY and settings.AI_API_KEY.strip())

@router.get("/health")
def health_check():
    ai_ok = is_ai_available()
    return {
        "status": "ok",
        "service": "HumSaathi API (Python FastAPI)",
        "aiAvailable": ai_ok,
        "mode": "ai_enabled" if ai_ok else "rules_fallback",
    }
