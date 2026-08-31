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

def create_test_persona_user(db, persona="teen", language="en"):
    unique_id = str(uuid.uuid4())[:8]
    email = f"demo_{persona}_{unique_id}@test.com"
    user = User(
        id=f"user_{persona}_{unique_id}",
        email=email,
        name=f"Demo {persona.title()}",
        passwordHash=hash_password("DemoPassword123!"),
        role="learner",
        persona=persona,
        language=language,
        sensoryPrefs='{"calmMode": true, "reducedMotion": false}',
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

def test_child_demo_scenario_flow(db_session):
    """Verifies the Child demo scenario (scenario_teacher_help) through a complete multi-turn flow."""
    user, token = create_test_persona_user(db_session, persona="child", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Session
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_teacher_help", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    data = get_data(start_resp)
    session_id = data["session"]["id"]
    assert data["session"]["turnCount"] == 0

    # 2. Turn 1: Quick Response Option (opt_th_1)
    msg1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Excuse me, Teacher. Could you please help me understand question number 2?"},
        headers=headers,
    )
    assert msg1_resp.status_code == 200
    r1 = get_data(msg1_resp)
    assert r1["session"]["turnCount"] == 1
    assert len(r1["response"]) > 5

    # 3. Turn 2: Stating confusion / hesitation
    msg2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I don't understand this."},
        headers=headers,
    )
    assert msg2_resp.status_code == 200
    r2 = get_data(msg2_resp)
    assert r2["session"]["turnCount"] == 2
    assert any(w in r2["response"].lower() for w in ["part", "question", "confusing", "look", "help"])

    # 4. Turn 3: Voice input transcript (Question 3)
    msg3_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Question 3."},
        headers=headers,
    )
    assert msg3_resp.status_code == 200
    r3 = get_data(msg3_resp)
    assert r3["session"]["turnCount"] == 3
    assert any(w in r3["response"].lower() for w in ["question 3", "together", "help", "look", "step"])

    # 5. Turn 4: Next step inquiry
    msg4_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "How do I start the first step?"},
        headers=headers,
    )
    assert msg4_resp.status_code == 200
    r4 = get_data(msg4_resp)
    assert r4["session"]["turnCount"] == 4

    # 6. End Session & Generate Evaluation
    end_resp = client.post(f"/api/conversations/{session_id}/end", headers=headers)
    assert end_resp.status_code == 200

    eval_resp = client.post(
        "/api/evaluations/conversation",
        json={"sessionId": session_id},
        headers=headers,
    )
    assert eval_resp.status_code == 200
    eval_data = get_data(eval_resp)["evaluation"]
    assert "overallScore" in eval_data
    assert "clarity" in eval_data
    assert eval_data["overallScore"] >= 50

def test_teen_demo_scenario_flow(db_session):
    """Verifies the Teen demo scenario (scenario_group_discussion) with social & hesitant interaction."""
    user, token = create_test_persona_user(db_session, persona="teen", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Session
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    # 2. Turn 1: Quick Response Option (opt_gd_1)
    msg1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Thanks! I'd love to join. Which topic or chapter are you guys focusing on first?"},
        headers=headers,
    )
    assert msg1_resp.status_code == 200
    r1 = get_data(msg1_resp)
    assert r1["session"]["turnCount"] == 1

    # 3. Turn 2: Presentation Contribution
    msg2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I can help with the presentation."},
        headers=headers,
    )
    assert msg2_resp.status_code == 200
    r2 = get_data(msg2_resp)
    assert r2["session"]["turnCount"] == 2
    assert any(w in r2["response"].lower() for w in ["slide", "visual", "organize", "point", "presentation", "awesome"])

    # 4. Turn 3: Multi-turn memory continuation (Made slides before)
    msg3_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I've made slides before for science class."},
        headers=headers,
    )
    assert msg3_resp.status_code == 200
    r3 = get_data(msg3_resp)
    assert r3["session"]["turnCount"] == 3
    assert any(w in r3["response"].lower() for w in ["share", "notes", "slides", "document", "great", "organizing"])

    # 5. Turn 4: Hesitant / Scaffolding response
    msg4_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I'm not sure what I should do."},
        headers=headers,
    )
    assert msg4_resp.status_code == 200
    r4 = get_data(msg4_resp)
    assert r4["session"]["turnCount"] == 4
    assert any(w in r4["response"].lower() for w in ["problem", "look up", "facts", "notes", "ancient", "better"])

    # 6. Turn 5: Voice transcript low pressure (Can I just listen first?)
    msg5_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Can I just listen first?"},
        headers=headers,
    )
    assert msg5_resp.status_code == 200
    r5 = get_data(msg5_resp)
    assert r5["session"]["turnCount"] == 5
    assert any(w in r5["response"].lower() for w in ["course", "time", "chair", "listen", "brainstorm", "welcome"])

    # 7. Evaluate
    client.post(f"/api/conversations/{session_id}/end", headers=headers)
    eval_resp = client.post(
        "/api/evaluations/conversation",
        json={"sessionId": session_id},
        headers=headers,
    )
    assert eval_resp.status_code == 200
    eval_data = get_data(eval_resp)["evaluation"]
    assert eval_data["overallScore"] >= 60

