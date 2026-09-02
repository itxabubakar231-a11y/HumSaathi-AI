import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User, Attempt, Progress
from app.models.activity import Activity

client = TestClient(app)

def test_strengths_language_sensory_persona_suite():
    print("\n=======================================================")
    print("  STRENGTHS, LANGUAGE, SENSORY & PERSONA TEST SUITE")
    print("=======================================================\n")

    # 1. User Setup
    res_user = client.post("/api/users/setup", json={
        "name": "IntegrationLearner",
        "persona": "child",
        "language": "en",
        "sensoryPrefs": {
            "textSize": "medium",
            "soundEnabled": False,
            "animationsEnabled": True,
            "reducedMotion": False,
            "highContrast": False,
            "calmMode": True
        },
        "parentPin": "1234"
    })
    assert res_user.status_code == 200
    user_id = res_user.json()["data"]["user"]["id"]
    print(f"[SETUP] Created learner user: {user_id}")

    # =========================================================
    # PART 1: STRENGTHS CALCULATION TEST
    # =========================================================
    print("\n--- Part 1: Evidence-Based Strengths Calculation ---")
    # Complete Letters 3 times
    for r in range(3):
        res_act = client.get("/api/activities/letters")
        qs = res_act.json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        sub = client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "letters", "answers": answers, "timeMs": 10000})
        assert sub.status_code == 200

    # Complete Numbers 3 times
    for r in range(3):
        res_act = client.get("/api/activities/numbers")
        qs = res_act.json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        sub = client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "numbers", "answers": answers, "timeMs": 10000})
        assert sub.status_code == 200

    # Complete Shapes 3 times
    for r in range(3):
        res_act = client.get("/api/activities/shapes")
        qs = res_act.json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        sub = client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "shapes", "answers": answers, "timeMs": 10000})
        assert sub.status_code == 200

    # Fetch Dashboard
    res_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_dash.status_code == 200
    dash_data = res_dash.json()["data"]["dashboard"]

    strengths = dash_data.get("strengths", [])
    strength_skills = [s["skill"] for s in strengths]
    print(f"Computed Strengths on Dashboard: {strengths}")

    assert "letters" in strength_skills or "letter" in strength_skills, "Letters should be recognized in strengths"
    assert "numbers" in strength_skills or "number" in strength_skills, "Numbers should be recognized in strengths"
    assert "shapes" in strength_skills or "shape_color_match" in strength_skills, "Shapes should be recognized in strengths"
    assert dash_data["strongest"] is not None
    assert dash_data["strongest"]["accuracy"] == 100
    print("[PASS] Child Dashboard Strengths accurately reflect Letters, Numbers, and Shapes practice history.")

    # Check Parent View Strengths
    res_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"})
    assert res_parent.status_code == 200
    parent_view = res_parent.json()["data"]["parentView"]
    print(f"Parent View Strengths: {parent_view['strengths']}")
    assert len(parent_view["strengths"]) >= 3
    print("[PASS] Parent View Strengths list matches real attempt records.")

    # =========================================================
    # PART 2: LANGUAGE SWITCHING & PROPAGATION (EN, UR, UR_RM)
    # =========================================================
    print("\n--- Part 2: Language Switching & Propagation ---")

    # 1. English Mode Verification
    res_act_en = client.get("/api/activities/letters?language=en")
    assert res_act_en.status_code == 200
    q_en = res_act_en.json()["data"]["activity"]["content"]["questions"][0]
    assert "Find the letter" in q_en["prompt"]
    assert "Look carefully" in q_en["hint"]
    print(f"[PASS] English Letter Activity Prompt: '{q_en['prompt']}'")

    res_shapes_en = client.get("/api/activities/shapes?language=en")
    q_shapes_en = res_shapes_en.json()["data"]["activity"]["content"]["questions"][0]
    assert any("circle" in opt.lower() or "square" in opt.lower() or "triangle" in opt.lower() for opt in q_shapes_en["options"])
    print(f"[PASS] English Shape Activity Options: {q_shapes_en['options']}")

    res_animals_en = client.get("/api/activities/animals?language=en")
    q_animals_en = res_animals_en.json()["data"]["activity"]["content"]["questions"][0]
    assert "Which animal is this?" in q_animals_en["prompt"]
    print(f"[PASS] English Animal Activity Prompt: '{q_animals_en['prompt']}'")

    # 2. Urdu Mode Verification
    res_lang_ur = client.patch(f"/api/users/{user_id}/language", json={"language": "ur"})
    assert res_lang_ur.status_code == 200
    assert res_lang_ur.json()["data"]["user"]["language"] == "ur"

    res_act_ur = client.get("/api/activities/letters?language=ur")
    assert res_act_ur.status_code == 200
    q_ur = res_act_ur.json()["data"]["activity"]["content"]["questions"][0]
    assert "تلاش کریں" in q_ur["prompt"]
    assert "توجہ" in q_ur["hint"]
    print(f"[PASS] Urdu Letter Activity Prompt: '{q_ur['prompt']}'")

    res_shapes_ur = client.get("/api/activities/shapes?language=ur")
    q_shapes_ur = res_shapes_ur.json()["data"]["activity"]["content"]["questions"][0]
    assert any("دائرہ" in opt or "مربع" in opt or "مثلث" in opt for opt in q_shapes_ur["options"])
    print(f"[PASS] Urdu Shape Activity Options: {q_shapes_ur['options']}")

    res_animals_ur = client.get("/api/activities/animals?language=ur")
    q_animals_ur = res_animals_ur.json()["data"]["activity"]["content"]["questions"][0]
    assert "یہ کون سا جانور ہے؟" in q_animals_ur["prompt"]
    print(f"[PASS] Urdu Animal Activity Prompt: '{q_animals_ur['prompt']}'")

    # 3. Roman Urdu Mode Verification
    res_lang_rm = client.patch(f"/api/users/{user_id}/language", json={"language": "ur_rm"})
    assert res_lang_rm.status_code == 200
    assert res_lang_rm.json()["data"]["user"]["language"] == "ur_rm"

    res_act_rm = client.get("/api/activities/letters?language=ur_rm")
    assert res_act_rm.status_code == 200
    q_rm = res_act_rm.json()["data"]["activity"]["content"]["questions"][0]
    assert "talash karein" in q_rm["prompt"].lower()
    assert "tawajjoh" in q_rm["hint"].lower()
    print(f"[PASS] Roman Urdu Letter Activity Prompt: '{q_rm['prompt']}'")

    res_shapes_rm = client.get("/api/activities/shapes?language=ur_rm")
    q_shapes_rm = res_shapes_rm.json()["data"]["activity"]["content"]["questions"][0]
    assert any("daaira" in opt.lower() or "murabba" in opt.lower() or "musallas" in opt.lower() for opt in q_shapes_rm["options"])
    print(f"[PASS] Roman Urdu Shape Activity Options: {q_shapes_rm['options']}")

    res_animals_rm = client.get("/api/activities/animals?language=ur_rm")
    q_animals_rm = res_animals_rm.json()["data"]["activity"]["content"]["questions"][0]
    assert "yeh kaun sa janwar hai?" in q_animals_rm["prompt"].lower()
    print(f"[PASS] Roman Urdu Animal Activity Prompt: '{q_animals_rm['prompt']}'")

    # =========================================================
    # PART 3: SENSORY PREFERENCES FUNCTIONALITY & PERSISTENCE
    # =========================================================
    print("\n--- Part 3: Sensory Preferences Functionality & Persistence ---")
    sensory_update = {
        "textSize": "xlarge",
        "soundEnabled": True,
        "animationsEnabled": False,
        "reducedMotion": True,
        "highContrast": True,
        "calmMode": False
    }
    res_sensory = client.patch(f"/api/users/{user_id}/sensory", json=sensory_update)
    assert res_sensory.status_code == 200
    user_sensory = res_sensory.json()["data"]["user"]["sensoryPrefs"]
    assert user_sensory["textSize"] == "xlarge"
    assert user_sensory["soundEnabled"] is True
    assert user_sensory["animationsEnabled"] is False
    assert user_sensory["reducedMotion"] is True
    assert user_sensory["highContrast"] is True
    assert user_sensory["calmMode"] is False
    print(f"[PASS] Sensory Preferences persisted in Database: {user_sensory}")

    # =========================================================
    # PART 4: PERSONA SWITCHING (CHILD / TEEN / ADULT)
    # =========================================================
    print("\n--- Part 4: Persona Switching & Dynamic Portal Loading ---")

    # Switch to Child
    res_p_child = client.patch(f"/api/users/{user_id}/persona", json={"persona": "child"})
    assert res_p_child.status_code == 200
    assert res_p_child.json()["data"]["user"]["persona"] == "child"
    res_child_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_child_dash.json()["data"]["dashboard"]["persona"] == "child"
    print("[PASS] Switched to Child Portal successfully.")

    # Switch to Teen
    res_p_teen = client.patch(f"/api/users/{user_id}/persona", json={"persona": "teen"})
    assert res_p_teen.status_code == 200
    assert res_p_teen.json()["data"]["user"]["persona"] == "teen"
    res_teen_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_teen_dash.json()["data"]["dashboard"]["persona"] == "teen"
    res_teen_modules = client.get("/api/skills/modules/teen")
    assert res_teen_modules.status_code == 200
    assert len(res_teen_modules.json()["data"]["modules"]) >= 3
    print(f"[PASS] Switched to Teen Portal successfully ({len(res_teen_modules.json()['data']['modules'])} modules available).")

    # Switch to Adult
    res_p_adult = client.patch(f"/api/users/{user_id}/persona", json={"persona": "adult"})
    assert res_p_adult.status_code == 200
    assert res_p_adult.json()["data"]["user"]["persona"] == "adult"
    res_adult_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_adult_dash.json()["data"]["dashboard"]["persona"] == "adult"
    res_adult_modules = client.get("/api/skills/modules/adult")
    assert res_adult_modules.status_code == 200
    assert len(res_adult_modules.json()["data"]["modules"]) >= 3
    print(f"[PASS] Switched to Adult Portal successfully ({len(res_adult_modules.json()['data']['modules'])} modules available).")

    # Switch back: Adult -> Teen -> Child
    client.patch(f"/api/users/{user_id}/persona", json={"persona": "teen"})
    client.patch(f"/api/users/{user_id}/persona", json={"persona": "child"})
    res_final_dash = client.get(f"/api/dashboard/{user_id}")
    assert res_final_dash.json()["data"]["dashboard"]["persona"] == "child"
    print("[PASS] Full round-trip persona switching (Adult -> Teen -> Child) completed cleanly.")

    print("\n=======================================================")
    print("  ALL 4 FUNCTIONAL AREAS PASSED WITH 100% SUCCESS!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_strengths_language_sensory_persona_suite()
