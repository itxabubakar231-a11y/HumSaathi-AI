import httpx
import json
import time

BASE_PROD = "https://hum-saathi-ai.vercel.app"

def test_production_oauth_and_auth_security():
    print(f"=== COMPREHENSIVE PRODUCTION & AUTH SECURITY VERIFICATION ===")
    print(f"Target: {BASE_PROD}\n")

    results = {}

    # 1. Production Health Check
    try:
        r = httpx.get(f"{BASE_PROD}/api/health", timeout=15)
        assert r.status_code == 200, f"Status: {r.status_code}"
        body = r.json()
        assert body.get("success") is True
        print(f"[PASS] 1. GET /api/health -> 200 OK | status={body['data']['status']}")
        results["health_check"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 1. GET /api/health -> {e}")
        results["health_check"] = f"FAILED: {e}"

    # 2. Google Auth - Missing Token Validation
    try:
        r = httpx.post(f"{BASE_PROD}/api/users/auth/google", json={}, timeout=15)
        assert r.status_code == 400, f"Status: {r.status_code}"
        body = r.json()
        assert body.get("success") is False
        assert "required" in str(body.get("error", "")).lower()
        print(f"[PASS] 2. POST /api/users/auth/google (missing token) -> 400 Bad Request | error: {body['error']}")
        results["google_missing_token"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 2. POST /api/users/auth/google (missing token) -> {e}")
        results["google_missing_token"] = f"FAILED: {e}"

    # 3. Google Auth - Invalid Token Rejection
    try:
        r = httpx.post(f"{BASE_PROD}/api/users/auth/google", json={"idToken": "fake_forged_google_token_xyz987"}, timeout=15)
        assert r.status_code == 401, f"Status: {r.status_code}"
        body = r.json()
        assert body.get("success") is False
        assert "invalid" in str(body.get("error", "")).lower() or "expired" in str(body.get("error", "")).lower()
        print(f"[PASS] 3. POST /api/users/auth/google (invalid token) -> 401 Unauthorized | error: {body['error']}")
        results["google_invalid_token"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 3. POST /api/users/auth/google (invalid token) -> {e}")
        results["google_invalid_token"] = f"FAILED: {e}"

    # 4. Normal Signup (Server-Side Learner Role Enforcement)
    test_email = f"prod_learner_{int(time.time())}@example.com"
    token = None
    try:
        r = httpx.post(f"{BASE_PROD}/api/users/signup", json={
            "name": "Live Learner Production",
            "email": test_email,
            "password": "LearnerPassword987!",
            "role": "ADMIN",  # Attempted privilege escalation should be ignored
            "persona": "teen",
            "language": "en"
        }, timeout=15)
        assert r.status_code == 200, f"Status: {r.status_code} {r.text}"
        body = r.json()
        assert body.get("success") is True
        user = body["data"]["user"]
        token = body["data"]["token"]
        assert user["role"] == "learner", f"Privilege escalation succeeded! Role was: {user['role']}"
        assert user["email"] == test_email
        print(f"[PASS] 4. POST /api/users/signup -> 200 OK | user role={user['role']} (Escalation blocked)")
        results["normal_signup"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 4. POST /api/users/signup -> {e}")
        results["normal_signup"] = f"FAILED: {e}"

    # 5. Normal Login
    try:
        r = httpx.post(f"{BASE_PROD}/api/users/login", json={
            "email": test_email,
            "password": "LearnerPassword987!"
        }, timeout=15)
        assert r.status_code == 200, f"Status: {r.status_code} {r.text}"
        body = r.json()
        assert body.get("success") is True
        assert body["data"]["user"]["email"] == test_email
        token = body["data"]["token"]
        print(f"[PASS] 5. POST /api/users/login -> 200 OK | session token issued")
        results["normal_login"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 5. POST /api/users/login -> {e}")
        results["normal_login"] = f"FAILED: {e}"

    # 6. Admin Role Protection - Learner Attempting /api/admin/*
    if token:
        try:
            r = httpx.get(f"{BASE_PROD}/api/admin/users", headers={"Authorization": f"Bearer {token}"}, timeout=15)
            assert r.status_code == 403, f"Status: {r.status_code} {r.text}"
            body = r.json()
            assert body.get("success") is False
            print(f"[PASS] 6. GET /api/admin/users as Learner -> 403 Forbidden | error: {body['error']}")
            results["admin_protection"] = "PASSED"
        except Exception as e:
            print(f"[FAIL] 6. GET /api/admin/users as Learner -> {e}")
            results["admin_protection"] = f"FAILED: {e}"

    # 7. Unauthenticated Admin Attempt -> 401 Unauthorized
    try:
        r = httpx.get(f"{BASE_PROD}/api/admin/dashboard", timeout=15)
        assert r.status_code == 401, f"Status: {r.status_code}"
        print(f"[PASS] 7. GET /api/admin/dashboard (no auth) -> 401 Unauthorized")
        results["unauth_admin_protection"] = "PASSED"
    except Exception as e:
        print(f"[FAIL] 7. GET /api/admin/dashboard (no auth) -> {e}")
        results["unauth_admin_protection"] = f"FAILED: {e}"

    print("\n=== SUMMARY OF RESULTS ===")
    for k, v in results.items():
        print(f"  {k}: {v}")

if __name__ == "__main__":
    test_production_oauth_and_auth_security()
