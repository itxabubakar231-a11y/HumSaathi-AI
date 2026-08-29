from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.schemas.common import parse_json, stringify_json
from app.schemas.user import (
    DEFAULT_SENSORY,
    UserSetupRequest,
    UserLoginRequest,
    PersonaUpdateRequest,
    SensoryUpdateRequest,
    LanguageUpdateRequest,
)

router = APIRouter(prefix="/users", tags=["Users"])

def format_user(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "name": user.name,
        "persona": user.persona,
        "language": user.language,
        "sensoryPrefs": parse_json(user.sensoryPrefs, DEFAULT_SENSORY),
        "setupComplete": user.setupComplete,
        "role": user.role,
    }

@router.post("/setup")
def setup_user(payload: UserSetupRequest, db: Session = Depends(get_db)):
    sensory_dict = dict(DEFAULT_SENSORY)
    if payload.sensoryPrefs:
        sensory_dict.update({k: v for k, v in payload.sensoryPrefs.model_dump().items() if v is not None})

    user = None
    if payload.userId:
        user = db.query(User).filter(User.id == payload.userId).first()
        if user:
            user.name = payload.name
            user.persona = payload.persona
            user.language = payload.language
            user.sensoryPrefs = stringify_json(sensory_dict)
            user.setupComplete = True
            user.updatedAt = datetime.utcnow()
            db.commit()
            db.refresh(user)

    if not user:
        user = User(
            name=payload.name,
            persona=payload.persona,
            language=payload.language,
            sensoryPrefs=stringify_json(sensory_dict),
            setupComplete=True,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"user": format_user(user)}

@router.get("/profiles")
def list_profiles(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .order_by(desc(User.updatedAt), desc(User.createdAt))
        .limit(10)
        .all()
    )
    return {"users": [format_user(u) for u in users]}

@router.post("/login")
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = None

    if payload.userId:
        user = db.query(User).filter(User.id == payload.userId).first()
    elif payload.name and payload.name.strip():
        trimmed_name = payload.name.strip()
        # Prefer the most recently updated profile with this exact name
        user = (
            db.query(User)
            .filter(User.name == trimmed_name)
            .order_by(desc(User.updatedAt))
            .first()
        )
        if not user:
            # Fallback to case‑insensitive match, most recent first
            user = (
                db.query(User)
                .filter(User.name.ilike(trimmed_name))
                .order_by(desc(User.updatedAt))
                .first()
            )
        if not user:
            # Create a default learner profile with that name
            user = User(
                name=trimmed_name,
                persona="child",
                language="en",
                sensoryPrefs=stringify_json(DEFAULT_SENSORY),
                setupComplete=True,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return {"user": format_user(user)}

@router.get("/{user_id}")
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return {"user": format_user(user)}

@router.patch("/{user_id}/persona")
def update_persona(
    user_id: str,
    payload: PersonaUpdateRequest,
    db: Session = Depends(get_db),
):
    if payload.persona not in ["child", "teen", "adult"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid persona",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.persona = payload.persona
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {"user": format_user(user)}

@router.patch("/{user_id}/sensory")
def update_sensory_preferences(
    user_id: str,
    payload: SensoryUpdateRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    current_prefs = parse_json(user.sensoryPrefs, DEFAULT_SENSORY)
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    current_prefs.update(updates)

    user.sensoryPrefs = stringify_json(current_prefs)
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {"user": format_user(user)}

@router.patch("/{user_id}/language")
def update_user_language(
    user_id: str,
    payload: LanguageUpdateRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.language = payload.language
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {"user": format_user(user)}
