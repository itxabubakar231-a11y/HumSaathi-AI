import httpx
import json

BASE = "https://hum-saathi-ai.vercel.app"

def audit_production():
    print(f"=== AUDITING PRODUCTION ENDPOINTS ON {BASE} ===")
    
    # 1. Health check
    try:
        r = httpx.get(f"{BASE}/api/health", timeout=15)
        print(f"1. GET /api/health -> Status {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"1. GET /api/health -> FAILED: {e}")

    # 2. Test /api/users/auth/google with missing token (expecting 400 Bad Request)
    try:
        r = httpx.post(f"{BASE}/api/users/auth/google", json={}, timeout=15)
        print(f"2. POST /api/users/auth/google (empty body) -> Status {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"2. POST /api/users/auth/google -> FAILED: {e}")

    # 3. Test /api/users/auth/google with invalid fake token (expecting 401 Unauthorized)
    try:
        r = httpx.post(f"{BASE}/api/users/auth/google", json={"idToken": "invalid_fake_google_jwt_token_12345"}, timeout=15)
        print(f"3. POST /api/users/auth/google (invalid token) -> Status {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"3. POST /api/users/auth/google -> FAILED: {e}")

    # 4. Test normal signup
    test_email = f"prod_test_{hex(abs(hash(str(httpx))))[2:]}@example.com"
    try:
        r = httpx.post(f"{BASE}/api/users/signup", json={
            "name": "Production Test User",
            "email": test_email,
            "password": "Password123!",
            "persona": "teen"
        }, timeout=15)
        print(f"4. POST /api/users/signup -> Status {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"4. POST /api/users/signup -> FAILED: {e}")

    # 5. Test normal login
    try:
        r = httpx.post(f"{BASE}/api/users/login", json={
            "email": test_email,
            "password": "Password123!"
        }, timeout=15)
        print(f"5. POST /api/users/login -> Status {r.status_code}: {r.text[:120]}")
        token = r.json().get("data", {}).get("token")
        
        # 6. Test learner attempting admin endpoint (expecting 403 Forbidden)
        if token:
            r_admin = httpx.get(
                f"{BASE}/api/admin/users",
                headers={"Authorization": f"Bearer {token}"},
                timeout=15
            )
            print(f"6. GET /api/admin/users as learner -> Status {r_admin.status_code}: {r_admin.text[:120]}")
    except Exception as e:
        print(f"5/6. Login/Admin test -> FAILED: {e}")

if __name__ == "__main__":
    audit_production()
