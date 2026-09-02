from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import decode_access_token

def extract_token_from_request(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency that requires an authenticated user via Bearer token."""
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Dependency that returns the authenticated user if valid token exists, otherwise None."""
    token = extract_token_from_request(request)
    if not token:
        return None

    user_id = decode_access_token(token)
    if not user_id:
        return None

    return db.query(User).filter(User.id == user_id).first()
