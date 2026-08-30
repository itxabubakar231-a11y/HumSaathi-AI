from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.dependencies.admin import get_current_admin
from app.services.admin_service import (
    get_admin_dashboard_stats,
    list_admin_users,
    get_admin_user_detail,
    update_user_status,
    update_user_persona_admin,
    delete_user_admin,
    get_admin_scenarios,
    update_admin_scenario,
    get_permissions_overview,
    grant_user_permission,
    revoke_user_permission,
    get_audit_logs_paginated,
    get_ai_monitoring_stats,
    get_system_status,
)

router = APIRouter(prefix="/admin", tags=["Admin"])

class UserStatusUpdateRequest(BaseModel):
    isActive: bool

class UserPersonaUpdateRequest(BaseModel):
    persona: str

class ScenarioUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    aiRole: Optional[str] = None
    difficulty: Optional[str] = None
    isActive: Optional[bool] = None
    personas: Optional[List[str]] = None
    objectives: Optional[List[str]] = None

class PermissionActionRequest(BaseModel):
    userId: str
    permissionId: str

@router.get("/dashboard")
def get_dashboard(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    stats = get_admin_dashboard_stats(db)
    return stats

@router.get("/users")
def get_users(
    search: Optional[str] = Query(None),
    persona: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    result = list_admin_users(
        db, search=search, persona=persona, status=status, role=role, page=page, limit=limit
    )
    return result

@router.get("/users/{user_id}")
def get_user(
    user_id: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user_data = get_admin_user_detail(db, user_id)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": user_data}

@router.patch("/users/{user_id}/status")
def patch_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    updated = update_user_status(db, admin, user_id, payload.isActive)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": updated}

@router.patch("/users/{user_id}/persona")
def patch_user_persona(
    user_id: str,
    payload: UserPersonaUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        updated = update_user_persona_admin(db, admin, user_id, payload.persona)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return {"user": updated}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrator cannot delete their own account.")
    deleted = delete_user_admin(db, admin, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"success": True, "message": "User account deleted successfully"}

@router.get("/scenarios")
def get_scenarios(
    persona: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    data = get_admin_scenarios(db, persona=persona, difficulty=difficulty, search=search)
    return data

@router.patch("/scenarios/{scenario_id}")
def patch_scenario(
    scenario_id: str,
    payload: ScenarioUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    updated = update_admin_scenario(db, admin, scenario_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    return {"scenario": updated}

@router.get("/analytics")
def get_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    stats = get_admin_dashboard_stats(db)
    return {"analytics": stats.get("analytics", {})}

@router.get("/permissions")
def get_permissions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_permissions_overview(db)

@router.post("/permissions/grant")
def grant_permission(
    payload: PermissionActionRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        grant_user_permission(db, admin, payload.userId, payload.permissionId)
        return {"success": True, "message": "Permission granted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/permissions/revoke")
def revoke_permission(
    payload: PermissionActionRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        revoke_user_permission(db, admin, payload.userId, payload.permissionId)
        return {"success": True, "message": "Permission revoked successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    action: Optional[str] = Query(None),
    admin_email: Optional[str] = Query(None),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    data = get_audit_logs_paginated(db, page=page, limit=limit, action=action, admin_email=admin_email)
    return data

@router.get("/ai-monitoring")
def get_ai_monitoring(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_ai_monitoring_stats(db)

@router.get("/system-status")
def get_status(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_system_status(db)
