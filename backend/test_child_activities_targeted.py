import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User, Attempt
from app.models.activity import Activity

client = TestClient(app)

def test_child_learning_activities_targeted():
    print("\n=======================================================")
    print("  TARGETED CHILD ACTIVITIES & RECENT ACTIVITY TEST SUITE")
    print("=======================================================\n")

    # 1. Letter Learning - Check Question Variety & No Immediate Duplicate Rounds
    letter_rounds = []
    for r in range(5):
        res = client.get("/api/activities/letters")
        assert res.status_code == 200
        data = res.json()["data"]["activity"]
        qs = data["content"]["questions"]
        assert len(qs) == 4
        targets = [q["correctAnswer"] for q in qs]
        letter_rounds.append(targets)
        print(f"Letter Round {r+1} Targets: {targets}")
        # Verify distractors and hints exist and are clear
        for q in qs:
            assert len(q["options"]) >= 3
            assert q["correctAnswer"] in q["options"]
            assert q["hint"] is not None and len(q["hint"]) > 0

    # Ensure rounds vary (not 5 identical rounds)
    unique_rounds = len(set(tuple(r) for r in letter_rounds))
    assert unique_rounds >= 3, f"Expected varied letter rounds, but got {unique_rounds} unique out of 5"
    print(f"[PASS] Letter Learning: High variety across rounds ({unique_rounds}/5 unique sequences)")

    # 2. Number Learning - Check Question Variety
    number_rounds = []
    for r in range(5):
        res = client.get("/api/activities/numbers")
        assert res.status_code == 200
        data = res.json()["data"]["activity"]
        qs = data["content"]["questions"]
        assert len(qs) == 4
        targets = [q["correctAnswer"] for q in qs]
        number_rounds.append(targets)
        print(f"Number Round {r+1} Targets: {targets}")
        for q in qs:
            assert len(q["options"]) >= 3
            assert q["correctAnswer"] in q["options"]
            assert q["hint"] is not None and len(q["hint"]) > 0

    unique_num_rounds = len(set(tuple(r) for r in number_rounds))
    assert unique_num_rounds >= 3, f"Expected varied number rounds, but got {unique_num_rounds} unique out of 5"
    print(f"[PASS] Number Learning: High variety across rounds ({unique_num_rounds}/5 unique sequences)")

    # 3. Shapes & Colors Learning - Check Question Variety
    shape_rounds = []
    for r in range(5):
        res = client.get("/api/activities/shapes")
        assert res.status_code == 200
        data = res.json()["data"]["activity"]
        qs = data["content"]["questions"]
        assert len(qs) == 4
        targets = [q["correctAnswer"] for q in qs]
        shape_rounds.append(targets)
        print(f"Shapes Round {r+1} Targets: {targets}")
        for q in qs:
            assert len(q["options"]) >= 3
            assert q["correctAnswer"] in q["options"]
            assert q["visual"] is not None
            assert len(q["visual"]) == len(q["options"])

    unique_shape_rounds = len(set(tuple(r) for r in shape_rounds))
    assert unique_shape_rounds >= 3, f"Expected varied shape rounds, but got {unique_shape_rounds} unique out of 5"
    print(f"[PASS] Shapes Learning: High variety across rounds ({unique_shape_rounds}/5 unique sequences)")

    # 4. Animal Matching - Check Question Variety
    animal_rounds = []
    for r in range(5):
        res = client.get("/api/activities/animals")
        assert res.status_code == 200
        data = res.json()["data"]["activity"]
        qs = data["content"]["questions"]
        assert len(qs) == 4
        targets = [q["correctAnswer"] for q in qs]
        animal_rounds.append(targets)
        print(f"Animal Round {r+1} Targets: {targets}")
        for q in qs:
            assert len(q["options"]) >= 3
            assert q["correctAnswer"] in q["options"]
            assert q["visualPrompt"]["type"] == "animal"
            assert "icon" in q["visualPrompt"]

    unique_animal_rounds = len(set(tuple(r) for r in animal_rounds))
    assert unique_animal_rounds >= 3, f"Expected varied animal rounds, but got {unique_animal_rounds} unique out of 5"
    print(f"[PASS] Animal Matching: High variety across rounds ({unique_animal_rounds}/5 unique sequences)")

    # 5. Recent Activity Persistence Trace Test
    # Setup test child user
    res_user = client.post("/api/users/setup", json={
        "name": "TargetedTestChild",
        "persona": "child",
        "language": "en",
        "sensory": {
            "sound": True,
            "calmMode": False
        },
        "parentPin": "1234"
    })
    assert res_user.status_code == 200
    user_id = res_user.json()["data"]["user"]["id"]
    print(f"\n[SETUP] Created test child user: {user_id}")

    # Complete Letter Activity
    res_letters = client.get("/api/activities/letters")
    letter_qs = res_letters.json()["data"]["activity"]["content"]["questions"]
    letter_answers = [
        {"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1}
        for q in letter_qs
    ]
    res_sub1 = client.post(f"/api/attempts/{user_id}/submit", json={
        "activityId": "letters",
        "answers": letter_answers,
        "timeMs": 15000
    })
    assert res_sub1.status_code == 200
    print("[PASS] Submitted 1st activity: Letters (100% score)")

    # Check Dashboard Recent Activity
    res_dash1 = client.get(f"/api/dashboard/{user_id}")
    assert res_dash1.status_code == 200
    recent1 = res_dash1.json()["data"]["dashboard"]["recentAttempts"]
    assert len(recent1) == 1
    assert recent1[0]["topic"] == "letters"
    assert recent1[0]["score"] == 100
    assert recent1[0]["title"] != ""
    print(f"[PASS] Recent Activity #1 in Dashboard: '{recent1[0]['title']}' (Score: {recent1[0]['score']}%, Stars: {recent1[0]['starsAwarded']})")

    # Complete Number Activity
    res_numbers = client.get("/api/activities/numbers")
    number_qs = res_numbers.json()["data"]["activity"]["content"]["questions"]
    number_answers = [
        {"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1}
        for q in number_qs
    ]
    res_sub2 = client.post(f"/api/attempts/{user_id}/submit", json={
        "activityId": "numbers",
        "answers": number_answers,
        "timeMs": 18000
    })
    assert res_sub2.status_code == 200
    print("[PASS] Submitted 2nd activity: Numbers (100% score)")

    # Check Dashboard Recent Activity has both, newest first
    res_dash2 = client.get(f"/api/dashboard/{user_id}")
    assert res_dash2.status_code == 200
    recent2 = res_dash2.json()["data"]["dashboard"]["recentAttempts"]
    assert len(recent2) == 2
    assert recent2[0]["topic"] == "numbers"
    assert recent2[1]["topic"] == "letters"
    print(f"[PASS] Recent Activity #2 in Dashboard: Most recent '{recent2[0]['title']}', previous '{recent2[1]['title']}'")

    # Complete Animal Activity
    res_animals = client.get("/api/activities/animals")
    animal_qs = res_animals.json()["data"]["activity"]["content"]["questions"]
    animal_answers = [
        {"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1}
        for q in animal_qs
    ]
    res_sub3 = client.post(f"/api/attempts/{user_id}/submit", json={
        "activityId": "animals",
        "answers": animal_answers,
        "timeMs": 12000
    })
    assert res_sub3.status_code == 200
    print("[PASS] Submitted 3rd activity: Animals (100% score)")

    # Check Dashboard Recent Activity has 3 entries
    res_dash3 = client.get(f"/api/dashboard/{user_id}")
    assert res_dash3.status_code == 200
    recent3 = res_dash3.json()["data"]["dashboard"]["recentAttempts"]
    assert len(recent3) == 3
    assert recent3[0]["topic"] == "animals"
    assert recent3[1]["topic"] == "numbers"
    assert recent3[2]["topic"] == "letters"
    print(f"[PASS] Recent Activity #3 in Dashboard: 3 chronological attempts persisted correctly.")

    print("\n=======================================================")
    print("  ALL TARGETED CHILD TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_child_learning_activities_targeted()
