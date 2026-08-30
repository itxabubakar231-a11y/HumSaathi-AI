import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.conversation import CommunicationScenario, ConversationSession, ConversationEvaluation

client = TestClient(app)

def _run_tests():
    print("\n--- STARTING PHASE 5 AI COACH & CONVERSATIONS TESTS ---\n")
    
    # 0. Setup isolated test users for Child, Teen, Adult across languages
    db = SessionLocal()
    
    # Ensure at least one scenario exists
    scenario = db.query(CommunicationScenario).filter(CommunicationScenario.title == "Asking a teacher for help").first()
    if not scenario:
        scenario = CommunicationScenario(
            title="Asking a teacher for help",
            description="Practice raising your hand and asking your teacher for help with an assignment.",
            aiRole="teacher",
            personas='["child"]',
            languages='["en", "ur", "ur_rm"]',
            difficulty="easy",
            objectives='["Approach teacher politely", "State task needing help", "Thank the teacher"]',
            context="You are a kind, patient school teacher helping a student.",
            initialPrompt='{"en": "Hello! Do you need some help with this assignment?", "ur": "ہیلو! کیا آپ کو مدد چاہیے؟", "ur_rm": "Hello! Kya aap ko madad chahiye?"}',
            isActive=True,
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)
    
    scenario_id = scenario.id
    
    # Test User (Child - en)
    child_user = db.query(User).filter(User.name == "Test Child Coach").first()
    if not child_user:
        child_user = User(
            name="Test Child Coach",
            persona="child",
            language="en",
            sensoryPrefs="{}",
            parentPin="1234",
            setupComplete=True,
        )
        db.add(child_user)
        db.commit()
        db.refresh(child_user)
    child_id = child_user.id

    # Test User (Teen - ur_rm)
    teen_user = db.query(User).filter(User.name == "Test Teen Coach").first()
    if not teen_user:
        teen_user = User(
            name="Test Teen Coach",
            persona="teen",
            language="ur_rm",
            sensoryPrefs="{}",
            setupComplete=True,
        )
        db.add(teen_user)
        db.commit()
        db.refresh(teen_user)
    teen_id = teen_user.id

    # Test User (Adult - ur)
    adult_user = db.query(User).filter(User.name == "Test Adult Coach").first()
    if not adult_user:
        adult_user = User(
            name="Test Adult Coach",
            persona="adult",
            language="ur",
            sensoryPrefs="{}",
            setupComplete=True,
        )
        db.add(adult_user)
        db.commit()
        db.refresh(adult_user)
    adult_id = adult_user.id

    db.close()
    print(f"[SETUP] Child ID: {child_id}, Teen ID: {teen_id}, Adult ID: {adult_id}, Scenario ID: {scenario_id}")

    # 1. Scenarios Retrieval
    res_scenarios = client.get("/api/conversations/scenarios")
    assert res_scenarios.status_code == 200
    sc_data = res_scenarios.json()
    assert sc_data["success"] is True
    scenarios_list = sc_data["data"]["scenarios"]
    assert len(scenarios_list) >= 1
    print(f"[PASS] GET /api/conversations/scenarios ({len(scenarios_list)} scenarios available)")

    # 2. Filtered Scenario Retrieval (persona, language)
    res_filtered = client.get("/api/conversations/scenarios?persona=child&language=en")
    assert res_filtered.status_code == 200
    assert res_filtered.json()["success"] is True
    print("[PASS] GET /api/conversations/scenarios?persona=child&language=en")

    # 3. Single Scenario by ID
    res_single = client.get(f"/api/conversations/scenarios/{scenario_id}")
    assert res_single.status_code == 200
    single_data = res_single.json()
    assert single_data["success"] is True
    assert single_data["data"]["scenario"]["id"] == scenario_id
    assert single_data["data"]["scenario"]["aiRole"].lower() == "teacher"
    print("[PASS] GET /api/conversations/scenarios/:id")

    # 4. Scenario Not Found 404
    res_sc_404 = client.get("/api/conversations/scenarios/nonexistent_scenario_99999")
    assert res_sc_404.status_code == 404
    assert res_sc_404.json()["success"] is False
    print("[PASS] GET /api/conversations/scenarios/nonexistent -> 404")

    # 5. Start Conversation Session (Child - text)
    res_start = client.post("/api/conversations/start", json={
        "userId": child_id,
        "scenarioId": scenario_id,
        "mode": "text",
    })
    assert res_start.status_code == 200
    start_data = res_start.json()
    assert start_data["success"] is True
    session_obj = start_data["data"]["session"]
    session_id = session_obj["id"]
    assert session_obj["userId"] == child_id
    assert session_obj["scenarioId"] == scenario_id
    assert len(session_obj["transcript"]) == 1
    assert session_obj["transcript"][0]["role"] == "assistant"
    print(f"[PASS] POST /api/conversations/start (Session: {session_id}, Initial Prompt: '{session_obj['transcript'][0]['content'][:30]}...')")

    # 6. Send User Message (Turn 1)
    res_msg1 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": child_id,
        "message": "Excuse me teacher, I am having trouble with question 1.",
    })
    assert res_msg1.status_code == 200
    msg1_data = res_msg1.json()
    assert msg1_data["success"] is True
    assert msg1_data["data"]["response"] != ""
    assert msg1_data["data"]["session"]["turnCount"] == 1
    assert len(msg1_data["data"]["session"]["transcript"]) == 3  # init + user + assistant
    print(f"[PASS] POST /api/conversations/:id/message (Turn 1 response: '{msg1_data['data']['response'][:40]}...')")

    # 7. Send Second User Message (Turn 2)
    res_msg2 = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": child_id,
        "message": "Yes, that explanation helps a lot, thank you!",
    })
    assert res_msg2.status_code == 200
    msg2_data = res_msg2.json()
    assert msg2_data["success"] is True
    assert msg2_data["data"]["session"]["turnCount"] == 2
    print(f"[PASS] POST /api/conversations/:id/message (Turn 2 response: '{msg2_data['data']['response'][:40]}...')")

    # 8. End Conversation Session
    res_end = client.post(f"/api/conversations/{session_id}/end")
    assert res_end.status_code == 200
    end_data = res_end.json()
    assert end_data["success"] is True
    assert end_data["data"]["session"]["completed"] is True
    print(f"[PASS] POST /api/conversations/:id/end (Session marked completed)")

    # 9. Get Single Session by ID
    res_sess = client.get(f"/api/conversations/session/{session_id}")
    assert res_sess.status_code == 200
    sess_data = res_sess.json()
    assert sess_data["success"] is True
    assert sess_data["data"]["session"]["id"] == session_id
    assert sess_data["data"]["session"]["completed"] is True
    print(f"[PASS] GET /api/conversations/session/:id")

    # 10. List User Sessions
    res_user_sessions = client.get(f"/api/conversations/sessions/{child_id}")
    assert res_user_sessions.status_code == 200
    us_data = res_user_sessions.json()
    assert us_data["success"] is True
    assert len(us_data["data"]["sessions"]) >= 1
    print(f"[PASS] GET /api/conversations/sessions/:userId (Found {len(us_data['data']['sessions'])} sessions)")

    # 11. Conversation Evaluation (POST /api/evaluation/conversation)
    res_eval = client.post("/api/evaluation/conversation", json={
        "sessionId": session_id,
        "userId": child_id,
    })
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["success"] is True
    ev = eval_data["data"]["evaluation"]
    assert ev["overallScore"] >= 0
    assert ev["clarity"] >= 0
    assert len(ev["strengths"]) >= 1
    assert len(ev["improvements"]) >= 1
    assert "feedback" in ev
    print(f"[PASS] POST /api/evaluation/conversation (Overall Score: {ev['overallScore']}, Feedback: '{ev['feedback'][:40]}...')")

    # 12. Get Evaluation by Session ID (GET /api/evaluation/:sessionId)
    res_get_eval = client.get(f"/api/evaluation/{session_id}")
    assert res_get_eval.status_code == 200
    get_eval_data = res_get_eval.json()
    assert get_eval_data["success"] is True
    assert get_eval_data["data"]["evaluation"]["id"] == ev["id"]
    print(f"[PASS] GET /api/evaluation/:sessionId verified")

    # 13. Evaluations alias router compatibility (GET /api/evaluations/:sessionId)
    res_alias = client.get(f"/api/evaluations/{session_id}")
    assert res_alias.status_code == 200
    assert res_alias.json()["data"]["evaluation"]["id"] == ev["id"]
    print(f"[PASS] GET /api/evaluations/:sessionId alias verified")

    # 14. Error handling: Nonexistent user on start -> 400
    res_bad_user = client.post("/api/conversations/start", json={
        "userId": "nonexistent_user_99999",
        "scenarioId": scenario_id,
    })
    assert res_bad_user.status_code == 400
    assert res_bad_user.json()["success"] is False
    print("[PASS] POST /api/conversations/start with invalid user -> 400")

    # 15. Error handling: Nonexistent scenario on start -> 400
    res_bad_sc = client.post("/api/conversations/start", json={
        "userId": child_id,
        "scenarioId": "nonexistent_scenario_99999",
    })
    assert res_bad_sc.status_code == 400
    assert res_bad_sc.json()["success"] is False
    print("[PASS] POST /api/conversations/start with invalid scenario -> 400")

    # 16. Error handling: Send message to completed session -> 400
    res_bad_msg = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": child_id,
        "message": "Hello again after completion",
    })
    assert res_bad_msg.status_code == 400
    assert res_bad_msg.json()["success"] is False
    print("[PASS] POST /api/conversations/:id/message to completed session -> 400")

    # 17. Roman Urdu conversation session (Teen)
    res_teen_start = client.post("/api/conversations/start", json={
        "userId": teen_id,
        "scenarioId": scenario_id,
        "mode": "voice",
    })
    assert res_teen_start.status_code == 200
    teen_sess_id = res_teen_start.json()["data"]["session"]["id"]
    res_teen_msg = client.post(f"/api/conversations/{teen_sess_id}/message", json={
        "userId": teen_id,
        "message": "Teacher mujhe pehle question mein help chahiye.",
    })
    assert res_teen_msg.status_code == 200
    assert res_teen_msg.json()["data"]["response"] != ""
    print(f"[PASS] Roman Urdu Teen voice session verified ({teen_sess_id})")

    # 18. Urdu conversation session (Adult)
    res_adult_start = client.post("/api/conversations/start", json={
        "userId": adult_id,
        "scenarioId": scenario_id,
        "mode": "text",
    })
    assert res_adult_start.status_code == 200
    adult_sess_id = res_adult_start.json()["data"]["session"]["id"]
    res_adult_msg = client.post(f"/api/conversations/{adult_sess_id}/message", json={
        "userId": adult_id,
        "message": "کیا آپ مجھے بتا سکتے ہیں کہ یہ کیسے حل ہوگا؟",
    })
    assert res_adult_msg.status_code == 200
    assert res_adult_msg.json()["data"]["response"] != ""
    print(f"[PASS] Urdu Adult text session verified ({adult_sess_id})")

    print("\n--- ALL PHASE 5 AI COACH & CONVERSATION TESTS PASSED! ---\n")

def test_phase5():
    """Execute Phase 5 AI Coach & conversation test suite via pytest."""
    _run_tests()

if __name__ == "__main__":
    _run_tests()
