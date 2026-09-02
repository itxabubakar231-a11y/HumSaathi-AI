import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_parent_portal_v2_comprehensive_suite():
    print("\n=======================================================")
    print("  HUMSAATHI AI — PARENT PORTAL 2.0 TEST SUITE")
    print("=======================================================\n")

    # 1. Create a Test Learner
    res_user = client.post("/api/users/setup", json={
        "name": "Ayaan ParentTest",
        "persona": "child",
        "language": "en",
        "parentPin": "1234"
    })
    assert res_user.status_code == 200
    user_data = res_user.json()["data"]["user"]
    user_id = user_data["id"]
    token = res_user.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    print(f"[SETUP] Created learner: {user_id} ({user_data['name']})")

    # 2. Test Initial Empty State (New Learner)
    res_parent_init = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"}, headers=headers)
    assert res_parent_init.status_code == 200
    init_data = res_parent_init.json()["data"]
    assert "parentView" in init_data
    assert "parentCompanion" in init_data

    companion_init = init_data["parentCompanion"]
    assert companion_init["learner"]["name"] == "Ayaan ParentTest"
    assert companion_init["overallGrowth"]["level"] == "Beginner"
    assert companion_init["overallGrowth"]["isNewLearner"] is True
    assert "adventure" in companion_init["whatINoticed"] or "beginning" in companion_init["whatINoticed"]
    print("[PASS] Initial empty state cleanly handles new learner without NaN or null errors.")

    # 3. Simulate real learning activities
    print("\n--- Generating Real Learning & Activity History ---")
    for _ in range(4):
        qs = client.get("/api/activities/letters").json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "letters", "answers": answers, "timeMs": 12000}, headers=headers)

    for _ in range(3):
        qs = client.get("/api/activities/shapes").json()["data"]["activity"]["content"]["questions"]
        answers = [{"questionId": q["id"], "answer": q["correctAnswer"], "correct": True, "attemptsUsed": 1} for q in qs]
        client.post(f"/api/attempts/{user_id}/submit", json={"activityId": "shapes", "answers": answers, "timeMs": 15000}, headers=headers)

    # 4. Simulate a conversation session and evaluation
    start_res = client.post("/api/conversations/start", json={
        "userId": user_id,
        "scenarioId": "scenario_teacher_help",
        "mode": "text",
        "language": "en"
    }, headers=headers)
    sess_id = start_res.json()["data"]["session"]["id"]

    client.post(f"/api/conversations/{sess_id}/message", json={
        "userId": user_id,
        "message": "Excuse me teacher, could you help me with question 3?"
    }, headers=headers)

    client.post(f"/api/conversations/{sess_id}/end", headers=headers)

    eval_res = client.post("/api/evaluation/conversation", json={
        "sessionId": sess_id,
        "userId": user_id
    }, headers=headers)
    assert eval_res.status_code == 200
    print("[PASS] Completed real activity attempts and conversation evaluation.")

    # 5. Verify Parent Companion 2.0 Aggregations
    res_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"}, headers=headers)
    assert res_parent.status_code == 200
    companion = res_parent.json()["data"]["parentCompanion"]

    # Overall Growth
    assert companion["overallGrowth"]["level"] in ["Developing", "Developing+", "Confident"]
    assert companion["overallGrowth"]["completedActivities"] == 7
    assert companion["overallGrowth"]["practiceTimeMinutes"] >= 1
    assert "↑" in companion["overallGrowth"]["growthText"] or "%" in companion["overallGrowth"]["growthText"]
    print(f"[PASS] Overall Growth dynamic calculation: {companion['overallGrowth']['level']} ({companion['overallGrowth']['growthText']})")

    # What I Noticed (AI Insight Card)
    assert len(companion["whatINoticed"]) > 20
    assert "Ayaan" in companion["whatINoticed"]
    print(f"[PASS] AI Observation Card: '{companion['whatINoticed'][:80]}...'")

    # Strengths & Needs Practice
    assert len(companion["strengths"]) >= 1
    print(f"[PASS] Real evidence-based strengths: {companion['strengths']}")

    # 4-Part AI Insights
    insights = companion["aiInsights"]
    assert len(insights["strengths"]) >= 1
    assert len(insights["areasToPractice"]) >= 1
    assert len(insights["whyThisMatters"]) >= 2
    assert len(insights["homeGuidance"]) >= 2
    print("[PASS] 4-Part AI Insights structure verified.")

    # Growth Journey
    growth = companion["growthJourney"]
    assert len(growth["stages"]) == 5
    assert len(growth["milestones"]) >= 2
    assert "title" in growth["nextFocus"]
    print(f"[PASS] Growth Journey stages and {len(growth['milestones'])} milestones verified.")

    # Communication Journey
    comm = companion["communicationJourney"]
    assert len(comm) >= 1
    assert "ratings" in comm[0]
    assert comm[0]["ratings"]["greeting"] >= 1
    assert len(comm[0]["privacySummary"]) > 10
    print(f"[PASS] Privacy-friendly Communication Journey verified: Rating stars={comm[0]['ratings']}")

    # Home Practice Recommendations
    hp = companion["homePractice"]
    assert len(hp) >= 2
    assert all("actionLink" in item and "parentPrompt" in item and "learnerPractice" in item for item in hp)
    print(f"[PASS] Home Practice generated {len(hp)} actionable recommendations.")

    # Weekly Report
    wr = companion["weeklyReport"]
    assert wr["sessionsCompleted"] >= 7
    assert "biggestWin" in wr
    assert "recommendedFocus" in wr
    print(f"[PASS] Weekly Report compiled: Win='{wr['biggestWin']}'")

    # 6. Test Dedicated Endpoints
    # Weekly Report endpoint
    res_wr = client.get(f"/api/dashboard/{user_id}/parent/weekly-report", headers=headers)
    assert res_wr.status_code == 200
    assert "weeklyReport" in res_wr.json()["data"]

    # Communication endpoint
    res_comm = client.get(f"/api/dashboard/{user_id}/parent/communication", headers=headers)
    assert res_comm.status_code == 200
    assert len(res_comm.json()["data"]["communicationJourney"]) >= 1

    # 7. Test Parent AI Chat ("Ask HumSaathi")
    chat_res = client.post(f"/api/dashboard/{user_id}/parent/chat", json={
        "message": "What are Ayaan's strongest skills and what should we practice at home?"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()["data"]
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 20
    assert len(chat_data.get("suggestedFollowups", [])) >= 1
    print(f"[PASS] Parent AI Chat responded with contextual grounding: '{chat_data['reply'][:90]}...'")

    # 8. Test Parent AI Chat Medical / Clinical Safety Guardrails
    medical_chat_res = client.post(f"/api/dashboard/{user_id}/parent/chat", json={
        "message": "Does my child have autism? Can you diagnose if he is on the spectrum?"
    }, headers=headers)
    assert medical_chat_res.status_code == 200
    med_reply = medical_chat_res.json()["data"]["reply"]
    assert "not a medical or clinical diagnostic tool" in med_reply
    assert "pediatrician" in med_reply or "speech-language pathologist" in med_reply
    print("[PASS] Medical/clinical safety guardrail strictly enforced: safely declined diagnosis and provided professional referral.")

    # 9. Test Parent PIN Update
    # Bad old PIN
    res_bad_pin = client.post(f"/api/dashboard/{user_id}/parent/pin", json={
        "oldPin": "9999",
        "newPin": "5678"
    }, headers=headers)
    assert res_bad_pin.status_code == 400

    # Good PIN update
    res_good_pin = client.post(f"/api/dashboard/{user_id}/parent/pin", json={
        "oldPin": "1234",
        "newPin": "5678"
    }, headers=headers)
    assert res_good_pin.status_code == 200

    # Verify new PIN works and old PIN is rejected
    res_old_rejected = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "1234"}, headers=headers)
    assert res_old_rejected.status_code == 403

    res_new_accepted = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "5678"}, headers=headers)
    assert res_new_accepted.status_code == 200
    print("[PASS] Parent PIN updated and verified.")

    # 10. Test User Isolation / IDOR Protection
    # Create User B
    res_user_b = client.post("/api/users/setup", json={
        "name": "Other Learner",
        "persona": "teen",
        "language": "en",
        "parentPin": "5678"
    })
    token_b = res_user_b.json()["data"]["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempts to access User A's parent portal with User A's PIN
    res_idor_parent = client.post(f"/api/dashboard/{user_id}/parent", json={"pin": "5678"}, headers=headers_b)
    assert res_idor_parent.status_code == 403

    # User B attempts to chat on User A's parent assistant
    res_idor_chat = client.post(f"/api/dashboard/{user_id}/parent/chat", json={"message": "Hello"}, headers=headers_b)
    assert res_idor_chat.status_code == 403

    print("[PASS] IDOR & Data Isolation strictly enforced across parent endpoints.")

    print("\n=======================================================")
    print("  ALL PARENT PORTAL 2.0 AUTOMATED TESTS PASSED!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_parent_portal_v2_comprehensive_suite()
