import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.conversation_service import (
    validate_ai_response,
    detect_selected_option,
    get_scenario_communication_skills,
    generate_contextual_fallback,
)
from app.data.scenarios import DEFAULT_SCENARIOS

client = TestClient(app)

def test_validation_function_behavior():
    # 1. Valid responses
    assert validate_ai_response("Sure, we are discussing the history project! What do you think?", "en", "Classmate") is True
    assert validate_ai_response("جی بالکل، آپ ہمارے گروپ میں شامل ہو سکتے ہیں۔", "ur", "کلاس فیلو") is True
    assert validate_ai_response("Hey! Haan bilkul, aap slides design kar sakte hain.", "ur_rm", "Classmate") is True

    # 2. Reject empty or too short
    assert validate_ai_response("", "en", "Classmate") is False
    assert validate_ai_response("ok", "en", "Classmate") is False

    # 3. Reject generic AI clichés and meta-filler
    assert validate_ai_response("As an AI, I am here to help you practice.", "en", "Classmate") is False
    assert validate_ai_response("Great job! Your communication is excellent. Keep practicing!", "en", "Classmate") is False
    assert validate_ai_response("That is the correct answer!", "en", "Classmate") is False
    assert validate_ai_response("Objectives achieved: true", "en", "Classmate") is False

    # 4. Reject English text when Urdu script is expected
    assert validate_ai_response("This is an English response when Urdu was requested.", "ur", "کلاس فیلو") is False

def test_communication_skills_extraction():
    skills_group = get_scenario_communication_skills("scenario_group_discussion", "easy")
    assert "Active listening" in skills_group
    assert "Turn-taking" in skills_group

    skills_pharmacy = get_scenario_communication_skills("scenario_adult_pharmacy", "medium")
    assert "Dosage & meal timing confirmation" in skills_pharmacy

def test_quick_response_option_detection():
    def_s = next((s for s in DEFAULT_SCENARIOS if s["id"] == "scenario_group_discussion"), None)
    assert def_s is not None

    # Test English best option detection
    best_opt_en = def_s["options"][0]["text"]["en"]
    detected = detect_selected_option(def_s, best_opt_en, "en")
    assert detected is not None
    assert detected["type"] == "best"

    # Test Roman Urdu match
    detected_rm = detect_selected_option(def_s, "Main help kar sakta hoon", "ur_rm")
    assert detected_rm is not None

def test_joining_group_discussion_multi_turn_english():
    # Setup test user
    u_res = client.post("/api/users/setup", json={
        "name": "Demo Alex",
        "persona": "teen",
        "language": "en",
        "sensoryPrefs": {"calmMode": False, "textSize": "medium"}
    })
    assert u_res.status_code == 200
    user_id = u_res.json()["data"]["user"]["id"]

    # 1. Start session
    start_res = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": "scenario_group_discussion",
        "mode": "text"
    })
    assert start_res.status_code == 200
    sess = start_res.json()["data"]["session"]
    session_id = sess["id"]
    assert len(sess["transcript"]) == 1

    # Turn 1: Join inquiry
    res1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Hi, can I join your group discussion?"
    })
    assert res1.status_code == 200
    resp_text_1 = res1.json()["data"]["response"]
    assert any(term in resp_text_1.lower() for term in ["history", "topic", "project", "sure", "civilization", "discussing"])
    assert "great job" not in resp_text_1.lower()

    # Turn 2: Specific contribution (Presentation)
    res2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "I can help with the presentation."
    })
    assert res2.status_code == 200
    resp_text_2 = res2.json()["data"]["response"]
    assert any(term in resp_text_2.lower() for term in ["slide", "presentation", "visual", "research", "points"])

    # Turn 3: Multi-turn continuation (Made slides before)
    res3 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "I've made slides before for science class."
    })
    assert res3.status_code == 200
    resp_text_3 = res3.json()["data"]["response"]
    assert any(term in resp_text_3.lower() for term in ["share", "notes", "document", "slides", "organizing", "research"])

    # Turn 4: Unexpected response (Hesitant / "I don't know what I can do")
    res4 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Actually I don't know what I can do."
    })
    assert res4.status_code == 200
    resp_text_4 = res4.json()["data"]["response"]
    assert any(term in resp_text_4.lower() for term in ["problem", "worries", "facts", "notes", "help", "sounds"])

    # Turn 5: Unexpected response ("Can I just listen first?")
    res5 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Can I just listen first?"
    })
    assert res5.status_code == 200
    resp_text_5 = res5.json()["data"]["response"]
    assert any(term in resp_text_5.lower() for term in ["time", "chair", "listen", "brainstorm", "welcome", "sure"])

def test_joining_group_discussion_multi_turn_urdu():
    # Setup test user in Urdu
    u_res = client.post("/api/users/setup", json={
        "name": "Demo Fatima",
        "persona": "teen",
        "language": "ur",
        "sensoryPrefs": {"calmMode": True, "textSize": "large"}
    })
    assert u_res.status_code == 200
    user_id = u_res.json()["data"]["user"]["id"]

    # Start session
    start_res = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": "scenario_group_discussion",
        "mode": "text"
    })
    assert start_res.status_code == 200
    session_id = start_res.json()["data"]["session"]["id"]

    # Turn 1: Urdu join request
    res1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "کیا میں آپ کے گروپ میں شامل ہو سکتا ہوں؟"
    })
    assert res1.status_code == 200
    resp_text_1 = res1.json()["data"]["response"]
    # Check Urdu script presence
    assert any('\u0600' <= c <= '\u06FF' for c in resp_text_1)

    # Turn 2: Urdu hesitant request ("کیا میں پہلے سن سکتا ہوں؟")
    res2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "کیا میں صرف سن سکتا ہوں؟"
    })
    assert res2.status_code == 200
    resp_text_2 = res2.json()["data"]["response"]
    assert any('\u0600' <= c <= '\u06FF' for c in resp_text_2)

def test_joining_group_discussion_multi_turn_roman_urdu():
    # Setup test user in Roman Urdu
    u_res = client.post("/api/users/setup", json={
        "name": "Demo Zain",
        "persona": "teen",
        "language": "ur_rm",
        "sensoryPrefs": {"calmMode": False, "textSize": "medium"}
    })
    assert u_res.status_code == 200
    user_id = u_res.json()["data"]["user"]["id"]

    # Start session
    start_res = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": "scenario_group_discussion",
        "mode": "text"
    })
    assert start_res.status_code == 200
    session_id = start_res.json()["data"]["session"]["id"]

    # Turn 1: Roman Urdu join request
    res1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Kya main aap ka group join kar sakta hoon?"
    })
    assert res1.status_code == 200
    resp_text_1 = res1.json()["data"]["response"]
    assert any(w in resp_text_1.lower() for w in ["history", "topic", "project", "ancient", "haan", "hey"])

    # Turn 2: Slides mention in Roman Urdu
    res2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Main presentation slides bana sakta hoon."
    })
    assert res2.status_code == 200
    resp_text_2 = res2.json()["data"]["response"]
    assert any(w in resp_text_2.lower() for w in ["slides", "design", "points", "organize", "zabardast"])
