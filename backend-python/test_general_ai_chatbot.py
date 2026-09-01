import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token
from app.data.scenarios import DEFAULT_SCENARIOS

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users_to_create = [
            {"id": "user_general_child", "email": "child_ai@test.com", "name": "Ali", "persona": "child", "language": "en"},
            {"id": "user_general_teen", "email": "teen_ai@test.com", "name": "Sara", "persona": "teen", "language": "en"},
            {"id": "user_general_adult", "email": "adult_ai@test.com", "name": "Ahmed", "persona": "adult", "language": "en"},
            {"id": "user_general_ur", "email": "ur_ai@test.com", "name": "Usman", "persona": "adult", "language": "ur"},
            {"id": "user_general_rm", "email": "rm_ai@test.com", "name": "Zainab", "persona": "teen", "language": "ur_rm"},
        ]
        for u in users_to_create:
            existing = db.query(User).filter(User.id == u["id"]).first()
            if not existing:
                user = User(
                    id=u["id"],
                    email=u["email"],
                    name=u["name"],
                    passwordHash=hash_password("Password123!"),
                    persona=u["persona"],
                    language=u["language"],
                    role="learner",
                )
                db.add(user)
        db.commit()
    finally:
        db.close()

def get_auth_headers(user_id: str):
    token = create_access_token(user_id)
    return {"Authorization": f"Bearer {token}"}

def get_data(resp):
    j = resp.json()
    if isinstance(j, dict) and "data" in j and j.get("success") is not None:
        return j["data"]
    return j


def test_general_ai_scenario_listed():
    """Verify that General AI Chat scenario is present and accessible across all personas and languages."""
    res = client.get("/api/conversations/scenarios?persona=teen&language=en&include_general=true")
    assert res.status_code == 200
    data = get_data(res)
    scenarios = data.get("scenarios", [])
    gen_scen = next((s for s in scenarios if s["id"] == "scenario_general_chat"), None)
    assert gen_scen is not None
    assert "HumSaathi AI Assistant" in gen_scen["title"]

    # Also directly accessible by scenario id
    res_direct = client.get("/api/conversations/scenarios/scenario_general_chat?language=en")
    assert res_direct.status_code == 200
    direct_scen = get_data(res_direct).get("scenario", {})
    assert direct_scen.get("id") == "scenario_general_chat"



def test_general_ai_chat_what_is_ai():
    """Verify answering general knowledge question 'What is AI?'."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "What is Artificial Intelligence?",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "Artificial Intelligence" in reply or "intelligence" in reply.lower()


def test_general_ai_chat_photosynthesis():
    """Verify answering science question 'Explain photosynthesis'."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Explain photosynthesis.",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert any(w in reply.lower() for w in ["photosynthesis", "sunlight", "plants", "glucose", "oxygen"])


def test_general_ai_chat_capital_of_pakistan():
    """Verify answering geography question 'What is the capital of Pakistan?'."""
    token_headers = get_auth_headers("user_general_adult")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_adult",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_adult",
        "message": "What is the capital of Pakistan?",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "Islamabad" in reply


def test_general_ai_chat_python_reverse_string():
    """Verify coding question 'Write a Python function to reverse a string'."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Write a Python function to reverse a string.",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "def " in reply or "reverse" in reply.lower()
    assert "[::-1]" in reply


def test_general_ai_chat_ram_vs_rom():
    """Verify computer science question 'What is the difference between RAM and ROM?'."""
    token_headers = get_auth_headers("user_general_adult")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_adult",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_adult",
        "message": "What is the difference between RAM and ROM?",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "RAM" in reply and "ROM" in reply


def test_general_ai_chat_translate_how_are_you_urdu():
    """Verify translation request 'Translate How are you into Urdu'."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Translate 'How are you?' into Urdu.",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "آپ کیسے ہیں" in reply or "Aap kaise hain" in reply


