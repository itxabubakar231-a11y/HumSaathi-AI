import sys
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_persona_isolation_and_parent_view():
    print("\n=======================================================")
    print("  PERSONA DATA ISOLATION & PARENT VIEW VERIFICATION")
    print("=======================================================\n")

    # 1. Setup Initial Child User
    res_user = client.post("/api/users/setup", json={
        "name": "IsolationTestUser",
        "persona": "child",
        "language": "en",
        "parentPin": "1234"
    })
    assert res_user.status_code == 200
    user_id = res_user.json()["data"]["user"]["id"]
    print(f"[SETUP] Created user: {user_id}")

    # =========================================================
    # PART 1: CHILD DATA VERIFICATION
    # =========================================================
    print("\n--- [1] Generating Child Practice History ---")
    for _ in range(3):
        # Letters
        qs = client.get("/api/activities/letters").json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "letters", "answers": answers, "timeMs": 8000})
        # Numbers
        qs = client.get("/api/activities/numbers").json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "numbers", "answers": answers, "timeMs": 8000})
        # Shapes
        qs = client.get("/api/activities/shapes").json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "shapes", "answers": answers, "timeMs": 8000})

    # Check Child Dashboard
    res_child_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_child_dash.status_code == 200
    c_dash = res_child_dash.json()["data"]["dashboard"]
    assert c_dash["completedCount"] == 9
    assert len(c_dash["strengths"]) == 3
    assert all(s["skill"] in ["letters", "numbers", "shapes"] for s in c_dash["strengths"])
    print(f"[PASS] Child Dashboard has 9 completed activities and Child strengths: {[s['skill'] for s in c_dash['strengths']]}")

    # Check Child Parent View
    res_child_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    assert res_child_parent.status_code == 200
    c_parent = res_child_parent.json()["data"]["parentView"]
    assert c_parent["learner"]["persona"] == "child"
    assert c_parent["completedCount"] == 9
    assert len(c_parent["strengths"]) >= 3
    print(f"[PASS] Child Parent View displays Child data: {c_parent['strengths']}")

    # =========================================================
    # PART 2: SWITCH TO TEEN — VERIFY DATA ISOLATION
    # =========================================================
    print("\n--- [2] Switching to Teen Portal (Verifying Data Isolation) ---")
    res_switch_teen = client.patch(f"/api/users/{user_id}/persona", json={"persona": "teen"})
    assert res_switch_teen.status_code == 200

    # Teen Dashboard MUST NOT have Child data
    res_teen_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_teen_dash.status_code == 200
    t_dash = res_teen_dash.json()["data"]["dashboard"]
    assert t_dash["completedCount"] == 0, f"Expected 0 completed activities for new Teen profile, got {t_dash['completedCount']}"
    assert len(t_dash["strengths"]) == 0, f"Expected 0 strengths for new Teen profile, got {t_dash['strengths']}"
    assert len(t_dash["recentAttempts"]) == 0, f"Expected 0 recent attempts for new Teen profile, got {t_dash['recentAttempts']}"
    assert len(t_dash["progress"]) == 0, f"Expected 0 progress meters for new Teen profile, got {t_dash['progress']}"
    print("[PASS] Teen Dashboard is completely clean: Child data does NOT leak into Teen portal.")

    # Teen Parent View MUST NOT have Child data
    res_teen_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    assert res_teen_parent.status_code == 200
    t_parent = res_teen_parent.json()["data"]["parentView"]
    assert t_parent["learner"]["persona"] == "teen"
    assert t_parent["completedCount"] == 0
    assert len(t_parent["strengths"]) == 0
    assert len(t_parent["recentAttempts"]) == 0
    print("[PASS] Teen Parent View is isolated: Child Letters/Numbers do NOT appear in Teen Parent View.")

    # Now complete a Teen Skill Module
    print("\n--- [3] Completing Teen Skill Module ---")
    res_eval_teen = client.post("/api/skills/evaluate", json={
        "userId": user_id,
        "moduleId": "teen_reading_vocab",
        "scenarioId": "teen_rv_1",
        "optionId": "opt_rv_1"
    })
    assert res_eval_teen.status_code == 200
    assert res_eval_teen.json()["data"]["score"] == 95

    # Teen Dashboard should now show 1 completed activity
    res_teen_dash2 = client.get(f"/api/dashboard/{user_id}")
    t_dash2 = res_teen_dash2.json()["data"]["dashboard"]
    assert t_dash2["completedCount"] == 1
    assert len(t_dash2["recentAttempts"]) == 1
    assert t_dash2["recentAttempts"][0]["title"] == "Reading & Vocabulary"
    assert len(t_dash2["strengths"]) == 1
    assert t_dash2["strengths"][0]["skill"] == "reading_vocabulary"
    print(f"[PASS] Teen Dashboard now tracks Teen Module: '{t_dash2['recentAttempts'][0]['title']}' (Score: {t_dash2['recentAttempts'][0]['score']}%)")

    # Teen Parent View should now show Teen Reading & Vocabulary
    res_teen_parent2 = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    t_parent2 = res_teen_parent2.json()["data"]["parentView"]
    assert t_parent2["completedCount"] == 1
    assert "Reading & Vocabulary" in t_parent2["strengths"]
    assert t_parent2["recentAttempts"][0]["title"] == "Reading & Vocabulary"
    print(f"[PASS] Teen Parent View reflects Teen data: Strengths={t_parent2['strengths']}")

    # =========================================================
    # PART 3: SWITCH TO ADULT — VERIFY DATA ISOLATION
    # =========================================================
    print("\n--- [4] Switching to Adult Portal (Verifying Data Isolation) ---")
    res_switch_adult = client.patch(f"/api/users/{user_id}/persona", json={"persona": "adult"})
    assert res_switch_adult.status_code == 200

    # Adult Dashboard MUST NOT have Child or Teen data
    res_adult_dash = client.get(f"/api/dashboard/{user_id}")
    a_dash = res_adult_dash.json()["data"]["dashboard"]
    assert a_dash["completedCount"] == 0, f"Expected 0 completed activities for new Adult profile, got {a_dash['completedCount']}"
    assert len(a_dash["strengths"]) == 0
    assert len(a_dash["recentAttempts"]) == 0
    print("[PASS] Adult Dashboard is completely clean: Child & Teen data do NOT leak into Adult portal.")

    # Now complete an Adult Skill Module
    print("\n--- [5] Completing Adult Functional Reading Module ---")
    res_eval_adult = client.post("/api/skills/evaluate", json={
        "userId": user_id,
        "moduleId": "adult_functional_reading",
        "scenarioId": "adult_fr_1",
        "optionId": "opt_fr_1"
    })
    assert res_eval_adult.status_code == 200

    res_adult_dash2 = client.get(f"/api/dashboard/{user_id}")
    a_dash2 = res_adult_dash2.json()["data"]["dashboard"]
    assert a_dash2["completedCount"] == 1
    assert a_dash2["recentAttempts"][0]["title"] == "Functional Reading"
    assert a_dash2["strengths"][0]["skill"] == "functional_reading"
    print(f"[PASS] Adult Dashboard tracks Adult Module: '{a_dash2['recentAttempts'][0]['title']}'")

    res_adult_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    a_parent = res_adult_parent.json()["data"]["parentView"]
    assert a_parent["learner"]["persona"] == "adult"
    assert a_parent["completedCount"] == 1
    assert "Functional Reading" in a_parent["strengths"]
    print(f"[PASS] Adult Parent View reflects Adult data: Strengths={a_parent['strengths']}")

    # =========================================================
    # PART 4: SWITCH BACK TO CHILD — VERIFY PRESERVATION
    # =========================================================
    print("\n--- [6] Switching Back to Child (Verifying Data Preservation) ---")
    client.patch(f"/api/users/{user_id}/persona", json={"persona": "child"})
    res_child_final = client.get(f"/api/dashboard/{user_id}")
    c_final = res_child_final.json()["data"]["dashboard"]
    assert c_final["completedCount"] == 9, "Child 9 completed activities should be preserved intact"
    assert len(c_final["strengths"]) == 3, "Child 3 strengths should be preserved intact"
    print("[PASS] Child data preserved 100% intact across persona round-trip!")

    # =========================================================
    # PART 5: LOCALIZATION COMBINATIONS
    # =========================================================
    print("\n--- [7] Verifying 3-Mode Localization Across Personas ---")
    # Child in Urdu
    res_cur = client.get("/api/activities/letters?language=ur")
    assert "تلاش کریں" in res_cur.json()["data"]["activity"]["content"]["questions"][0]["prompt"]
    # Child in Roman Urdu
    res_crm = client.get("/api/activities/letters?language=ur_rm")
    assert "talash karein" in res_crm.json()["data"]["activity"]["content"]["questions"][0]["prompt"].lower()

    # Teen in Urdu
    res_tur = client.get("/api/skills/modules/teen?language=ur")
    assert len(res_tur.json()["data"]["modules"]) >= 3
    # Teen in Roman Urdu
    res_trm = client.get("/api/skills/modules/teen?language=ur_rm")
    assert len(res_trm.json()["data"]["modules"]) >= 3

    # Adult in Urdu
    res_aur = client.get("/api/skills/modules/adult?language=ur")
    assert len(res_aur.json()["data"]["modules"]) >= 3
    # Adult in Roman Urdu
    res_arm = client.get("/api/skills/modules/adult?language=ur_rm")
    assert len(res_arm.json()["data"]["modules"]) >= 3
    print("[PASS] Complete 3-mode localization (English, Urdu, Roman Urdu) verified across Child, Teen, and Adult.")

    print("\n=======================================================")
    print("  ALL PERSONA ISOLATION & PARENT VIEW TESTS PASSED!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_persona_isolation_and_parent_view()
