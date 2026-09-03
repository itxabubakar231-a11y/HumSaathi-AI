import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.scenarios import DEFAULT_SCENARIOS

client = TestClient(app)

def test_scenario_counts_and_difficulty_distribution():
    # 1. Total unique scenarios
    assert len(DEFAULT_SCENARIOS) >= 11

    # 2. Child scenarios count & distribution (6 scenarios: 2 Easy, 2 Medium, 2 Challenging)
    child_scenarios = [s for s in DEFAULT_SCENARIOS if 'child' in s['personas']]
    assert len(child_scenarios) == 6, f"Expected 6 child scenarios, got {len(child_scenarios)}"
    child_easy = [s for s in child_scenarios if s['difficulty'] == 'easy']
    child_med = [s for s in child_scenarios if s['difficulty'] == 'medium']
    child_chal = [s for s in child_scenarios if s['difficulty'] == 'challenging']
    assert len(child_easy) == 2, f"Expected 2 easy child scenarios, got {len(child_easy)}"
    assert len(child_med) == 2, f"Expected 2 medium child scenarios, got {len(child_med)}"
    assert len(child_chal) == 2, f"Expected 2 challenging child scenarios, got {len(child_chal)}"

    # 3. Teen scenarios count & distribution (At least 5 scenarios: Easy, Medium, Challenging)
    teen_scenarios = [s for s in DEFAULT_SCENARIOS if 'teen' in s['personas']]
    assert len(teen_scenarios) >= 5, f"Expected at least 5 teen scenarios, got {len(teen_scenarios)}"
    teen_easy = [s for s in teen_scenarios if s['difficulty'] == 'easy']
    teen_med = [s for s in teen_scenarios if s['difficulty'] == 'medium']
    teen_chal = [s for s in teen_scenarios if s['difficulty'] == 'challenging']
    assert len(teen_easy) >= 2, f"Expected at least 2 easy teen scenarios, got {len(teen_easy)}"
    assert len(teen_med) >= 2, f"Expected at least 2 medium teen scenarios, got {len(teen_med)}"
    assert len(teen_chal) >= 1, f"Expected at least 1 challenging teen scenario, got {len(teen_chal)}"

    # 4. Adult scenarios count & distribution (At least 5 scenarios: Easy, Medium, Challenging)
    adult_scenarios = [s for s in DEFAULT_SCENARIOS if 'adult' in s['personas']]
    assert len(adult_scenarios) >= 5, f"Expected at least 5 adult scenarios, got {len(adult_scenarios)}"
    adult_easy = [s for s in adult_scenarios if s['difficulty'] == 'easy']
    adult_med = [s for s in adult_scenarios if s['difficulty'] == 'medium']
    adult_chal = [s for s in adult_scenarios if s['difficulty'] == 'challenging']
    assert len(adult_easy) >= 2, f"Expected at least 2 easy adult scenarios, got {len(adult_easy)}"
    assert len(adult_med) >= 2, f"Expected at least 2 medium adult scenarios, got {len(adult_med)}"
    assert len(adult_chal) >= 1, f"Expected at least 1 challenging adult scenario, got {len(adult_chal)}"

def test_scenario_options_structure():
    # Every scenario MUST have exactly 4 structured options with en, ur, ur_rm text and feedback
    for s in DEFAULT_SCENARIOS:
        opts = s.get('options', [])
        assert len(opts) == 4, f"Scenario {s['id']} does not have exactly 4 options (has {len(opts)})"
        types = [o['type'] for o in opts]
        assert 'best' in types, f"Scenario {s['id']} missing best option"
        assert 'weaker' in types, f"Scenario {s['id']} missing weaker option"
        assert 'inappropriate' in types, f"Scenario {s['id']} missing inappropriate option"
        assert 'incorrect' in types, f"Scenario {s['id']} missing incorrect option"

        for o in opts:
            assert 'en' in o['text'] and 'ur' in o['text'] and 'ur_rm' in o['text'], f"Missing text translation in {o['id']}"
            assert 'en' in o['feedback'] and 'ur' in o['feedback'] and 'ur_rm' in o['feedback'], f"Missing feedback translation in {o['id']}"

