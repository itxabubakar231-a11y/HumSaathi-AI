import httpx
import re
import sys

BASE = "https://hum-saathi-ai.vercel.app"

def run_live_verification():
    print("================================================================")
    print("   HUMSAATHI AI - LIVE PRODUCTION VERIFICATION SUITE")
    print("================================================================")

    # -----------------------------------------------------------------
    # 1. LIVE FRONTEND ASSET & SPA REWRITE VERIFICATION
    # -----------------------------------------------------------------
    print("\n--- [1] Live Frontend Assets & SPA Routing ---")
    r_html = httpx.get(f"{BASE}/", timeout=10)
    assert r_html.status_code == 200, f"Root HTML returned {r_html.status_code}"
    assert '<div id="root"></div>' in r_html.text, "Root element missing in HTML"
    print("[PASS] GET / -> 200 OK (HTML Document loaded)")

    # Check SPA rewrites
    for route in ["/child", "/teen", "/adult", "/assessment"]:
        r_route = httpx.get(f"{BASE}{route}", timeout=10)
        assert r_route.status_code == 200, f"SPA rewrite failed for {route}"
        assert '<div id="root"></div>' in r_route.text
        print(f"[PASS] GET {route} -> 200 OK (SPA rewrite functioning)")

    # Check static assets (JS & CSS bundles)
    js_assets = re.findall(r'src="(/assets/[^"]+\.js)"', r_html.text)
    css_assets = re.findall(r'href="(/assets/[^"]+\.css)"', r_html.text)

    for a in js_assets + css_assets:
        r_asset = httpx.get(f"{BASE}{a}", timeout=10)
        assert r_asset.status_code == 200, f"Asset failed: {a}"
        print(f"[PASS] Asset {a} -> 200 OK ({len(r_asset.content)} bytes)")

    # -----------------------------------------------------------------
    # 2. HEALTH CHECK
    # -----------------------------------------------------------------
    print("\n--- [2] Health Endpoint ---")
    r_health = httpx.get(f"{BASE}/api/health", timeout=10)
    assert r_health.status_code == 200
    h_json = r_health.json()
    assert h_json["success"] is True
    print(f"[PASS] GET /api/health -> 200 OK | service={h_json['data']['service']}")

    # -----------------------------------------------------------------
    # 3. CHILD FLOW: Setup, Assessment, Foundations, Life Skills, Progress
    # -----------------------------------------------------------------
    print("\n--- [3] Child Flow: Setup, Assessment, Foundations, Life Skills ---")
    r_user = httpx.post(f"{BASE}/api/users/setup", json={
        "name": "Live Child Learner",
        "persona": "child",
        "language": "en",
        "sensoryPrefs": {"textSize": "large", "calmMode": True}
    }, timeout=10)
    assert r_user.status_code == 200
    child_id = r_user.json()["data"]["user"]["id"]
    print(f"[PASS] Child User Setup -> 200 OK (User ID: {child_id})")

    # Assessment questions
    r_aq = httpx.get(f"{BASE}/api/assessment/{child_id}/questions", timeout=10)
    assert r_aq.status_code == 200
    questions = r_aq.json()["data"]["questions"]
    assert len(questions) == 5
    print(f"[PASS] GET /api/assessment/{child_id}/questions -> 200 OK (5 questions)")

    # Assessment submit
    r_as = httpx.post(f"{BASE}/api/assessment/{child_id}/submit", json={
        "responses": [
            {"questionId": "c1", "answer": "A"},
            {"questionId": "c2", "answer": "M"},
            {"questionId": "c3", "answer": "4"},
            {"questionId": "c4", "answer": "Blue"},
            {"questionId": "c5", "answer": "3"},
        ]
    }, timeout=10)
    assert r_as.status_code == 200
    score = r_as.json()["data"]["assessment"]["score"]
    assert score == 1.0
    print(f"[PASS] POST /api/assessment/{child_id}/submit -> 200 OK (Score: {score * 100}%)")

    # Foundations Activities
    foundations = ["letters", "numbers", "colors", "shapes"]
    for f in foundations:
        rf = httpx.get(f"{BASE}/api/activities/{f}", timeout=10)
        assert rf.status_code == 200
        fdata = rf.json()
        assert fdata["success"] is True
        assert len(fdata["data"]["activity"]["content"]["questions"]) > 0
        print(f"[PASS] Foundations -> GET /api/activities/{f} -> 200 OK")

    # World Life Skills Activities
    life_skills = ["counting", "animals", "emotions", "routines"]
    for ls in life_skills:
        rls = httpx.get(f"{BASE}/api/activities/{ls}", timeout=10)
        assert rls.status_code == 200
        lsdata = rls.json()
        assert lsdata["success"] is True
        assert len(lsdata["data"]["activity"]["content"]["questions"]) > 0
        print(f"[PASS] Life Skills -> GET /api/activities/{ls} -> 200 OK")

    # Attempt Submission & Progress
    r_att = httpx.post(f"{BASE}/api/attempts/{child_id}/submit", json={
        "activityId": "letters",
        "answers": [
            {"questionId": "q1", "answer": "A", "correct": True, "attemptsUsed": 1},
            {"questionId": "q2", "answer": "B", "correct": True, "attemptsUsed": 1},
        ],
        "timeMs": 4200,
    }, timeout=10)
    assert r_att.status_code == 200, f"Attempt submit failed: {r_att.status_code} {r_att.text}"
    stars = r_att.json()["data"]["attempt"]["starsAwarded"]
    print(f"[PASS] POST /api/attempts/{child_id}/submit -> 200 OK (Stars: {stars})")

    # Adaptive Recommendation
    r_rec = httpx.post(f"{BASE}/api/dashboard/{child_id}/recommend", timeout=10)
    assert r_rec.status_code == 200
    rec_topic = r_rec.json()["data"]["recommendation"]["topic"]
    print(f"[PASS] POST /api/dashboard/{child_id}/recommend -> 200 OK (Next: {rec_topic})")

    # Learning Journey / Dashboard
    r_dash = httpx.get(f"{BASE}/api/dashboard/{child_id}", timeout=10)
    assert r_dash.status_code == 200
    d_data = r_dash.json()["data"]["dashboard"]
    assert d_data["completedCount"] >= 1
    print(f"[PASS] GET /api/dashboard/{child_id} -> 200 OK (Completed: {d_data['completedCount']}, Stars: {d_data['rewards']['totalStars']})")

    # -----------------------------------------------------------------
    # 4. AI COACH / PRACTICE SCENARIOS (CHILD / GENERAL)
    # -----------------------------------------------------------------
    print("\n--- [4] AI Coach & Practice Scenarios ---")
    r_scen = httpx.get(f"{BASE}/api/conversations/scenarios", timeout=10)
    assert r_scen.status_code == 200
    scenarios = r_scen.json()["data"]["scenarios"]
    assert len(scenarios) > 0
    sc_id = scenarios[0]["id"]
    print(f"[PASS] GET /api/conversations/scenarios -> 200 OK ({len(scenarios)} scenarios available)")

    # Start session
    r_start = httpx.post(f"{BASE}/api/conversations/start", json={
        "userId": child_id,
        "scenarioId": sc_id,
        "mode": "voice"
    }, timeout=10)
    assert r_start.status_code == 200
    session_id = r_start.json()["data"]["session"]["id"]
    print(f"[PASS] POST /api/conversations/start -> 200 OK (Session ID: {session_id})")

    # Send chat message to AI Coach
    r_msg = httpx.post(f"{BASE}/api/conversations/{session_id}/message", json={
        "userId": child_id,
        "message": "Hello, I need help ordering food please."
    }, timeout=10)
    assert r_msg.status_code == 200
    coach_reply = r_msg.json()["data"]["response"]
    assert len(coach_reply) > 0
    print(f"[PASS] POST /api/conversations/{session_id}/message -> 200 OK")
    print(f"       AI Coach Reply: \"{coach_reply[:60]}...\"")

    # End session
    r_end = httpx.post(f"{BASE}/api/conversations/{session_id}/end", timeout=10)
    assert r_end.status_code == 200
    print(f"[PASS] POST /api/conversations/{session_id}/end -> 200 OK")

    # Conversation evaluation
    r_eval = httpx.post(f"{BASE}/api/evaluation/conversation", json={
        "sessionId": session_id,
        "userId": child_id
    }, timeout=10)
    assert r_eval.status_code == 200
    overall = r_eval.json()["data"]["evaluation"]["overallScore"]
    print(f"[PASS] POST /api/evaluation/conversation -> 200 OK (Score: {overall})")

    # -----------------------------------------------------------------
    # 5. TEEN FLOW: Reading, Problem Solving, Communication, Evaluation
    # -----------------------------------------------------------------
    print("\n--- [5] Teen Flow: Modules, Evaluation, AI Coach ---")
    r_teen_user = httpx.post(f"{BASE}/api/users/setup", json={
        "name": "Live Teen Learner",
        "persona": "teen",
        "language": "en",
        "sensoryPrefs": {"textSize": "medium", "calmMode": False}
    }, timeout=10)
    assert r_teen_user.status_code == 200
    teen_id = r_teen_user.json()["data"]["user"]["id"]
    print(f"[PASS] Teen User Setup -> 200 OK (User ID: {teen_id})")

    # List Teen Modules
    r_t_mods = httpx.get(f"{BASE}/api/skills/modules/teen", timeout=10)
    assert r_t_mods.status_code == 200
    t_mods = r_t_mods.json()["data"]["modules"]
    assert len(t_mods) >= 3
    print(f"[PASS] GET /api/skills/modules/teen -> 200 OK ({len(t_mods)} Teen Modules)")

    # Evaluate Teen Reading & Vocab Solution
    r_t_eval = httpx.post(f"{BASE}/api/skills/evaluate", json={
        "userId": teen_id,
        "moduleId": "teen_reading_vocab",
        "scenarioId": "teen_rv_1",
        "optionId": "opt_rv_1"
    }, timeout=10)
    assert r_t_eval.status_code == 200
    assert r_t_eval.json()["data"]["score"] >= 0
    print(f"[PASS] POST /api/skills/evaluate (Teen Reading & Vocab) -> 200 OK")

    # -----------------------------------------------------------------
    # 6. ADULT FLOW: Functional Reading, Workplace Solving, Evaluation
    # -----------------------------------------------------------------
    print("\n--- [6] Adult Flow: Modules, Evaluation, AI Coach ---")
    r_adult_user = httpx.post(f"{BASE}/api/users/setup", json={
        "name": "Live Adult Learner",
        "persona": "adult",
        "language": "en",
        "sensoryPrefs": {"textSize": "medium", "calmMode": False}
    }, timeout=10)
    assert r_adult_user.status_code == 200
    adult_id = r_adult_user.json()["data"]["user"]["id"]
    print(f"[PASS] Adult User Setup -> 200 OK (User ID: {adult_id})")

    # List Adult Modules
    r_a_mods = httpx.get(f"{BASE}/api/skills/modules/adult", timeout=10)
    assert r_a_mods.status_code == 200
    a_mods = r_a_mods.json()["data"]["modules"]
    assert len(a_mods) >= 3
    print(f"[PASS] GET /api/skills/modules/adult -> 200 OK ({len(a_mods)} Adult Modules)")

    # Evaluate Adult Functional Reading Solution
    r_a_eval = httpx.post(f"{BASE}/api/skills/evaluate", json={
        "userId": adult_id,
        "moduleId": "adult_functional_reading",
        "scenarioId": "adult_fr_1",
        "optionId": "opt_fr_1"
    }, timeout=10)
    assert r_a_eval.status_code == 200
    assert r_a_eval.json()["data"]["score"] >= 0
    print(f"[PASS] POST /api/skills/evaluate (Adult Functional Reading) -> 200 OK")

    print("\n================================================================")
    print("   ALL PRODUCTION DEPLOYMENT CHECKS COMPLETED AND PASSED!")
    print("================================================================")

if __name__ == "__main__":
    run_live_verification()