def test_general_ai_chat_multiturn_context():
    """Verify multi-turn conversation context and follow-up memory."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    # Turn 1: What is Python?
    res1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "What is Python?",
        "language": "en"
    }, headers=token_headers)
    assert res1.status_code == 200

    # Turn 2: Who created it? (pronoun resolution)
    res2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Who created it?",
        "language": "en"
    }, headers=token_headers)
    assert res2.status_code == 200
    reply2 = get_data(res2)["response"]
    assert "Guido van Rossum" in reply2 or "Guido" in reply2

    # Turn 3: What did we discuss earlier?
    res3 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "What did we discuss earlier?",
        "language": "en"
    }, headers=token_headers)
    assert res3.status_code == 200
    reply3 = get_data(res3)["response"]
    assert "Python" in reply3 or "discussed" in reply3.lower()


def test_general_ai_chat_urdu_script_enforcement():
    """Verify that in Urdu mode, responses are strictly in Urdu script."""
    token_headers = get_auth_headers("user_general_ur")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_ur",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "ur"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_ur",
        "message": "اے آئی کیا ہوتا ہے؟",
        "language": "ur"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    has_ur = any('\u0600' <= c <= '\u06FF' for c in reply)
    assert has_ur is True


def test_general_ai_chat_roman_urdu_enforcement():
    """Verify that in Roman Urdu mode, responses use Latin alphabet and no Urdu script."""
    token_headers = get_auth_headers("user_general_rm")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_rm",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "ur_rm"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_rm",
        "message": "Mujhe AI simple words mein samjhao.",
        "language": "ur_rm"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    has_ur = any('\u0600' <= c <= '\u06FF' for c in reply)
    assert has_ur is False
    assert len(reply) > 10


def test_general_ai_chat_child_persona_adaptation():
    """Verify Child persona receives simple, encouraging, age-appropriate answers."""
    token_headers = get_auth_headers("user_general_child")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_child",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_child",
        "message": "What is AI?",
        "language": "en"
    }, headers=token_headers)
    assert msg_res.status_code == 200
    reply = get_data(msg_res)["response"]
    assert "robot" in reply.lower() or "smart" in reply.lower() or "helpful" in reply.lower() or "computers" in reply.lower()


def test_general_ai_chat_project_ideas_and_jokes():
    """Verify brainstorming 5 project ideas and telling a joke."""
    token_headers = get_auth_headers("user_general_teen")
    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    # 5 Project ideas
    res1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Give me 5 project ideas.",
        "language": "en"
    }, headers=token_headers)
    assert res1.status_code == 200
    assert "1." in get_data(res1)["response"] and "5." in get_data(res1)["response"]

    # Tell me a joke
    res2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_teen",
        "message": "Tell me a joke.",
        "language": "en"
    }, headers=token_headers)
    assert res2.status_code == 200
    reply2 = get_data(res2)["response"]
    assert "bugs" in reply2.lower() or "dark mode" in reply2.lower() or "😄" in reply2


def test_session_isolation_and_security():
    """Verify user cannot send messages to or view another user's conversation session."""
    token_headers_teen = get_auth_headers("user_general_teen")
    token_headers_adult = get_auth_headers("user_general_adult")

    start_res = client.post("/api/conversations/start", json={
        "userId": "user_general_teen",
        "scenarioId": "scenario_general_chat",
        "mode": "text",
        "language": "en"
    }, headers=token_headers_teen)
    assert start_res.status_code == 200
    session_id = get_data(start_res)["session"]["id"]

    # Adult tries to hijack Teen's session -> 403 Forbidden
    hijack_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": "user_general_adult",
        "message": "Hello from another user",
        "language": "en"
    }, headers=token_headers_adult)
    assert hijack_res.status_code == 403

    # Adult tries to view Teen's session -> 403 Forbidden
    view_res = client.get(f"/api/conversations/session/{session_id}", headers=token_headers_adult)
    assert view_res.status_code == 403
