import httpx

def test_live_production_vercel_endpoints():
    BASE = "https://hum-saathi-ai.vercel.app"

    # 1. Setup user on live Vercel
    u_res = httpx.post(f"{BASE}/api/users/setup", json={
        "name": "Production Live Auditor",
        "persona": "teen",
        "language": "en",
        "sensoryPrefs": {"textSize": "medium", "calmMode": False}
    }, timeout=15)
    assert u_res.status_code == 200, f"User setup failed: {u_res.status_code}"
    user_id = u_res.json()["data"]["user"]["id"]

    endpoints = [
        ("GET", "/api/health", None),
        ("GET", "/api/activities/letters", None),
        ("GET", "/api/activities/numbers", None),
        ("GET", "/api/activities/colors", None),
        ("GET", "/api/activities/shapes", None),
        ("GET", "/api/activities/counting", None),
        ("GET", "/api/activities/animals", None),
        ("GET", "/api/activities/emotions", None),
        ("GET", "/api/activities/routines", None),
        ("GET", "/api/conversations/scenarios", None),
        ("POST", "/api/skills/evaluate", {
            "userId": user_id,
            "moduleId": "teen_reading_vocab",
            "scenarioId": "teen_rv_1",
            "optionId": "opt_rv_1"
        }),
    ]

    for method, ep, payload in endpoints:
        if method == "GET":
            r = httpx.get(f"{BASE}{ep}", timeout=15)
        else:
            r = httpx.post(f"{BASE}{ep}", json=payload, timeout=15)
        
        assert r.status_code == 200, f"Failed on {ep}: {r.status_code} {r.text}"
        body = r.json()
        assert body.get("success") is True, f"Failed on {ep}: {body}"
        print(f"[PASS] {method} {ep} -> 200 OK | success={body.get('success')}")

if __name__ == '__main__':
    test_live_production_vercel_endpoints()
