import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_test_users():
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.in_(["testa@example.com", "testb@example.com", "valid1@example.com"])).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

def test_signup_validation_and_success():
    # 1. Empty name should be rejected
    r1 = client.post("/api/users/signup", json={
        "name": "",
        "email": "valid1@example.com",
        "password": "password123",
        "persona": "child",
        "language": "en"
    })
    assert r1.status_code == 400 or r1.status_code == 422

    # 2. Invalid email should be rejected
    r2 = client.post("/api/users/signup", json={
        "name": "Alex",
        "email": "invalid-email-format",
        "password": "password123",
        "persona": "child",
        "language": "en"
    })
    assert r2.status_code == 400

    # 3. Short password (< 6 chars) should be rejected
    r3 = client.post("/api/users/signup", json={
        "name": "Alex",
        "email": "short@example.com",
        "password": "123",
        "persona": "child",
        "language": "en"
    })
    assert r3.status_code == 400 or r3.status_code == 422

    # 4. Successful signup User A
    r_userA = client.post("/api/users/signup", json={
        "name": "User Alpha",
        "email": "testA@example.com",
        "password": "SecurePasswordA123",
        "persona": "teen",
        "language": "en"
    })
    assert r_userA.status_code == 200
    dataA = r_userA.json().get("data", r_userA.json())
    assert "token" in dataA
    assert "user" in dataA
    assert dataA["user"]["email"] == "testa@example.com"
    assert "passwordHash" not in dataA["user"]
    assert "password" not in dataA["user"]

    # 5. Duplicate email registration should be rejected
    r_dup = client.post("/api/users/signup", json={
        "name": "User Alpha Duplicate",
        "email": "testA@example.com",
        "password": "AnotherPassword456",
        "persona": "teen",
        "language": "en"
    })
    assert r_dup.status_code == 400
    err_msg = r_dup.json().get("error", "")
    assert "already exists" in err_msg.lower() or "log in" in err_msg.lower()

def test_password_hashing_in_database():
    # Ensure User A is signed up
    client.post("/api/users/signup", json={
        "name": "User Alpha",
        "email": "testA@example.com",
        "password": "SecurePasswordA123",
        "persona": "teen",
        "language": "en"
    })

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "testa@example.com").first()
        assert user is not None
        # Password MUST be hashed with pbkdf2
        assert user.passwordHash.startswith("pbkdf2_sha256$100000$")
        # Plain text password MUST NEVER be stored
        assert "SecurePasswordA123" not in user.passwordHash
    finally:
        db.close()

def test_login_validation_and_success():
    # Setup User A
    client.post("/api/users/signup", json={
        "name": "User Alpha",
        "email": "testA@example.com",
        "password": "SecurePasswordA123",
        "persona": "teen",
        "language": "en"
    })

    # 1. Wrong password rejected
    r_wrong = client.post("/api/users/login", json={
        "email": "testA@example.com",
        "password": "WrongPassword!"
    })
    assert r_wrong.status_code == 401

    # 2. Non-existent email rejected
    r_no_user = client.post("/api/users/login", json={
        "email": "doesnotexist@example.com",
        "password": "SomePassword123"
    })
    assert r_no_user.status_code == 401

    # 3. Correct credentials accepted
    r_ok = client.post("/api/users/login", json={
        "email": "testA@example.com",
        "password": "SecurePasswordA123"
    })
    assert r_ok.status_code == 200
    data = r_ok.json().get("data", r_ok.json())
    assert "token" in data
    assert data["user"]["name"] == "User Alpha"
    assert "passwordHash" not in data["user"]

def test_cross_user_isolation_and_anti_idor():
    # User A signup & login
    client.post("/api/users/signup", json={
        "name": "User Alpha",
        "email": "testA@example.com",
        "password": "SecurePasswordA123",
        "persona": "teen",
        "language": "en"
    })
    login_a = client.post("/api/users/login", json={
        "email": "testA@example.com",
        "password": "SecurePasswordA123"
    })
    token_a = login_a.json().get("data", login_a.json())["token"]
    user_a = login_a.json().get("data", login_a.json())["user"]

    # User B signup & login
    client.post("/api/users/signup", json={
        "name": "User Beta",
        "email": "testB@example.com",
        "password": "SecurePasswordB456",
        "persona": "adult",
        "language": "ur"
    })
    login_b = client.post("/api/users/login", json={
        "email": "testB@example.com",
        "password": "SecurePasswordB456"
    })
    token_b = login_b.json().get("data", login_b.json())["token"]
    user_b = login_b.json().get("data", login_b.json())["user"]

    # 1. User A can access User A's dashboard
    r_a_own = client.get(f"/api/dashboard/{user_a['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert r_a_own.status_code == 200

    # 2. User A ATTEMPTS to access User B's dashboard -> FORBIDDEN (403)
    r_a_to_b = client.get(f"/api/dashboard/{user_b['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert r_a_to_b.status_code == 403

    # 3. User A ATTEMPTS to access User B's progress -> FORBIDDEN (403)
    r_a_to_b_prog = client.get(f"/api/dashboard/{user_b['id']}/progress", headers={"Authorization": f"Bearer {token_a}"})
    assert r_a_to_b_prog.status_code == 403

    # 4. User A ATTEMPTS to access User B's conversation sessions -> FORBIDDEN (403)
    r_a_to_b_sess = client.get(f"/api/conversations/sessions/{user_b['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert r_a_to_b_sess.status_code == 403

    # 5. User A ATTEMPTS to modify User B's persona -> FORBIDDEN (403)
    r_a_mod_b = client.patch(f"/api/users/{user_b['id']}/persona", json={"persona": "child"}, headers={"Authorization": f"Bearer {token_a}"})
    assert r_a_mod_b.status_code == 403

    # 6. User B ATTEMPTS to access User A's profile -> FORBIDDEN (403)
    r_b_to_a_prof = client.get(f"/api/users/{user_a['id']}", headers={"Authorization": f"Bearer {token_b}"})
    assert r_b_to_a_prof.status_code == 403

    # 7. User B can access User B's own profile and /users/me
    r_b_me = client.get("/api/users/me", headers={"Authorization": f"Bearer {token_b}"})
    assert r_b_me.status_code == 200
    assert r_b_me.json().get("data", r_b_me.json())["user"]["id"] == user_b["id"]

def test_public_profiles_directory_disabled():
    r = client.get("/api/users/profiles")
    assert r.status_code == 200
    data = r.json().get("data", r.json())
    assert data["users"] == []
