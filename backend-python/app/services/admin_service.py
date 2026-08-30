import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.models.user import User, AuditLog, Permission, UserPermission, Attempt
from app.models.conversation import CommunicationScenario, ConversationSession, ConversationEvaluation
from app.models.activity import Activity
from app.schemas.common import parse_json, stringify_json
from app.config import settings

logger = logging.getLogger("humsaathi-admin")

def log_admin_action(
    db: Session,
    admin: User,
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """Safely log an administrative action. Never logs passwords, tokens, or sensitive secrets."""
    sanitized_details = dict(details or {})
    for secret_key in ["password", "passwordHash", "token", "auth_secret", "parentPin"]:
        if secret_key in sanitized_details:
            sanitized_details[secret_key] = "[REDACTED]"

    log = AuditLog(
        adminId=admin.id if admin else "SYSTEM",
        adminEmail=admin.email if admin else "system@humsaathi.local",
        action=action,
        targetType=target_type,
        targetId=target_id,
        details=stringify_json(sanitized_details),
        createdAt=datetime.utcnow(),
    )
    db.add(log)
    try:
        db.commit()
        db.refresh(log)
    except Exception as e:
        db.rollback()
        logger.warning(f"Failed to record audit log: {e}")
    return log

def get_admin_dashboard_stats(db: Session) -> Dict[str, Any]:
    """Calculate aggregated, privacy-preserving metrics for the main Admin Dashboard."""
    # 1. User metrics
    total_users = db.query(User).count()
    child_users = db.query(User).filter(User.persona == "child").count()
    teen_users = db.query(User).filter(User.persona == "teen").count()
    adult_users = db.query(User).filter(User.persona == "adult").count()
    active_users = db.query(User).filter(User.isActive == True).count()

    # 2. Practice & session metrics
    total_sessions = db.query(ConversationSession).count()
    completed_scenarios = db.query(ConversationSession).filter(ConversationSession.completed == True).count()
    total_attempts = db.query(Attempt).count()

    # 3. Mode breakdown
    text_sessions = db.query(ConversationSession).filter(ConversationSession.mode == "text").count()
    voice_sessions = db.query(ConversationSession).filter(ConversationSession.mode == "voice").count()

    # 4. Language breakdown
    en_users = db.query(User).filter(User.language == "en").count()
    ur_users = db.query(User).filter(User.language == "ur").count()
    ur_rm_users = db.query(User).filter(User.language == "ur_rm").count()

    # 5. Average evaluation score
    avg_score_row = db.query(func.avg(ConversationEvaluation.overallScore)).first()
    avg_score = round(float(avg_score_row[0]), 1) if avg_score_row and avg_score_row[0] is not None else 0.0

    # 6. Scenario Difficulty breakdown
    easy_scenarios = db.query(CommunicationScenario).filter(CommunicationScenario.difficulty == "easy").count()
    med_scenarios = db.query(CommunicationScenario).filter(CommunicationScenario.difficulty == "medium").count()
    chal_scenarios = db.query(CommunicationScenario).filter(CommunicationScenario.difficulty == "challenging").count()

    # 7. Recent activity session timeline (Last 7 days aggregate)
    timeline_days = []
    for i in range(6, -1, -1):
        day_date = (datetime.utcnow() - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        count = (
            db.query(ConversationSession)
            .filter(ConversationSession.createdAt >= day_start, ConversationSession.createdAt <= day_end)
            .count()
        )
        timeline_days.append({
            "date": day_date.strftime("%b %d"),
            "sessions": count,
        })

    return {
        "overview": {
            "totalUsers": total_users,
            "childUsers": child_users,
            "teenUsers": teen_users,
            "adultUsers": adult_users,
            "activeUsers": active_users,
            "totalSessions": total_sessions,
            "completedScenarios": completed_scenarios,
            "totalAttempts": total_attempts,
            "averageScore": avg_score,
        },
        "analytics": {
            "personaDistribution": [
                {"name": "Child (4-12)", "value": child_users, "color": "#f59e0b"},
                {"name": "Teen (13-17)", "value": teen_users, "color": "#8b5cf6"},
                {"name": "Adult (18+)", "value": adult_users, "color": "#06b6d4"},
            ],
            "languageDistribution": [
                {"name": "English", "code": "en", "count": en_users},
                {"name": "Urdu (اردو)", "code": "ur", "count": ur_users},
                {"name": "Roman Urdu", "code": "ur_rm", "count": ur_rm_users},
            ],
            "modeDistribution": [
                {"name": "Text Practice", "count": text_sessions, "percent": round((text_sessions / total_sessions * 100) if total_sessions > 0 else 0)},
                {"name": "Voice Practice", "count": voice_sessions, "percent": round((voice_sessions / total_sessions * 100) if total_sessions > 0 else 0)},
            ],
            "difficultyDistribution": [
                {"difficulty": "Easy", "count": easy_scenarios},
                {"difficulty": "Medium", "count": med_scenarios},
                {"difficulty": "Challenging", "count": chal_scenarios},
            ],
            "activityTimeline": timeline_days,
        },
    }

def list_admin_users(
    db: Session,
    search: Optional[str] = None,
    persona: Optional[str] = None,
    status: Optional[str] = None,
    role: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> Dict[str, Any]:
    """Search and paginate users with privacy-preserving, sanitized fields."""
    query = db.query(User)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term)))

    if persona and persona != "all":
        query = query.filter(User.persona == persona)

    if role and role != "all":
        query = query.filter(User.role == role)

    if status == "active":
        query = query.filter(User.isActive == True)
    elif status == "deactivated":
        query = query.filter(User.isActive == False)

    total = query.count()
    users = (
        query.order_by(desc(User.createdAt))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    items = []
    for u in users:
        sess_count = db.query(ConversationSession).filter(ConversationSession.userId == u.id).count()
        att_count = db.query(Attempt).filter(Attempt.userId == u.id).count()
        items.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role or "learner",
            "persona": u.persona or "child",
            "language": u.language or "en",
            "isActive": getattr(u, "isActive", True),
            "createdAt": u.createdAt.isoformat() if u.createdAt else None,
            "lastActiveAt": u.lastActiveAt.isoformat() if getattr(u, "lastActiveAt", None) else (u.updatedAt.isoformat() if u.updatedAt else None),
            "sessionCount": sess_count,
            "attemptCount": att_count,
        })

    return {
        "users": items,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if limit > 0 else 1,
        },
    }

