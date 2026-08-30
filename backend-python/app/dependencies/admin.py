from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserPermission
from app.dependencies.auth import get_current_user

def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """FastAPI dependency that enforces the caller is an authenticated active ADMIN."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required.",
        )

    if hasattr(current_user, "isActive") and current_user.isActive is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account has been deactivated.",
        )

    return current_user

def require_admin_permission(permission_id: str) -> Callable:
    """Dependency factory checking if the admin has a specific granted permission."""
    def _checker(
        admin: User = Depends(get_current_admin),
        db: Session = Depends(get_db),
    ) -> User:
        # Full ADMINs have universal permissions by default, but we can verify explicitly if desired
        if admin.role == "ADMIN":
            return admin

        perm = (
            db.query(UserPermission)
            .filter(
                UserPermission.userId == admin.id,
                UserPermission.permissionId == permission_id,
            )
            .first()
        )
        if not perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Missing required permission: {permission_id}",
            )
        return admin

    return _checker