def test_api_scenarios_localization():
    # 1. English endpoint
    res_en = client.get("/api/conversations/scenarios?persona=teen&language=en")
    assert res_en.status_code == 200
    data_en = res_en.json().get("data", res_en.json())
    scens_en = data_en["scenarios"]
    assert len(scens_en) >= 5
    for s in scens_en:
        assert isinstance(s["title"], str) and len(s["title"]) > 0
        assert isinstance(s["description"], str) and len(s["description"]) > 0
        assert isinstance(s["aiRole"], str) and len(s["aiRole"]) > 0
        assert len(s["options"]) == 4

    # 2. Urdu endpoint
    res_ur = client.get("/api/conversations/scenarios?persona=teen&language=ur")
    assert res_ur.status_code == 200
    data_ur = res_ur.json().get("data", res_ur.json())
    scens_ur = data_ur["scenarios"]
    assert len(scens_ur) >= 5
    for s in scens_ur:
        assert isinstance(s["title"], str) and len(s["title"]) > 0
        assert isinstance(s["description"], str) and len(s["description"]) > 0
        assert isinstance(s["aiRole"], str) and len(s["aiRole"]) > 0
        assert len(s["options"]) == 4
        # Options text must be in Urdu
        assert any('\u0600' <= char <= '\u06FF' for char in s["title"]), f"Expected Urdu characters in title {s['title']}"

    # 3. Roman Urdu endpoint
    res_rm = client.get("/api/conversations/scenarios?persona=teen&language=ur_rm")
    assert res_rm.status_code == 200
    data_rm = res_rm.json().get("data", res_rm.json())
    scens_rm = data_rm["scenarios"]
    assert len(scens_rm) >= 5
    for s in scens_rm:
        assert isinstance(s["title"], str) and len(s["title"]) > 0
        assert isinstance(s["description"], str) and len(s["description"]) > 0
        assert len(s["options"]) == 4

def test_api_difficulty_filters():
    for persona in ['child', 'teen', 'adult']:
        for diff in ['easy', 'medium', 'challenging']:
            r = client.get(f"/api/conversations/scenarios?persona={persona}&difficulty={diff}")
            assert r.status_code == 200
            data_dict = r.json().get("data", r.json())
            data = data_dict["scenarios"]
            assert len(data) >= 1, f"Expected at least 1 scenario for {persona} with difficulty {diff}"
            for s in data:
                assert s["difficulty"] == diff, f"Scenario {s['id']} difficulty mismatch ({s['difficulty']} != {diff})"

def test_conversation_flow():
    # Setup test user
    u_res = client.post("/api/users/setup", json={
        "name": "Scenario Tester",
        "persona": "teen",
        "language": "ur",
        "sensoryPrefs": {"calmMode": False, "textSize": "medium"}
    })
    assert u_res.status_code == 200
    u_data = u_res.json().get("data", u_res.json())
    user_id = u_data["user"]["id"]

    # Start conversation
    start_res = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": "scenario_teen_express_pref",
        "mode": "text"
    })
    assert start_res.status_code == 200
    start_data = start_res.json().get("data", start_res.json())
    sess = start_data["session"]
    session_id = sess["id"]
    assert session_id is not None
    assert len(sess["transcript"]) >= 1

    # Send a message
    msg_res = client.post(f"/api/conversations/{session_id}/message", json={
        "userId": user_id,
        "message": "Main library cafe jana chahta hoon."
    })
    assert msg_res.status_code == 200
    msg_data = msg_res.json().get("data", msg_res.json())
    assert "response" in msg_data
    assert len(msg_data["response"]) > 0
    assert len(msg_data["session"]["transcript"]) >= 3

    # End session
    end_res = client.post(f"/api/conversations/{session_id}/end")
    assert end_res.status_code == 200
    end_data = end_res.json().get("data", end_res.json())
    assert end_data["session"]["completed"] is True