def get_admin_user_detail(db: Session, user_id: str) -> Optional[Dict[str, Any]]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    sess_count = db.query(ConversationSession).filter(ConversationSession.userId == user.id).count()
    completed_sess = db.query(ConversationSession).filter(ConversationSession.userId == user.id, ConversationSession.completed == True).count()
    att_count = db.query(Attempt).filter(Attempt.userId == user.id).count()

    # Calculate real average score from user's attempts and evaluations
    scores = []
    attempts = db.query(Attempt).filter(Attempt.userId == user.id).all()
    for a in attempts:
        if a.score is not None:
            scores.append(float(a.score))

    evals = db.query(ConversationEvaluation).join(
        ConversationSession, ConversationEvaluation.sessionId == ConversationSession.id
    ).filter(ConversationSession.userId == user.id).all()
    for e in evals:
        if e.overallScore is not None:
            scores.append(float(e.overallScore))

    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    # Retrieve real recent activity records
    recent_items = []
    for a in db.query(Attempt).filter(Attempt.userId == user.id).order_by(desc(Attempt.createdAt)).limit(5).all():
        recent_items.append({
            "type": "activity_attempt",
            "title": f"Practice Activity ({a.activityId or 'General'})",
            "score": a.score,
            "timestamp": a.createdAt.isoformat() if a.createdAt else None,
        })
    for s in db.query(ConversationSession).filter(ConversationSession.userId == user.id).order_by(desc(ConversationSession.createdAt)).limit(5).all():
        recent_items.append({
            "type": "practice_scenario",
            "title": f"Scenario Session ({s.scenarioId})",
            "completed": s.completed,
            "turns": s.turnCount,
            "timestamp": s.createdAt.isoformat() if s.createdAt else None,
        })
    recent_items.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role or "learner",
        "persona": user.persona or "child",
        "language": user.language or "en",
        "isActive": getattr(user, "isActive", True),
        "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        "updatedAt": user.updatedAt.isoformat() if user.updatedAt else None,
        "lastActiveAt": user.lastActiveAt.isoformat() if getattr(user, "lastActiveAt", None) else (user.updatedAt.isoformat() if user.updatedAt else None),
        "sessionCount": sess_count,
        "completedSessions": completed_sess,
        "attemptCount": att_count,
        "averageScore": avg_score,
        "recentActivity": recent_items[:10],
        "sensoryPrefs": parse_json(user.sensoryPrefs, {}),
    }

