import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

u_res = client.post("/api/users/setup", json={
    "name": "Production Test User",
    "persona": "teen",
    "language": "en",
    "sensoryPrefs": {"textSize": "medium", "calmMode": False}
})
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
        res = client.get(ep)
    else:
        res = client.post(ep, json=payload)
    
    assert res.status_code == 200, f"Failed on {ep}: {res.status_code} {res.text}"
    body = res.json()
    assert body.get("success") is True, f"Unsuccessful on {ep}: {body}"
    print(f"[PASS] {method} {ep} -> 200 OK | success={body.get('success')}")

print("\nALL REQUIRED PRODUCTION ENDPOINTS VERIFIED SUCCESSFULLY!")
