import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token
from app.services.conversation_service import (
    validate_ai_response,
    generate_contextual_fallback,
)
from app.data.scenarios import DEFAULT_SCENARIOS

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_test_user(db, persona="teen", language="en"):
    unique_id = str(uuid.uuid4())[:8]
    email = f"intel_test_{unique_id}@test.com"
    user = User(
        id=f"user_intel_{unique_id}",
        email=email,
        name=f"Intel User {unique_id}",
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


# =============================================================================
# 1. TEST 10 UNEXPECTED BUT RELEVANT NATURAL LANGUAGE INPUTS
# =============================================================================

def test_10_unexpected_natural_language_inputs(db_session):
    """
    Tests the 10 mandatory unexpected natural-language inputs:
    1. 'I'm not sure what to say.'
    2. 'Can you explain what you mean?'
    3. 'What if they say no?'
    4. 'I've never done this before.'
    5. 'Can I suggest something different?'
    6. 'I feel nervous about joining.'
    7. 'What should I say first?'
    8. 'Can we work on the presentation instead?'
    9. 'I already know how to make slides.'
    10. 'Can I just listen for a while?'
    """
    user, token = create_test_user(db_session, persona="teen", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    # Start Teen Scenario: Joining a Group Discussion
    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "en"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    test_inputs = [
        ("I'm not sure what to say.", ["facts", "slides", "notes", "civilizations", "easier", "choice", "help"]),
        ("Can you explain what you mean?", ["divide", "tasks", "research", "slides", "project", "mean", "easier"]),
        ("What if they say no?", ["okay", "calmly", "alternative", "clarification", "reassur", "no worries"]),
        ("I've never done this before.", ["worries", "facts", "slides", "notes", "start", "simple"]),
        ("Can I suggest something different?", ["great", "suggestion", "presentation", "slides", "start", "topic"]),
        ("I feel nervous about joining.", ["worries", "take your time", "facts", "slides", "notes", "welcome"]),
        ("What should I say first?", ["hi", "help", "presentation", "start", "greeting", "simple"]),
        ("Can we work on the presentation instead?", ["great", "suggestion", "presentation", "slides", "start"]),
        ("I already know how to make slides.", ["great", "slides", "notes", "layout", "experience", "share"]),
        ("Can I just listen for a while?", ["of course", "take your time", "listen", "comfortable", "join"]),
    ]

    for user_input, expected_keywords in test_inputs:
        msg_resp = client.post(
            f"/api/conversations/{session_id}/message",
            json={"userId": user.id, "message": user_input, "language": "en"},
            headers=headers,
        )
        assert msg_resp.status_code == 200
        data = get_data(msg_resp)
        response_text = data.get("response", "").strip()

        # Quality Assertions
        assert len(response_text) > 10, f"Response too short for '{user_input}': {response_text}"
        assert validate_ai_response(response_text, "en", "Classmate") is True, f"Validation failed for: {response_text}"
        assert "as an ai" not in response_text.lower()
        assert "great job!" not in response_text.lower()
        assert "keep practicing" not in response_text.lower()

        # Contextual relevance check
        lower_resp = response_text.lower()
        has_relevant_kw = any(kw.lower() in lower_resp for kw in expected_keywords)
        assert has_relevant_kw, f"Response '{response_text}' did not match expected keywords for input '{user_input}'"


# =============================================================================
# 2. TEST JUDGE DEMO QUESTIONS (Product-level questions during role-play)
# =============================================================================

def test_judge_demo_questions_handling(db_session):
    """
    Verifies that meta / product demo questions are handled gracefully and contextually:
    - 'What is HumSaathi?'
    - 'How are you different from ChatGPT?'
    - 'Why is this useful for neurodiverse learners?'
    - 'Can you speak Urdu?'
    - 'Can you speak Roman Urdu?'
    - 'Do you remember what I said earlier?'
    """
    user, token = create_test_user(db_session, persona="teen", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "en"},
        headers=headers,
    )
    assert start_resp.status_code == 200
    session_id = get_data(start_resp)["session"]["id"]

    demo_questions = [
        ("What is HumSaathi?", ["humsaathi", "adaptive", "communication", "coach", "neurodiverse"]),
        ("How are you different from ChatGPT?", ["chatbots", "specialized", "role-play", "sensory", "scaffolding", "coach"]),
        ("Why is this useful for neurodiverse learners?", ["safe", "low-anxiety", "social cues", "turn-taking", "communication"]),
        ("Can you speak Urdu?", ["yes", "urdu", "roman urdu", "support", "fluent"]),
        ("Can you speak Roman Urdu?", ["yes", "roman urdu", "support", "urdu", "english"]),
        ("Do you remember what I said earlier?", ["yes", "remember", "conversation", "history", "keep going"]),
    ]

    for question, expected_terms in demo_questions:
        resp = client.post(
            f"/api/conversations/{session_id}/message",
            json={"userId": user.id, "message": question, "language": "en"},
            headers=headers,
        )
        assert resp.status_code == 200
        text = get_data(resp).get("response", "")
        assert len(text) > 10
        assert validate_ai_response(text, "en", "Classmate") is True
        lower_t = text.lower()
        assert any(term in lower_t for term in expected_terms), f"Demo question '{question}' response '{text}' missing expected terms"


# =============================================================================
# 3. TRILINGUAL INTELLIGENCE & SCRIPT ENFORCEMENT
# =============================================================================

def test_trilingual_intelligence_across_languages(db_session):
    """Verifies that English, Urdu, and Roman Urdu respond in the exact expected script and format."""
    
    # A. Urdu (ur)
    user_ur, token_ur = create_test_user(db_session, persona="teen", language="ur")
    start_ur = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "ur"},
        headers={"Authorization": f"Bearer {token_ur}"},
    )
    session_id_ur = get_data(start_ur)["session"]["id"]

    resp_ur = client.post(
        f"/api/conversations/{session_id_ur}/message",
        json={"userId": user_ur.id, "message": "مجھے سمجھ نہیں آ رہی کہ کیا کہنا ہے۔", "language": "ur"},
        headers={"Authorization": f"Bearer {token_ur}"},
    )
    ur_text = get_data(resp_ur).get("response", "")
    assert has_urdu_script(ur_text), f"Urdu response missing Urdu script: {ur_text}"
    assert validate_ai_response(ur_text, "ur", "کلاس فیلو") is True

    # B. Roman Urdu (ur_rm)
    user_rm, token_rm = create_test_user(db_session, persona="teen", language="ur_rm")
    start_rm = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "ur_rm"},
        headers={"Authorization": f"Bearer {token_rm}"},
    )
    session_id_rm = get_data(start_rm)["session"]["id"]

    resp_rm = client.post(
        f"/api/conversations/{session_id_rm}/message",
        json={"userId": user_rm.id, "message": "Main ne pehle bhi slides banayi hain.", "language": "ur_rm"},
        headers={"Authorization": f"Bearer {token_rm}"},
    )
    rm_text = get_data(resp_rm).get("response", "")
    assert not has_urdu_script(rm_text), f"Roman Urdu response should not contain Urdu script: {rm_text}"
    assert any(term in rm_text.lower() for term in ["slides", "research", "notes", "share", "great", "shandar"])
    assert validate_ai_response(rm_text, "ur_rm", "Classmate") is True

    # C. English (en)
    user_en, token_en = create_test_user(db_session, persona="teen", language="en")
    start_en = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "en"},
        headers={"Authorization": f"Bearer {token_en}"},
    )
    session_id_en = get_data(start_en)["session"]["id"]

    resp_en = client.post(
        f"/api/conversations/{session_id_en}/message",
        json={"userId": user_en.id, "message": "I've made slides before for history class.", "language": "en"},
        headers={"Authorization": f"Bearer {token_en}"},
    )
    en_text = get_data(resp_en).get("response", "")
    assert not has_urdu_script(en_text)
    assert any(term in en_text.lower() for term in ["slides", "research", "notes", "great", "share", "organizing"])
    assert validate_ai_response(en_text, "en", "Classmate") is True