def update_user_status(db: Session, admin: User, user_id: str, is_active: bool) -> Optional[Dict[str, Any]]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user.isActive = is_active
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    action_label = "activate_user" if is_active else "deactivate_user"
    log_admin_action(
        db, admin, action_label, target_type="user", target_id=user.id,
        details={"userName": user.name, "userEmail": user.email, "isActive": is_active}
    )

    return get_admin_user_detail(db, user.id)

def update_user_persona_admin(db: Session, admin: User, user_id: str, persona: str) -> Optional[Dict[str, Any]]:
    if persona not in ["child", "teen", "adult"]:
        raise ValueError("Invalid persona. Must be child, teen, or adult.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    old_persona = user.persona
    user.persona = persona
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    log_admin_action(
        db, admin, "change_user_persona", target_type="user", target_id=user.id,
        details={"userName": user.name, "oldPersona": old_persona, "newPersona": persona}
    )

    return get_admin_user_detail(db, user.id)

def delete_user_admin(db: Session, admin: User, user_id: str) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    user_info = {"id": user.id, "name": user.name, "email": user.email}
    db.delete(user)
    db.commit()

    log_admin_action(
        db, admin, "delete_user", target_type="user", target_id=user_id,
        details=user_info
    )
    return True

def get_admin_scenarios(
    db: Session,
    persona: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    """List all scenarios for admin management, along with demo scenario count checks."""
    query = db.query(CommunicationScenario)

    if difficulty and difficulty != "all":
        query = query.filter(CommunicationScenario.difficulty == difficulty)

    all_scenarios = query.order_by(CommunicationScenario.id).all()

    # Calculate active counts by persona
    child_count = 0
    teen_count = 0
    adult_count = 0

    results = []
    for s in all_scenarios:
        personas_list = parse_json(s.personas, [])
        if s.isActive:
            if "child" in personas_list:
                child_count += 1
            if "teen" in personas_list:
                teen_count += 1
            if "adult" in personas_list:
                adult_count += 1

        if persona and persona != "all" and persona not in personas_list:
            continue

        if search and search.strip():
            term = search.strip().lower()
            if term not in s.title.lower() and term not in s.id.lower() and term not in s.description.lower():
                continue

        sess_count = db.query(ConversationSession).filter(ConversationSession.scenarioId == s.id).count()

        results.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "aiRole": s.aiRole,
            "personas": personas_list,
            "languages": parse_json(s.languages, ["en", "ur", "ur_rm"]),
            "difficulty": s.difficulty,
            "objectives": parse_json(s.objectives, []),
            "context": s.context,
            "initialPrompt": parse_json(s.initialPrompt, {}),
            "isActive": s.isActive,
            "sessionCount": sess_count,
            "createdAt": s.createdAt.isoformat() if s.createdAt else None,
            "updatedAt": s.updatedAt.isoformat() if s.updatedAt else None,
        })

    # Validate demo target counts
    warnings = []
    if child_count != 6:
        warnings.append(f"Child portal currently has {child_count} active scenarios (Standard demo requires exactly 6).")
    if teen_count != 5:
        warnings.append(f"Teen portal currently has {teen_count} active scenarios (Standard demo requires exactly 5).")
    if adult_count != 5:
        warnings.append(f"Adult portal currently has {adult_count} active scenarios (Standard demo requires exactly 5).")

    return {
        "scenarios": results,
        "counts": {
            "child": {"active": child_count, "required": 6},
            "teen": {"active": teen_count, "required": 5},
            "adult": {"active": adult_count, "required": 5},
        },
        "warnings": warnings,
    }

