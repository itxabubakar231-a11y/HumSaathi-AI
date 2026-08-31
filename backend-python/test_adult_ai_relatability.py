import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.conversation import ConversationSession, ConversationEvaluation
from app.services.auth_service import hash_password, create_access_token

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_test_adult_user(db, language="en"):
    unique_id = str(uuid.uuid4())[:8]
    email = f"adult_relatability_{unique_id}@test.com"
    user = User(
        id=f"user_adult_{unique_id}",
        email=email,
        name=f"Demo Adult",
        passwordHash=hash_password("AdultPassword123!"),
        role="learner",
        persona="adult",
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

def assert_no_generic_praise(response_text: str):
    clean = response_text.lower()
    banned = [
        "great job", "good job", "keep practicing",
        "let's improve your communication skills",
        "that's correct", "that is the correct answer",
        "that's a great response", "keep trying your best",
        "as an ai", "i am an ai"
    ]
    for b in banned:
        assert b not in clean, f"Found generic praise or meta phrase '{b}' in response: {response_text}"

def test_adult_manager_clarification_5_turn_flow(db_session):
    """Verifies the exact 5-turn Manager Clarification flow requested for real-world workplace realism."""
    user, token = create_test_adult_user(db_session, language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Session
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_manager_clarification", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    # 2. Turn 1: Uncertainty / Clarification Request
    t1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I'm not completely sure what you need me to do."},
        headers=headers,
    )
    assert t1_resp.status_code == 200
    r1 = get_data(t1_resp)["response"]
    assert_no_generic_praise(r1)
    # Must clarify task (e.g. client report / key findings / summary / priority)
    assert any(w in r1.lower() for w in ["report", "summary", "finding", "priority", "clarify", "task", "deliverable"])

    # 3. Turn 2: Deadline Question
    t2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Should I finish the report today?"},
        headers=headers,
    )
    assert t2_resp.status_code == 200
    r2 = get_data(t2_resp)["response"]
    assert_no_generic_praise(r2)
    # Must address the deadline specifically
    assert any(w in r2.lower() for w in ["today", "deadline", "end of day", "timeline", "priority", "tomorrow", "summary"])

    # 4. Turn 3: Time Constraint on Data
    t3_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I also need more time for the data."},
        headers=headers,
    )
    assert t3_resp.status_code == 200
    r3 = get_data(t3_resp)["response"]
    assert_no_generic_praise(r3)
    # Must address data time and propose a solution
    assert any(w in r3.lower() for w in ["time", "data", "additional", "prioritize", "adjust", "thursday", "timeline", "schedule"])

    # 5. Turn 4: Realistic Compromise (Summary today, data tomorrow)
    t4_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I think I can finish the summary today, but the data may take until tomorrow."},
        headers=headers,
    )
    assert t4_resp.status_code == 200
    r4 = get_data(t4_resp)["response"]
    assert_no_generic_praise(r4)
    # Must accept compromise and confirm next steps
    assert any(w in r4.lower() for w in ["works", "send", "summary", "tomorrow", "data", "review", "morning", "perfect", "good"])

    # 6. Turn 5: Unexpected Input / Mistake Concern
    t5_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I'm worried I'll make a mistake."},
        headers=headers,
    )
    assert t5_resp.status_code == 200
    r5 = get_data(t5_resp)["response"]
    assert_no_generic_praise(r5)
    # Must provide professional workplace reassurance without therapy speech
    assert any(w in r5.lower() for w in ["draft", "review", "understandable", "figures", "numbers", "finalize", "together", "look"])

    # 7. End Session and Evaluate
    end_resp = client.post(f"/api/conversations/{session_id}/end", headers=headers)
    assert end_resp.status_code == 200

    eval_resp = client.post(
        "/api/evaluations/conversation",
        json={"sessionId": session_id},
        headers=headers,
    )
    assert eval_resp.status_code == 200
    eval_data = get_data(eval_resp)["evaluation"]
    assert eval_data["overallScore"] >= 70

def test_adult_customer_support_flow(db_session):
    """Verifies Adult customer support scenario (scenario_adult_customer_support) handles duplicate billing."""
    user, token = create_test_adult_user(db_session, language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_adult_customer_support", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    msg_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Hello, I was charged twice for the same order on invoice FN-8821."},
        headers=headers,
    )
    assert msg_resp.status_code == 200
    r = get_data(msg_resp)["response"]
    assert_no_generic_praise(r)
    assert any(w in r.lower() for w in ["fn-8821", "account", "credit", "adjustment", "charge", "1,500", "1500", "invoice"])

def test_adult_colleague_shift_flow(db_session):
    """Verifies Adult shift swap scenario (scenario_adult_colleague_shift)."""
    user, token = create_test_adult_user(db_session, language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_adult_colleague_shift", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    msg_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Can we swap my Thursday shift for your Friday shift? I have a medical appointment."},
        headers=headers,
    )
    assert msg_resp.status_code == 200
    r = get_data(msg_resp)["response"]
    assert_no_generic_praise(r)
    assert any(w in r.lower() for w in ["friday", "thursday", "swap", "shift", "appointment", "supervisor", "cover"])

def test_adult_doctor_appointment_flow(db_session):
    """Verifies Adult doctor appointment scenario (scenario_adult_doctor_appointment)."""
    user, token = create_test_adult_user(db_session, language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_adult_doctor_appointment", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    msg_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I need to move my appointment with Dr. Malik to next week."},
        headers=headers,
    )
    assert msg_resp.status_code == 200
    r = get_data(msg_resp)["response"]
    assert_no_generic_praise(r)
    assert any(w in r.lower() for w in ["next week", "tuesday", "thursday", "appointment", "dr. malik", "dr malik", "available", "time"])

def test_adult_pharmacy_flow(db_session):
    """Verifies Adult pharmacy scenario (scenario_adult_pharmacy)."""
    user, token = create_test_adult_user(db_session, language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_adult_pharmacy", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    msg_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Should I take this medication before or after meals?"},
        headers=headers,
    )
    assert msg_resp.status_code == 200
    r = get_data(msg_resp)["response"]
    assert_no_generic_praise(r)
    assert any(w in r.lower() for w in ["after meals", "meals", "tablet", "water", "food", "stomach", "twice"])
