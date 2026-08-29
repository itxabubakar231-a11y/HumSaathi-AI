import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)

def _run_tests():
    print("\n--- STARTING PHASE 3 ASSESSMENT & PROGRESS TESTS ---\n")
    
    # 0. Create or get test user
    db = SessionLocal()
    user = db.query(User).filter(User.name == "Test Child Learner").first()
    if not user:
        user = User(
            name="Test Child Learner",
            persona="child",
            language="en",
            sensoryPrefs="{}",
            parentPin="1234",
            setupComplete=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    user_id = user.id
    db.close()
    print(f"[SETUP] Created/Found Test User ID: {user_id}")

    # 1. Get assessment questions
    res_q = client.get(f"/api/assessment/{user_id}/questions")
    assert res_q.status_code == 200
    q_data = res_q.json()
    assert q_data["success"] is True
    questions = q_data["data"]["questions"]
    assert len(questions) == 5
    print(f"[PASS] GET /api/assessment/{user_id}/questions (5 questions returned)")

    # 2. Submit assessment
    responses = [
        {"questionId": "c1", "answer": "A"},
        {"questionId": "c2", "answer": "M"},
        {"questionId": "c3", "answer": "4"},
        {"questionId": "c4", "answer": "Blue"},
        {"questionId": "c5", "answer": "3"},
    ]
    res_sub = client.post(f"/api/assessment/{user_id}/submit", json={"responses": responses})
    assert res_sub.status_code == 200
    sub_data = res_sub.json()
    assert sub_data["success"] is True
    ass_info = sub_data["data"]["assessment"]
    assert ass_info["score"] == 1.0
    assert ass_info["correct"] == 5
    assert "areaLevels" in ass_info
    print(f"[PASS] POST /api/assessment/{user_id}/submit (Score: {ass_info['score']*100}%, Level: {ass_info['estimatedLevel']})")

    # 3. Get latest assessment
    res_lat = client.get(f"/api/assessment/{user_id}/latest")
    assert res_lat.status_code == 200
    lat_data = res_lat.json()
    assert lat_data["success"] is True
    assert lat_data["data"]["assessment"]["id"] == ass_info["id"]
    print("[PASS] GET /api/assessment/{user_id}/latest verified")

    # 4. Submit Activity Attempt (Letters)
    answers = [
        {"questionId": "q1", "answer": "A", "correct": True, "attemptsUsed": 1},
        {"questionId": "q2", "answer": "B", "correct": True, "attemptsUsed": 1},
        {"questionId": "q3", "answer": "C", "correct": True, "attemptsUsed": 1},
        {"questionId": "q4", "answer": "D", "correct": True, "attemptsUsed": 1},
    ]
    res_att = client.post(f"/api/attempts/{user_id}/submit", json={
        "activityId": "letters",
        "answers": answers,
        "timeMs": 8500,
    })
    assert res_att.status_code == 200
    att_data = res_att.json()
    assert att_data["success"] is True
    attempt_res = att_data["data"]["attempt"]
    feedback_res = att_data["data"]["feedback"]
    assert attempt_res["starsAwarded"] >= 1
    assert "message" in feedback_res
    print(f"[PASS] POST /api/attempts/{user_id}/submit (Stars: {attempt_res['starsAwarded']}, Total: {attempt_res['totalStars']}, Feedback: {feedback_res['message'][:40]}...)")

    # 5. Activity recommendation
    res_rec = client.post(f"/api/dashboard/{user_id}/recommend")
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert rec_data["success"] is True
    assert "activityType" in rec_data["data"]["recommendation"]
    print(f"[PASS] POST /api/dashboard/{user_id}/recommend (Next: {rec_data['data']['recommendation']['topic']})")

    # 6. Parent view with correct PIN
    res_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    assert res_parent.status_code == 200
    parent_data = res_parent.json()
    assert parent_data["success"] is True
    assert "learner" in parent_data["data"]["parentView"]
    print("[PASS] POST /api/dashboard/{user_id}/parent (Valid PIN 1234)")

    # 7. Parent view with invalid PIN (403 test)
    res_parent_bad = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "9999"})
    assert res_parent_bad.status_code == 403
    assert res_parent_bad.json()["success"] is False
    print("[PASS] POST /api/dashboard/{user_id}/parent (Invalid PIN 403 Forbidden)")

    # 8. User Dashboard verification
    res_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert dash_data["success"] is True
    d = dash_data["data"]["dashboard"]
    assert d["completedCount"] >= 1
    print(f"[PASS] GET /api/dashboard/{user_id} (Completed Activities: {d['completedCount']}, Stars: {d['rewards']['totalStars']})")

    print("\n--- ALL PHASE 3 ASSESSMENT & PROGRESS TESTS PASSED! ---\n")


# Pytest wrapper for Phase 3 tests
def test_phase3():
    """Execute Phase 3 assessment & progress test suite via pytest.

    Calls the existing ``_run_tests`` function so that all assertions are
    evaluated. The original ``if __name__ == '__main__'`` block is retained
    for manual execution.
    """
    _run_tests()

if __name__ == "__main__":
    # Preserve original behaviour for direct execution
    _run_tests()