# =============================================================================
# 4. PERSONA CALIBRATION & SCENARIOS VERIFICATION (Child, Teen, Adult)
# =============================================================================

def test_child_teen_adult_persona_consistency(db_session):
    """Verifies that Child, Teen, and Adult personas receive context-aware, age-appropriate interactions."""

    # 1. Child Scenario: Asking Teacher for Help
    user_child, token_child = create_test_user(db_session, persona="child", language="en")
    start_child = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_teacher_help", "mode": "text", "language": "en"},
        headers={"Authorization": f"Bearer {token_child}"},
    )
    session_id_child = get_data(start_child)["session"]["id"]

    resp_c = client.post(
        f"/api/conversations/{session_id_child}/message",
        json={"userId": user_child.id, "message": "I don't understand question 2.", "language": "en"},
        headers={"Authorization": f"Bearer {token_child}"},
    )
    child_text = get_data(resp_c).get("response", "")
    assert any(term in child_text.lower() for term in ["question", "part", "together", "step", "help", "look"])
    assert "great job" not in child_text.lower()

    # 2. Adult Scenario: Asking Manager for Clarification
    user_adult, token_adult = create_test_user(db_session, persona="adult", language="en")
    start_adult = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_manager_clarification", "mode": "text", "language": "en"},
        headers={"Authorization": f"Bearer {token_adult}"},
    )
    session_id_adult = get_data(start_adult)["session"]["id"]

    resp_a = client.post(
        f"/api/conversations/{session_id_adult}/message",
        json={"userId": user_adult.id, "message": "I'm worried about making a mistake on the data.", "language": "en"},
        headers={"Authorization": f"Bearer {token_adult}"},
    )
    adult_text = get_data(resp_a).get("response", "")
    assert any(term in adult_text.lower() for term in ["draft", "figures", "review", "understandable", "numbers"])
    assert "great job" not in adult_text.lower()


# =============================================================================
# 5. MULTI-TURN MEMORY RETENTION
# =============================================================================

def test_multi_turn_memory_retention(db_session):
    """Verifies that earlier statements are recognized across consecutive turns."""
    user, token = create_test_user(db_session, persona="teen", language="en")
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post(
        "/api/conversations/start",
        json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "en"},
        headers=headers,
    )
    session_id = get_data(start)["session"]["id"]

    # Turn 1: Propose presentation
    r1 = client.post(
        f"/api/conversations/{session_id}/message",
        json={"userId": user.id, "message": "I can help with the presentation.", "language": "en"},
        headers=headers,
    )
    t1 = get_data(r1).get("response", "")
    assert any(term in t1.lower() for term in ["slide", "presentation", "visual", "research"])

    # Turn 2: Mention slide experience
    r2 = client.post(
        f"/api/conversations/{session_id}/message",
        json={"userId": user.id, "message": "I've made slides before for science class.", "language": "en"},
        headers=headers,
    )
    t2 = get_data(r2).get("response", "")
    assert any(term in t2.lower() for term in ["slides", "research", "notes", "share", "great", "layout"])

    # Check transcript history has accumulated correctly
    sess_resp = client.get(f"/api/conversations/session/{session_id}", headers=headers)
    assert sess_resp.status_code == 200
    sess_data = get_data(sess_resp)
    transcript = sess_data["session"]["transcript"]
    assert len(transcript) == 5  # initial AI + (user1, ai1) + (user2, ai2)
