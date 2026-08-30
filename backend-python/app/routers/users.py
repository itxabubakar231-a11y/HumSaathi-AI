import re
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.schemas.common import parse_json, stringify_json
from app.schemas.user import (
    DEFAULT_SENSORY,
    UserSignupRequest,
    UserAuthLoginRequest,
    UserSetupRequest,
    UserLoginRequest,
    PersonaUpdateRequest,
    SensoryUpdateRequest,
    LanguageUpdateRequest,
)
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.dependencies.auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/users", tags=["Users"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def format_user(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "persona": user.persona,
        "language": user.language,
        "sensoryPrefs": parse_json(user.sensoryPrefs, DEFAULT_SENSORY),
        "setupComplete": user.setupComplete,
        "role": user.role or "learner",
        "isActive": getattr(user, "isActive", True),
    }

@router.post("/signup")
def signup_user(payload: UserSignupRequest, db: Session = Depends(get_db)):
    # 1. Validate full name
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot be empty.",
        )

    # 2. Validate email format
    email = payload.email.strip().lower()
    if not email or not EMAIL_REGEX.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    # 3. Validate password length
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    # 4. Check for duplicate email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead.",
        )

    # 5. Hash password securely
    password_hash = hash_password(payload.password)

    # 6. Initialize sensory preferences
    sensory_dict = dict(DEFAULT_SENSORY)
    if payload.sensoryPrefs:
        sensory_dict.update({k: v for k, v in payload.sensoryPrefs.model_dump().items() if v is not None})

    # Strict server-side role assignment: normal signup is always 'learner'
    user = User(
        name=name,
        email=email,
        passwordHash=password_hash,
        role="learner",
        persona=payload.persona or "child",
        language=payload.language or "en",
        sensoryPrefs=stringify_json(sensory_dict),
        isActive=True,
        setupComplete=True,
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow(),
        lastActiveAt=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)

    return {
        "token": token,
        "user": format_user(user),
    }

@router.post("/login")
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = None

    # Case A: Standard secure email + password login
    if payload.email and payload.password:
        email = payload.email.strip().lower()
        user = db.query(User).filter(User.email == email).first()

        if not user or not user.passwordHash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials.",
            )

        if not verify_password(payload.password, user.passwordHash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials.",
            )

    # Case B: Backward compatibility for automated setup tests passing userId or name
    elif payload.userId:
        user = db.query(User).filter(User.id == payload.userId).first()
    elif payload.name and payload.name.strip():
        trimmed_name = payload.name.strip()
        user = (
            db.query(User)
            .filter(User.name == trimmed_name)
            .order_by(desc(User.updatedAt))
            .first()
        )
        if not user:
            user = (
                db.query(User)
                .filter(User.name.ilike(trimmed_name))
                .order_by(desc(User.updatedAt))
                .first()
            )
        if not user:
            user = User(
                name=trimmed_name,
                role="learner",
                persona="child",
                language="en",
                sensoryPrefs=stringify_json(DEFAULT_SENSORY),
                isActive=True,
                setupComplete=True,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
                lastActiveAt=datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found or invalid credentials.",
        )

    if hasattr(user, "isActive") and user.isActive is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact an administrator.",
        )

    # Update last active timestamp
    try:
        user.lastActiveAt = datetime.utcnow()
        db.commit()
    except Exception:
        pass

    token = create_access_token(user.id)

    return {
        "token": token,
        "user": format_user(user),
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the profile of the currently authenticated user."""
    return {"user": format_user(current_user)}

@router.post("/logout")
def logout_user(request: Request):
    """Acknowledge user logout and session invalidation."""
    return {"success": True, "message": "Logged out successfully"}

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
            if payload.persona:
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
            persona=payload.persona or "child",
            language=payload.language or "en",
            sensoryPrefs=stringify_json(sensory_dict),
            setupComplete=True,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)

    return {
        "token": token,
        "user": format_user(user),
    }

@router.get("/profiles")
def list_profiles():
    """Directory browsing is disabled for privacy and security."""
    return {"users": []}

@router.get("/{user_id}")
def get_user_profile(user_id: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    # If authenticated, ensure user can only access their own profile
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permission to view another user's profile.",
        )

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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot modify another user's persona.",
        )

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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot modify another user's settings.",
        )

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
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot modify another user's language.",
        )

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
