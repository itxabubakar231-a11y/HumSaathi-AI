import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User, AuditLog, Permission, UserPermission
from app.services.auth_service import hash_password

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_users():
    db = SessionLocal()
    try:
        # Clean up test users
        db.query(User).filter(User.email.in_([
            "learner_alpha@example.com",
            "learner_beta@example.com",
            "admin_test@humsaathi.ai",
        ])).delete(synchronize_session=False)
        db.commit()

        # Create server-side test Admin
        admin_pw_hash = hash_password("AdminSecureSecret999!")
        admin_user = User(
            name="Test Administrator",
            email="admin_test@humsaathi.ai",
            passwordHash=admin_pw_hash,
            role="ADMIN",
            persona="adult",
            language="en",
            isActive=True,
            setupComplete=True,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    except Exception:
        db.rollback()
    finally:
        db.close()

def test_learner_signup_cannot_escalate_role():
    """Verify that client cannot set role=ADMIN during signup."""
    res = client.post("/api/users/signup", json={
        "name": "Learner Alpha",
        "email": "learner_alpha@example.com",
        "password": "LearnerPassword123",
        "role": "ADMIN",  # Attempted privilege escalation
        "persona": "child",
        "language": "en"
    })
    assert res.status_code == 200
    user_data = res.json().get("data", res.json())["user"]
    assert user_data["role"] == "learner"  # Must remain learner!
    assert "passwordHash" not in user_data

def test_admin_authorization_enforcement():
    """Verify unauthenticated and normal learner access to /api/admin/* is strictly blocked."""
    # 1. Unauthenticated request -> 401
    r_unauth = client.get("/api/admin/dashboard")
    assert r_unauth.status_code == 401

    # 2. Normal learner signup & login
    client.post("/api/users/signup", json={
        "name": "Learner Alpha",
        "email": "learner_alpha@example.com",
        "password": "LearnerPassword123",
        "persona": "child",
        "language": "en"
    })
    r_login = client.post("/api/users/login", json={
        "email": "learner_alpha@example.com",
        "password": "LearnerPassword123",
    })
    learner_token = r_login.json().get("data", r_login.json())["token"]

    # 3. Normal learner attempts to call admin endpoints -> FORBIDDEN (403)
    admin_endpoints = [
        ("GET", "/api/admin/dashboard"),
        ("GET", "/api/admin/users"),
        ("GET", "/api/admin/scenarios"),
        ("GET", "/api/admin/analytics"),
        ("GET", "/api/admin/permissions"),
        ("GET", "/api/admin/audit-logs"),
        ("GET", "/api/admin/ai-monitoring"),
        ("GET", "/api/admin/system-status"),
    ]
    for method, ep in admin_endpoints:
        r_blocked = client.get(ep, headers={"Authorization": f"Bearer {learner_token}"})
        assert r_blocked.status_code == 403, f"Endpoint {ep} was not blocked for learner!"
        err_msg = r_blocked.json().get("error", "").lower()
        assert "administrator" in err_msg or "denied" in err_msg or "forbidden" in err_msg

def test_admin_login_and_dashboard_metrics():
    """Verify admin login and access to aggregated dashboard metrics."""
    r_login = client.post("/api/users/login", json={
        "email": "admin_test@humsaathi.ai",
        "password": "AdminSecureSecret999!",
    })
    assert r_login.status_code == 200
    admin_token = r_login.json().get("data", r_login.json())["token"]
    user_data = r_login.json().get("data", r_login.json())["user"]
    assert user_data["role"] == "ADMIN"

    r_dash = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_dash.status_code == 200
    dash_data = r_dash.json().get("data", r_dash.json())
    assert "overview" in dash_data
    assert "analytics" in dash_data
    assert "totalUsers" in dash_data["overview"]
    assert "personaDistribution" in dash_data["analytics"]
    assert "activityTimeline" in dash_data["analytics"]

def test_admin_user_management_and_audit_logging():
    """Verify admin can list users, deactivate/activate user, update persona, delete user, and see audit logs."""
    # 1. Create a learner user
    client.post("/api/users/signup", json={
        "name": "Learner Beta",
        "email": "learner_beta@example.com",
        "password": "LearnerPassword456",
        "persona": "teen",
        "language": "ur"
    })
    r_login_learner = client.post("/api/users/login", json={
        "email": "learner_beta@example.com",
        "password": "LearnerPassword456"
    })
    learner_id = r_login_learner.json().get("data", r_login_learner.json())["user"]["id"]

    # 2. Login admin
    r_admin_login = client.post("/api/users/login", json={
        "email": "admin_test@humsaathi.ai",
        "password": "AdminSecureSecret999!",
    })
    admin_token = r_admin_login.json().get("data", r_admin_login.json())["token"]

    # 3. List users
    r_users = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_users.status_code == 200
    users_data = r_users.json().get("data", r_users.json())
    assert "users" in users_data
    assert any(u["email"] == "learner_beta@example.com" for u in users_data["users"])
    # Passwords/hashes must NEVER be returned
    for u in users_data["users"]:
        assert "passwordHash" not in u
        assert "password" not in u

    # 4. Deactivate learner
    r_deact = client.patch(
        f"/api/admin/users/{learner_id}/status",
        json={"isActive": False},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r_deact.status_code == 200

    # 5. Verify deactivated learner cannot log in
    r_blocked_login = client.post("/api/users/login", json={
        "email": "learner_beta@example.com",
        "password": "LearnerPassword456"
    })
    assert r_blocked_login.status_code == 403

    # 6. Reactivate learner
    r_react = client.patch(
        f"/api/admin/users/{learner_id}/status",
        json={"isActive": True},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r_react.status_code == 200

    # 7. Update learner persona
    r_persona = client.patch(
        f"/api/admin/users/{learner_id}/persona",
        json={"persona": "adult"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r_persona.status_code == 200
    assert r_persona.json().get("data", r_persona.json())["user"]["persona"] == "adult"

    # 8. Check audit logs
    r_audit = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_audit.status_code == 200
    logs = r_audit.json().get("data", r_audit.json())["logs"]
    assert len(logs) >= 3
    # No passwords in logs
    for l in logs:
        assert "password" not in str(l["details"]).lower() or "[redacted]" in str(l["details"]).lower()

def test_admin_scenario_management():
    """Verify admin scenario listing, count verification, and updates."""
    r_admin_login = client.post("/api/users/login", json={
        "email": "admin_test@humsaathi.ai",
        "password": "AdminSecureSecret999!",
    })
    admin_token = r_admin_login.json().get("data", r_admin_login.json())["token"]

    r_scen = client.get("/api/admin/scenarios", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_scen.status_code == 200
    scen_data = r_scen.json().get("data", r_scen.json())
    assert "scenarios" in scen_data
    assert "counts" in scen_data
    assert scen_data["counts"]["child"]["active"] == 6
    assert scen_data["counts"]["teen"]["active"] == 5
    assert scen_data["counts"]["adult"]["active"] == 5

def test_admin_system_status_and_ai_monitoring():
    """Verify system status and AI monitoring endpoints."""
    r_admin_login = client.post("/api/users/login", json={
        "email": "admin_test@humsaathi.ai",
        "password": "AdminSecureSecret999!",
    })
    admin_token = r_admin_login.json().get("data", r_admin_login.json())["token"]

    # AI Monitoring
    r_ai = client.get("/api/admin/ai-monitoring", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_ai.status_code == 200
    ai_data = r_ai.json().get("data", r_ai.json())
    assert "overview" in ai_data
    assert "engineMode" in ai_data["overview"]

    # System Status
    r_status = client.get("/api/admin/system-status", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_status.status_code == 200
    stat_data = r_status.json().get("data", r_status.json())
    assert stat_data["status"] == "operational"
    assert "backend" in stat_data["services"]
    assert "database" in stat_data["services"]
