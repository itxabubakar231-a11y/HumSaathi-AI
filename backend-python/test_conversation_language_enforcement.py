import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_test_user(db, persona="child", language="en"):
    unique_id = str(uuid.uuid4())[:8]
    email = f"lang_test_{unique_id}@test.com"
    user = User(
        id=f"user_lang_{unique_id}",
        email=email,
        name=f"Lang Test User",
        passwordHash=hash_password("Password123!"),
        role="learner",
        persona=persona,
        language=language,
        sensoryPrefs='{"calmMode": false, "reducedMotion": false}',
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return user, token

def get_data(resp):
    j = resp.json()
    if isinstance(j, dict) and "data" in j and j.get("success") is not None:
        return j["data"]
    return j

def has_urdu_script(text: str) -> bool:
    return any('\u0600' <= c <= '\u06FF' for c in (text or ''))

def test_urdu_script_multi_turn_enforcement(db_session):
    """Verifies that Urdu mode (ur) outputs natural Urdu script across multiple conversation turns."""
    user, token = create_test_user(db_session, persona="child", language="ur")
    headers = {"Authorization": f"Bearer {token}"}

    # Start Session in Urdu
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_teacher_help", "mode": "text", "language": "ur"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    sess = get_data(start_resp)["session"]
    session_id = sess["id"]
    assert sess["language"] == "ur"
    assert has_urdu_script(sess["transcript"][0]["content"])

    # Turn 1: Urdu user message
    t1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "مجھے یہ سوال سمجھ نہیں آ رہا۔", "language": "ur"},
        headers=headers,
    )
    assert t1_resp.status_code == 200
    r1 = get_data(t1_resp)["response"]
    assert has_urdu_script(r1), f"Expected Urdu script response, got: {r1}"

    # Turn 2: User mentions English loanword inside Urdu
    t2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "کیا آپ سوال نمبر 3 کا پہلا step سمجھا سکتے ہیں؟", "language": "ur"},
        headers=headers,
    )
    assert t2_resp.status_code == 200
    r2 = get_data(t2_resp)["response"]
    assert has_urdu_script(r2), f"Expected Urdu script response on Turn 2, got: {r2}"

def test_roman_urdu_multi_turn_enforcement(db_session):
    """Verifies that Roman Urdu mode (ur_rm) outputs Latin script without Urdu Unicode characters."""
    user, token = create_test_user(db_session, persona="teen", language="ur_rm")
    headers = {"Authorization": f"Bearer {token}"}

    # Start Session in Roman Urdu
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "ur_rm"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    sess = get_data(start_resp)["session"]
    session_id = sess["id"]
    assert sess["language"] == "ur_rm"
    assert not has_urdu_script(sess["transcript"][0]["content"])

    # Turn 1: Teen Roman Urdu
    t1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Hi, main aap logon ke group mein join ho sakta hoon?", "language": "ur_rm"},
        headers=headers,
    )
    assert t1_resp.status_code == 200
    r1 = get_data(t1_resp)["response"]
    assert not has_urdu_script(r1), f"Roman Urdu response must not contain Urdu script: {r1}"
    assert len(r1.strip()) > 5

    # Turn 2: Follow-up in Roman Urdu
    t2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Main presentation slides design karne mein help kar sakta hoon.", "language": "ur_rm"},
        headers=headers,
    )
    assert t2_resp.status_code == 200
    r2 = get_data(t2_resp)["response"]
    assert not has_urdu_script(r2), f"Roman Urdu response must not contain Urdu script: {r2}"

def test_adult_manager_clarification_urdu_script(db_session):
    """Verifies Adult Manager Clarification scenario responds in authentic Urdu script."""
    user, token = create_test_user(db_session, persona="adult", language="ur")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_manager_clarification", "mode": "text", "language": "ur"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    sess = get_data(start_resp)["session"]
    session_id = sess["id"]

    # Turn 1: Manager Clarification in Urdu
    t1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "مجھے پوری طرح واضح نہیں ہے کہ مجھے کیا کرنا ہے۔", "language": "ur"},
        headers=headers,
    )
    assert t1_resp.status_code == 200
    r1 = get_data(t1_resp)["response"]
    assert has_urdu_script(r1), f"Expected Urdu script from Manager, got: {r1}"
    assert any(w in r1 for w in ["رپورٹ", "سمری", "خلاصہ", "وضاحت", "نتائج", "کام"])

def test_mid_session_language_switching(db_session):
    """Verifies that changing language mid-session immediately updates the AI response language."""
    user, token = create_test_user(db_session, persona="adult", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # Start in English
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_manager_clarification", "mode": "text", "language": "en"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    # Turn 1: English
    t1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I am not sure what you need me to do.", "language": "en"},
        headers=headers,
    )
    assert t1_resp.status_code == 200
    r1 = get_data(t1_resp)["response"]
    assert not has_urdu_script(r1)

    # Turn 2: Switch to Urdu (ur)
    t2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "کیا میں یہ رپورٹ آج ختم کروں؟", "language": "ur"},
        headers=headers,
    )
    assert t2_resp.status_code == 200
    r2 = get_data(t2_resp)["response"]
    assert has_urdu_script(r2), f"Expected Urdu response after language switch, got: {r2}"

    # Turn 3: Switch to Roman Urdu (ur_rm)
    t3_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Data analysis ke liye mujhe mazeed time chahiye.", "language": "ur_rm"},
        headers=headers,
    )
    assert t3_resp.status_code == 200
    r3 = get_data(t3_resp)["response"]
    assert not has_urdu_script(r3), f"Expected Roman Urdu response after second switch, got: {r3}"
