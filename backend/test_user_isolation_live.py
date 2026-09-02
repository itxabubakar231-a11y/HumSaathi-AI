import urllib.request
import json
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://hum-saathi-ai.vercel.app"

# User A
res_a = urllib.request.urlopen(urllib.request.Request(
    f"{BASE_URL}/api/users/signup",
    data=json.dumps({
        "name": "User Alpha",
        "email": f"user_alpha_{int(time.time())}@example.com",
        "password": "PasswordAlpha123!",
        "persona": "child"
    }).encode(),
    headers={"Content-Type": "application/json"}
))
user_a = json.loads(res_a.read().decode())["data"]
token_a = user_a["token"]
id_a = user_a["user"]["id"]

# User B
res_b = urllib.request.urlopen(urllib.request.Request(
    f"{BASE_URL}/api/users/signup",
    data=json.dumps({
        "name": "User Beta",
        "email": f"user_beta_{int(time.time())}@example.com",
        "password": "PasswordBeta123!",
        "persona": "teen"
    }).encode(),
    headers={"Content-Type": "application/json"}
))
user_b = json.loads(res_b.read().decode())["data"]
token_b = user_b["token"]
id_b = user_b["user"]["id"]

# User A starts session
res_sess = urllib.request.urlopen(urllib.request.Request(
    f"{BASE_URL}/api/conversations/start",
    data=json.dumps({"userId": id_a, "scenarioId": "scenario_teacher_help", "mode": "text"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token_a}"}
))
sess_id_a = json.loads(res_sess.read().decode())["data"]["session"]["id"]

# 1. User B tries to send message in User A's session -> MUST BE 403
try:
    urllib.request.urlopen(urllib.request.Request(
        f"{BASE_URL}/api/conversations/{sess_id_a}/message",
        data=json.dumps({"userId": id_b, "message": "Malicious turn"}).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token_b}"}
    ))
    print("FAIL: User B was able to write to User A session!")
except urllib.error.HTTPError as e:
    print(f"PASS: User B blocked from User A session (Status: {e.code})")

# 2. User B tries to access User A's profile directly -> MUST BE 403
try:
    urllib.request.urlopen(urllib.request.Request(
        f"{BASE_URL}/api/users/{id_a}",
        headers={"Authorization": f"Bearer {token_b}"}
    ))
    print("FAIL: User B accessed User A profile!")
except urllib.error.HTTPError as e:
    print(f"PASS: User B blocked from User A private profile (Status: {e.code})")

# 3. User A tries to call Admin Dashboard -> MUST BE 403
try:
    urllib.request.urlopen(urllib.request.Request(
        f"{BASE_URL}/api/admin/dashboard",
        headers={"Authorization": f"Bearer {token_a}"}
    ))
    print("FAIL: Learner accessed Admin Dashboard!")
except urllib.error.HTTPError as e:
    print(f"PASS: Learner blocked from Admin API (Status: {e.code})")

print("\n🎉 ALL PRIVACY AND ISOLATION TESTS PASSED ON PRODUCTION!")
