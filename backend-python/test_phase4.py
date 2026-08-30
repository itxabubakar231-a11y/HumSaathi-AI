import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def _run_tests():
    print("\n--- STARTING PHASE 4 AUTHENTICATION & USER PROFILE TESTS ---\n")
    
    # 1. Setup new user
    setup_payload = {
        "name": "Fatima Ahmed",
        "persona": "child",
        "language": "ur_rm",
        "sensoryPrefs": {
            "textSize": "large",
            "calmMode": True,
            "soundEnabled": True,
        },
    }
    res_setup = client.post("/api/users/setup", json=setup_payload)
    assert res_setup.status_code == 200
    data_setup = res_setup.json()
    assert data_setup["success"] is True
    user = data_setup["data"]["user"]
    user_id = user["id"]
    assert user["name"] == "Fatima Ahmed"
    assert user["persona"] == "child"
    assert user["language"] == "ur_rm"
    assert user["sensoryPrefs"]["textSize"] == "large"
    print(f"[PASS] POST /api/users/setup (Created user: {user['name']} with ID {user_id})")

    # 2. Get user by ID
    res_get = client.get(f"/api/users/{user_id}")
    assert res_get.status_code == 200
    assert res_get.json()["data"]["user"]["id"] == user_id
    print(f"[PASS] GET /api/users/{user_id} verified")

    # 3. Update existing user via setup
    update_payload = {
        "userId": user_id,
        "name": "Fatima A. (Updated)",
        "persona": "teen",
        "language": "en",
        "sensoryPrefs": {
            "textSize": "medium",
            "calmMode": False,
        },
    }
    res_up = client.post("/api/users/setup", json=update_payload)
    assert res_up.status_code == 200
    up_user = res_up.json()["data"]["user"]
    assert up_user["name"] == "Fatima A. (Updated)"
    assert up_user["persona"] == "teen"
    print("[PASS] POST /api/users/setup (Update existing user verified)")

    # 4. Login by name
    res_login_name = client.post("/api/users/login", json={"name": "Fatima A. (Updated)"})
    assert res_login_name.status_code == 200
    assert res_login_name.json()["data"]["user"]["id"] == user_id
    print("[PASS] POST /api/users/login by name verified")

    # 5. Login by userId
    res_login_id = client.post("/api/users/login", json={"userId": user_id})
    assert res_login_id.status_code == 200
    assert res_login_id.json()["data"]["user"]["name"] == "Fatima A. (Updated)"
    print("[PASS] POST /api/users/login by userId verified")

    # 6. Login auto-create profile for new name
    new_name = "Zain Malik"
    res_auto = client.post("/api/users/login", json={"name": new_name})
    assert res_auto.status_code == 200
    auto_user = res_auto.json()["data"]["user"]
    assert auto_user["name"] == new_name
    assert auto_user["persona"] == "child"
    print(f"[PASS] POST /api/users/login (Auto-created profile for: {new_name})")

    # 7. List profiles (Privacy Protected - Public listing disabled)
    res_profiles = client.get("/api/users/profiles")
    assert res_profiles.status_code == 200
    profiles = res_profiles.json()["data"]["users"]
    assert len(profiles) == 0
    print("[PASS] GET /api/users/profiles (Public directory disabled for privacy)")

    # 8. Persona Switcher (Child, Teen, Adult)
    for p in ["child", "teen", "adult"]:
        res_p = client.patch(f"/api/users/{user_id}/persona", json={"persona": p})
        assert res_p.status_code == 200
        assert res_p.json()["data"]["user"]["persona"] == p
        print(f"  Switched persona to: {p}")
    print("[PASS] PATCH /api/users/{user_id}/persona (Child, Teen, Adult)")

    # 9. Invalid persona validation
    res_p_bad = client.patch(f"/api/users/{user_id}/persona", json={"persona": "superman"})
    assert res_p_bad.status_code == 400
    assert res_p_bad.json()["success"] is False
    print("[PASS] PATCH /api/users/{user_id}/persona (Invalid persona -> 400 Bad Request)")

    # 10. Sensory Preferences update
    res_sens = client.patch(f"/api/users/{user_id}/sensory", json={
        "highContrast": True,
        "reducedMotion": True,
        "textSize": "xlarge",
    })
    assert res_sens.status_code == 200
    sens_user = res_sens.json()["data"]["user"]
    assert sens_user["sensoryPrefs"]["highContrast"] is True
    assert sens_user["sensoryPrefs"]["reducedMotion"] is True
    assert sens_user["sensoryPrefs"]["textSize"] == "xlarge"
    print("[PASS] PATCH /api/users/{user_id}/sensory (High contrast, reduced motion, text size)")

    # 11. Nonexistent user 404
    res_404 = client.get("/api/users/nonexistent_user_99999")
    assert res_404.status_code == 404
    assert res_404.json()["success"] is False
    print("[PASS] GET /api/users/nonexistent 404")

    print("\n--- ALL PHASE 4 AUTHENTICATION & USER TESTS PASSED! ---\n")


# Pytest wrapper for Phase 4 authentication tests
def test_phase4():
    """Execute Phase 4 authentication & user profile tests via pytest.

    Calls the existing ``run_tests`` function so that all assertions are
    evaluated. The original ``if __name__ == '__main__'`` block is retained
    for manual execution.
    """
    _run_tests()

if __name__ == "__main__":
    # Preserve original behaviour for direct execution
    _run_tests()