def update_admin_scenario(db: Session, admin: User, scenario_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    scen = db.query(CommunicationScenario).filter(CommunicationScenario.id == scenario_id).first()
    if not scen:
        return None

    if "title" in payload and payload["title"]:
        scen.title = payload["title"]
    if "description" in payload and payload["description"]:
        scen.description = payload["description"]
    if "aiRole" in payload and payload["aiRole"]:
        scen.aiRole = payload["aiRole"]
    if "difficulty" in payload and payload["difficulty"]:
        scen.difficulty = payload["difficulty"]
    if "isActive" in payload:
        scen.isActive = bool(payload["isActive"])
    if "personas" in payload:
        scen.personas = stringify_json(payload["personas"])
    if "objectives" in payload:
        scen.objectives = stringify_json(payload["objectives"])

    scen.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(scen)

    log_admin_action(
        db, admin, "update_scenario", target_type="scenario", target_id=scenario_id,
        details={"title": scen.title, "isActive": scen.isActive, "difficulty": scen.difficulty}
    )

    return {
        "id": scen.id,
        "title": scen.title,
        "description": scen.description,
        "aiRole": scen.aiRole,
        "personas": parse_json(scen.personas, []),
        "difficulty": scen.difficulty,
        "isActive": scen.isActive,
    }

def get_permissions_overview(db: Session) -> Dict[str, Any]:
    """Retrieve all standard permissions and admin permission assignments."""
    all_perms = db.query(Permission).all()
    admins = db.query(User).filter(User.role == "ADMIN").all()

    admin_list = []
    for adm in admins:
        user_perms = db.query(UserPermission).filter(UserPermission.userId == adm.id).all()
        admin_list.append({
            "id": adm.id,
            "name": adm.name,
            "email": adm.email,
            "isActive": getattr(adm, "isActive", True),
            "grantedPermissions": [p.permissionId for p in user_perms],
        })

    return {
        "permissions": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
            }
            for p in all_perms
        ],
        "admins": admin_list,
    }

def grant_user_permission(db: Session, admin: User, target_user_id: str, permission_id: str) -> bool:
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target or target.role != "ADMIN":
        raise ValueError("Permissions can only be assigned to Admin accounts.")

    existing = (
        db.query(UserPermission)
        .filter(UserPermission.userId == target_user_id, UserPermission.permissionId == permission_id)
        .first()
    )
    if not existing:
        db.add(UserPermission(
            userId=target_user_id,
            permissionId=permission_id,
            grantedBy=admin.email,
            grantedAt=datetime.utcnow(),
        ))
        db.commit()

        log_admin_action(
            db, admin, "grant_permission", target_type="permission", target_id=permission_id,
            details={"targetUserEmail": target.email, "permissionId": permission_id}
        )
    return True

def revoke_user_permission(db: Session, admin: User, target_user_id: str, permission_id: str) -> bool:
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        return False

    perm = (
        db.query(UserPermission)
        .filter(UserPermission.userId == target_user_id, UserPermission.permissionId == permission_id)
        .first()
    )
    if perm:
        db.delete(perm)
        db.commit()

        log_admin_action(
            db, admin, "revoke_permission", target_type="permission", target_id=permission_id,
            details={"targetUserEmail": target.email, "permissionId": permission_id}
        )
    return True

