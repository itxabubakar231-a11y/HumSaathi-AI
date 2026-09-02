import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def _run_tests():
    print("\n--- STARTING PHASE 2 READ-ONLY TESTS ---\n")
    
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    data = res.json()
    assert data["success"] is True
    print("[PASS] GET /api/health")

    # 2. List activities
    res = client.get("/api/activities")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "activities" in data["data"]
    print(f"[PASS] GET /api/activities (found {len(data['data']['activities'])} activities)")

    # 3. Dynamic Activity fallback tests
    for topic in ["letters", "numbers", "colors", "shapes", "counting", "animals", "emotions", "routines"]:
        res = client.get(f"/api/activities/{topic}")
        print(f"  Activity '{topic}' status: {res.status_code}")

    # 4. Nonexistent Activity 404 test
    res = client.get("/api/activities/definitely_not_an_activity_123456789")
    assert res.status_code == 404
    data = res.json()
    assert data["success"] is False
    assert "error" in data
    print("[PASS] GET /api/activities/nonexistent 404")

    # 5. Skills modules - Teen & Adult
    res_teen = client.get("/api/skills/modules/teen")
    assert res_teen.status_code == 200
    data_teen = res_teen.json()
    assert data_teen["success"] is True
    assert len(data_teen["data"]["modules"]) >= 3
    print(f"[PASS] GET /api/skills/modules/teen ({len(data_teen['data']['modules'])} modules)")

    res_adult = client.get("/api/skills/modules/adult")
    assert res_adult.status_code == 200
    data_adult = res_adult.json()
    assert data_adult["success"] is True
    assert len(data_adult["data"]["modules"]) >= 3
    print(f"[PASS] GET /api/skills/modules/adult ({len(data_adult['data']['modules'])} modules)")

    # 6. Skill module details
    res_mod = client.get("/api/skills/module/teen_reading_vocab")
    assert res_mod.status_code == 200
    data_mod = res_mod.json()
    assert data_mod["success"] is True
    assert "scenarios" in data_mod["data"]["module"]
    print("[PASS] GET /api/skills/module/teen_reading_vocab")

    res_mod_404 = client.get("/api/skills/module/unknown_module_xyz")
    assert res_mod_404.status_code == 404
    assert res_mod_404.json()["success"] is False
    print("[PASS] GET /api/skills/module/unknown 404")

    # 7. Scenarios list & filters
    res_scen = client.get("/api/conversations/scenarios")
    assert res_scen.status_code == 200
    data_scen = res_scen.json()
    assert data_scen["success"] is True
    print(f"[PASS] GET /api/conversations/scenarios ({len(data_scen['data']['scenarios'])} scenarios)")

    # 8. Nonexistent scenario 404
    res_scen_404 = client.get("/api/conversations/scenarios/nonexistent_scenario_123")
    assert res_scen_404.status_code == 404
    assert res_scen_404.json()["success"] is False
    print("[PASS] GET /api/conversations/scenarios/nonexistent 404")

    # 9. Dashboard for nonexistent user
    res_dash_404 = client.get("/api/dashboard/nonexistent_user_999")
    assert res_dash_404.status_code == 404
    assert res_dash_404.json()["success"] is False
    print("[PASS] GET /api/dashboard/nonexistent_user 404")

    # 10. Progress for nonexistent user
    res_prog_404 = client.get("/api/progress/nonexistent_user_999")
    assert res_prog_404.status_code == 404
    assert res_prog_404.json()["success"] is False
    print("[PASS] GET /api/progress/nonexistent_user 404")

    # 11. Attempts recent for nonexistent user (returns empty list)
    res_att = client.get("/api/attempts/nonexistent_user_999/recent")
    assert res_att.status_code == 200
    assert res_att.json()["data"]["attempts"] == []
    print("[PASS] GET /api/attempts/nonexistent_user/recent (empty list)")

    # 12. Assessment latest for nonexistent user (returns assessment: null)
    res_ass = client.get("/api/assessment/nonexistent_user_999/latest")
    assert res_ass.status_code == 200
    assert res_ass.json()["data"]["assessment"] is None
    print("[PASS] GET /api/assessment/nonexistent_user/latest (null assessment)")

    print("\n--- ALL PHASE 2 READ-ONLY TESTS PASSED SUCCESSFULLY! ---\n")


# Pytest wrapper to execute the script style tests
def test_phase2():
    """Execute the Phase 2 read‑only test suite via pytest.

    Calls the existing ``_run_tests`` function so that all assertions are evaluated.
    The ``if __name__ == '__main__'`` guard remains for manual execution.
    """
    _run_tests()

if __name__ == "__main__":
    _run_tests()