def test_adult_demo_scenario_flow(db_session):
    """Verifies the Adult demo scenario (scenario_manager_clarification) with professional workplace flow."""
    user, token = create_test_persona_user(db_session, persona="adult", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Session
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_manager_clarification", "mode": "text"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    # 2. Turn 1: Professional Clarification Request
    msg1_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I'm not completely sure what you need me to do on this project."},
        headers=headers,
    )
    assert msg1_resp.status_code == 200
    r1 = get_data(msg1_resp)
    assert r1["session"]["turnCount"] == 1
    assert any(w in r1["response"].lower() for w in ["deliverable", "summary", "metrics", "charts", "review", "morning"])

    # 3. Turn 2: Specific priority question about the report
    msg2_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Should I finish the report today?"},
        headers=headers,
    )
    assert msg2_resp.status_code == 200
    r2 = get_data(msg2_resp)
    assert r2["session"]["turnCount"] == 2
    assert any(w in r2["response"].lower() for w in ["prioritize", "executive", "summary", "financial", "tomorrow", "clarity"])

    # 4. Turn 3: Requesting time for data analysis
    msg3_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "I also need more time for the data analysis."},
        headers=headers,
    )
    assert msg3_resp.status_code == 200
    r3 = get_data(msg3_resp)
    assert r3["session"]["turnCount"] == 3
    assert any(w in r3["response"].lower() for w in ["reasonable", "thursday", "noon", "timeline", "data"])

    # 5. Turn 4: Confirmation and conclusion
    msg4_resp = client.post(
        f"/api/conversations/{session_id}/message",
        json={"message": "Thank you, I will send the executive summary by 5 PM."},
        headers=headers,
    )
    assert msg4_resp.status_code == 200
    r4 = get_data(msg4_resp)
    assert r4["session"]["turnCount"] == 4
    assert any(w in r4["response"].lower() for w in ["excellent", "productive", "reach out", "day", "ping"])

    # 6. Evaluate
    client.post(f"/api/conversations/{session_id}/end", headers=headers)
    eval_resp = client.post(
        "/api/evaluations/conversation",
        json={"sessionId": session_id},
        headers=headers,
    )
    assert eval_resp.status_code == 200
    eval_data = get_data(eval_resp)["evaluation"]
    assert eval_data["overallScore"] >= 70

def test_trilingual_demo_scenarios(db_session):
    """Verifies that demo scenarios execute seamlessly across English, Urdu script, and Roman Urdu."""
    # Urdu Child
    user_ur, token_ur = create_test_persona_user(db_session, persona="child", language="ur")
    resp_ur = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_teacher_help", "mode": "text"},
        headers={"Authorization": f"Bearer {token_ur}"},
    )
    assert resp_ur.status_code == 200
    s_ur = get_data(resp_ur)["session"]["id"]
    m_ur = client.post(
        f"/api/conversations/{s_ur}/message",
        json={"message": "کیا آپ سوال نمبر 2 سمجھنے میں میری مدد کر سکتے ہیں؟"},
        headers={"Authorization": f"Bearer {token_ur}"},
    )
    assert m_ur.status_code == 200
    # Urdu script presence
    assert any('\u0600' <= c <= '\u06FF' for c in get_data(m_ur)["response"])

    # Roman Urdu Teen
    user_rm, token_rm = create_test_persona_user(db_session, persona="teen", language="ur_rm")
    resp_rm = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text"},
        headers={"Authorization": f"Bearer {token_rm}"},
    )
    assert resp_rm.status_code == 200
    s_rm = get_data(resp_rm)["session"]["id"]
    m_rm = client.post(
        f"/api/conversations/{s_rm}/message",
        json={"message": "Main research aur presentation mein help kar sakta hoon."},
        headers={"Authorization": f"Bearer {token_rm}"},
    )
    assert m_rm.status_code == 200
    assert len(get_data(m_rm)["response"]) > 10

