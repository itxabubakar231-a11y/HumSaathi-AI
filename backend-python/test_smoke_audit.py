import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_comprehensive_smoke():
    print("=== STARTING COMPREHENSIVE PRODUCTION SMOKE AUDIT ===")
    
    # 1. Health Endpoint
    h = client.get("/api/health")
    assert h.status_code == 200
    h_data = h.json()
    assert h_data["success"] is True
    print("[PASS] 1. Health API")

    # 2. Auth: User Setup & Login
    u_res = client.post("/api/users/setup", json={
        "name": "Audit Learner",
        "persona": "child",
        "language": "en",
        "sensoryPrefs": {"textSize": "medium", "calmMode": False}
    })
    assert u_res.status_code == 200
    u_data = u_res.json()
    user_id = u_data["data"]["user"]["id"]
    print(f"[PASS] 2. User Setup: {user_id}")

    # 3. Child Assessment Full Flow
    q_res = client.get(f"/api/assessment/{user_id}/questions")
    assert q_res.status_code == 200
    questions = q_res.json()["data"]["questions"]
    assert len(questions) == 5
    
    sub_res = client.post(f"/api/assessment/{user_id}/submit", json={
        "responses": [
            {"questionId": "c1", "answer": "A"},
            {"questionId": "c2", "answer": "M"},
            {"questionId": "c3", "answer": "4"},
            {"questionId": "c4", "answer": "Blue"},
            {"questionId": "c5", "answer": "3"},
        ]
    })
    assert sub_res.status_code == 200
    assert sub_res.json()["data"]["assessment"]["score"] == 1.0
    print("[PASS] 3. Child Assessment Full Flow (5/5 Correct)")

    # 4. Foundations & World Life Skills (Letters, Numbers, Colors, Shapes, Counting, Animals, Emotions, Routines)
    topics = ["letters", "numbers", "colors", "shapes", "counting", "animals", "emotions", "routines"]
    for t in topics:
        act_res = client.get(f"/api/activities/{t}")
        assert act_res.status_code == 200
        act_data = act_res.json()
        assert act_data["success"] is True
        assert len(act_data["data"]["activity"]["content"]["questions"]) > 0
    print("[PASS] 4. Foundations & World Life Skills All 8 Categories Verified")

    # 5. Activity Attempt Submission & Progress Persistence
    att_res = client.post(f"/api/attempts/{user_id}/submit", json={
        "activityId": "letters",
        "answers": [
            {"questionId": "q1", "answer": "A", "correct": True, "attemptsUsed": 1},
            {"questionId": "q2", "answer": "B", "correct": True, "attemptsUsed": 1},
        ],
        "timeMs": 4500,
    })
    assert att_res.status_code == 200
    assert att_res.json()["data"]["attempt"]["starsAwarded"] >= 1
    print("[PASS] 5. Activity Attempt & Stars Persistence")

    # 6. Adaptive Recommendation
    rec_res = client.post(f"/api/dashboard/{user_id}/recommend")
    assert rec_res.status_code == 200
    rec_topic = rec_res.json()["data"]["recommendation"]["topic"]
    print(f"[PASS] 6. Adaptive Recommendation -> {rec_topic}")

    # 7. Teen Modules & Evaluation
    t_mod_res = client.get("/api/skills/modules/teen")
    assert t_mod_res.status_code == 200
    assert len(t_mod_res.json()["data"]["modules"]) >= 3
    
    t_eval = client.post("/api/skills/evaluate", json={
        "userId": user_id,
        "moduleId": "teen_reading_vocab",
        "scenarioId": "teen_rv_1",
        "optionId": "opt_rv_1"
    })
    assert t_eval.status_code == 200
    assert t_eval.json()["data"]["score"] >= 0
    print("[PASS] 7. Teen Skill Modules & Solution Evaluation")

    # 8. Adult Modules & Evaluation
    a_mod_res = client.get("/api/skills/modules/adult")
    assert a_mod_res.status_code == 200
    assert len(a_mod_res.json()["data"]["modules"]) >= 3

    a_eval = client.post("/api/skills/evaluate", json={
        "userId": user_id,
        "moduleId": "adult_functional_reading",
        "scenarioId": "adult_fr_1",
        "optionId": "opt_fr_1"
    })
    assert a_eval.status_code == 200
    assert a_eval.json()["data"]["score"] >= 0
    print("[PASS] 8. Adult Skill Modules & Solution Evaluation")

    # 9. Practice Scenarios & AI Coach / Fallback Session
    sc_res = client.get("/api/conversations/scenarios")
    assert sc_res.status_code == 200
    scenarios = sc_res.json()["data"]["scenarios"]
    sc_id = scenarios[0]["id"]

    start_conv = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": sc_id,
        "mode": "voice"
    })
    assert start_conv.status_code == 200
    sess = start_conv.json()["data"]["session"]
    sess_id = sess["id"]

    msg_res = client.post(f"/api/conversations/{sess_id}/message", json={
        "userId": user_id,
        "message": "Hello, I am asking for assistance."
    })
    assert msg_res.status_code == 200
    assert msg_res.json()["data"]["response"] != ""

    end_res = client.post(f"/api/conversations/{sess_id}/end")
    assert end_res.status_code == 200

    conv_eval = client.post("/api/evaluation/conversation", json={
        "sessionId": sess_id,
        "userId": user_id
    })
    assert conv_eval.status_code == 200
    assert conv_eval.json()["data"]["evaluation"]["overallScore"] >= 0
    print("[PASS] 9. Practice Scenarios, Voice/Text Session, Fallback/AI, Evaluation")

    # 10. Dashboard & Journey Synchronization
    dash_res = client.get(f"/api/dashboard/{user_id}")
    assert dash_res.status_code == 200
    d_info = dash_res.json()["data"]["dashboard"]
    assert d_info["completedCount"] >= 1
    print(f"[PASS] 10. Dashboard & Journey Sync (Stars: {d_info['rewards']['totalStars']}, Completed: {d_info['completedCount']})")

    print("\n=== ALL 10 COMPREHENSIVE PRODUCTION SMOKE AUDITS PASSED ===")

if __name__ == "__main__":
    run_comprehensive_smoke()