def get_audit_logs_paginated(
    db: Session,
    page: int = 1,
    limit: int = 15,
    action: Optional[str] = None,
    admin_email: Optional[str] = None,
) -> Dict[str, Any]:
    """Retrieve chronological audit logs for administrative actions."""
    query = db.query(AuditLog)

    if action and action != "all":
        query = query.filter(AuditLog.action == action)

    if admin_email and admin_email.strip():
        query = query.filter(AuditLog.adminEmail.ilike(f"%{admin_email.strip()}%"))

    total = query.count()
    logs = (
        query.order_by(desc(AuditLog.createdAt))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "logs": [
            {
                "id": l.id,
                "adminId": l.adminId,
                "adminEmail": l.adminEmail,
                "action": l.action,
                "targetType": l.targetType,
                "targetId": l.targetId,
                "details": parse_json(l.details, {}),
                "createdAt": l.createdAt.isoformat() if l.createdAt else None,
            }
            for l in logs
        ],
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if limit > 0 else 1,
        },
    }

def get_ai_monitoring_stats(db: Session) -> Dict[str, Any]:
    """Aggregate AI engine health, session metrics, response modes, and evaluations."""
    total_sessions = db.query(ConversationSession).count()
    text_sessions = db.query(ConversationSession).filter(ConversationSession.mode == "text").count()
    voice_sessions = db.query(ConversationSession).filter(ConversationSession.mode == "voice").count()

    total_evals = db.query(ConversationEvaluation).count()
    avg_score_row = db.query(func.avg(ConversationEvaluation.overallScore)).first()
    avg_clarity = db.query(func.avg(ConversationEvaluation.clarity)).first()
    avg_relevance = db.query(func.avg(ConversationEvaluation.relevance)).first()
    avg_flow = db.query(func.avg(ConversationEvaluation.conversationFlow)).first()

    avg_score = round(float(avg_score_row[0]), 1) if avg_score_row and avg_score_row[0] is not None else 0.0
    clarity_score = round(float(avg_clarity[0]), 1) if avg_clarity and avg_clarity[0] is not None else 0.0
    relevance_score = round(float(avg_relevance[0]), 1) if avg_relevance and avg_relevance[0] is not None else 0.0
    flow_score = round(float(avg_flow[0]), 1) if avg_flow and avg_flow[0] is not None else 0.0

    # Total conversation turns across all sessions
    total_turns_row = db.query(func.sum(ConversationSession.turnCount)).first()
    total_turns = int(total_turns_row[0]) if total_turns_row and total_turns_row[0] is not None else 0

    return {
        "overview": {
            "totalSessions": total_sessions,
            "totalTurns": total_turns,
            "averageTurnsPerSession": round((total_turns / total_sessions), 1) if total_sessions > 0 else 0,
            "totalEvaluations": total_evals,
            "averageOverallScore": avg_score,
            "aiModel": settings.AI_MODEL,
            "aiAvailable": bool(settings.AI_API_KEY),
            "engineMode": "gemini-live" if settings.AI_API_KEY else "rules_fallback",
        },
        "evaluationBreakdown": {
            "clarity": clarity_score,
            "relevance": relevance_score,
            "conversationFlow": flow_score,
            "overall": avg_score,
        },
        "modeComparison": [
            {"mode": "Text Practice", "count": text_sessions, "percent": round((text_sessions / total_sessions * 100) if total_sessions > 0 else 0)},
            {"mode": "Voice Practice", "count": voice_sessions, "percent": round((voice_sessions / total_sessions * 100) if total_sessions > 0 else 0)},
        ],
    }

def get_system_status(db: Session) -> Dict[str, Any]:
    """Check status of backend, database, and AI service components."""
    # Test DB
    db_status = "healthy"
    try:
        db.execute(func.now())
    except Exception:
        db_status = "unreachable"

    ai_status = "active" if settings.AI_API_KEY else "fallback_active"

    return {
        "status": "operational" if db_status == "healthy" else "degraded",
        "services": {
            "backend": {"status": "operational", "version": "1.1.0", "framework": "FastAPI"},
            "database": {"status": db_status, "driver": settings.clean_database_url.split(":")[0]},
            "aiService": {
                "status": ai_status,
                "mode": "gemini" if settings.AI_API_KEY else "rules_fallback",
                "model": settings.AI_MODEL,
            },
            "frontend": {"status": "operational", "client": "Vite + React"},
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
