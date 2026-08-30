import urllib.request
import json
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "https://hum-saathi-ai.vercel.app"

print("--- STARTING REAL LEARNER ACTIVITY E2E VERIFICATION ---")

# 1. Sign up a new real test learner
learner_email = f"learner_test_{int(time.time())}@example.com"
learner_pw = "LearnerSecret123!"
print(f"\n1. Creating real learner: {learner_email}")

req_signup = urllib.request.Request(
    f"{BASE_URL}/api/users/signup",
    data=json.dumps({
        "name": "Sarah Khan",
        "email": learner_email,
        "password": learner_pw,
        "persona": "child",
        "language": "en"
    }).encode(),
    headers={"Content-Type": "application/json"}
)
res_signup = urllib.request.urlopen(req_signup)
signup_data = json.loads(res_signup.read().decode())
learner_token = signup_data["data"]["token"]
learner_id = signup_data["data"]["user"]["id"]
print(f"✅ Signed up learner ID: {learner_id} (Persona: {signup_data['data']['user']['persona']})")

# 2. Learner starts a conversation session
print("\n2. Learner starts practice scenario: 'scenario_teacher_help'")
req_start = urllib.request.Request(
    f"{BASE_URL}/api/conversations/start",
    data=json.dumps({
        "scenarioId": "scenario_teacher_help",
        "mode": "text"
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {learner_token}"}
)
res_start = urllib.request.urlopen(req_start)
start_data = json.loads(res_start.read().decode())
session_id = start_data["data"]["session"]["id"]
print(f"✅ Conversation session created ID: {session_id}")

# 3. Learner sends message
print("\n3. Learner sends response turn...")
req_msg = urllib.request.Request(
    f"{BASE_URL}/api/conversations/{session_id}/message",
    data=json.dumps({
        "message": "Excuse me teacher, I am having trouble with question 3 on the worksheet."
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {learner_token}"}
)
res_msg = urllib.request.urlopen(req_msg)
msg_data = json.loads(res_msg.read().decode())
print(f"✅ AI Coach Response: {msg_data['data']['response'][:60]}... (Turn: {msg_data['data']['session']['turnCount']})")

# 4. Learner completes conversation & evaluates
print("\n4. Learner completes session & requests evaluation...")
req_end = urllib.request.Request(
    f"{BASE_URL}/api/conversations/{session_id}/end",
    headers={"Authorization": f"Bearer {learner_token}"},
    method="POST"
)
urllib.request.urlopen(req_end)

req_eval = urllib.request.Request(
    f"{BASE_URL}/api/evaluations/conversation",
    data=json.dumps({
        "sessionId": session_id
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {learner_token}"}
)
res_eval = urllib.request.urlopen(req_eval)
eval_data = json.loads(res_eval.read().decode())
score = eval_data["data"]["evaluation"]["overallScore"]
print(f"✅ Conversation evaluated. Score: {score}%, Feedback: {eval_data['data']['evaluation']['feedback'][:60]}...")

# 5. Learner submits an activity attempt
print("\n5. Learner submits an activity attempt (letters)...")
req_attempt = urllib.request.Request(
    f"{BASE_URL}/api/attempts/{learner_id}/submit",
    data=json.dumps({
        "activityId": "letters",
        "answers": [
            {"questionIndex": 0, "selectedOption": 0, "timeMs": 2500, "attemptsUsed": 1},
            {"questionIndex": 1, "selectedOption": 1, "timeMs": 3000, "attemptsUsed": 1},
            {"questionIndex": 2, "selectedOption": 0, "timeMs": 2800, "attemptsUsed": 1}
        ],
        "timeMs": 8300
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {learner_token}"}
)
res_attempt = urllib.request.urlopen(req_attempt)
att_data = json.loads(res_attempt.read().decode())
print(f"✅ Activity Attempt submitted. Score: {att_data['data']['attempt']['score']}%, Stars: {att_data['data']['attempt']['starsAwarded']}")

# 6. Verify Admin can observe this exact user's real data
print("\n6. Logging in as Admin to verify observability...")
req_admin_login = urllib.request.Request(
    f"{BASE_URL}/api/users/login",
    data=json.dumps({"email": "admin@humsaathi.ai", "password": "AdminPassword123!"}).encode(),
    headers={"Content-Type": "application/json"}
)
res_admin = urllib.request.urlopen(req_admin_login)
admin_token = json.loads(res_admin.read().decode())["data"]["token"]

# Check User Detail API
req_detail = urllib.request.Request(
    f"{BASE_URL}/api/admin/users/{learner_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)
res_detail = urllib.request.urlopen(req_detail)
user_detail = json.loads(res_detail.read().decode())["data"]["user"]

print("\n--- ADMIN OBSERVABILITY VERIFICATION RESULTS ---")
print(f"Learner Name: {user_detail['name']}")
print(f"Learner Email: {user_detail['email']}")
print(f"Account Status: {user_detail['isActive']} (Active)")
print(f"Last Active Timestamp: {user_detail['lastActiveAt']}")
print(f"Total Practice Sessions: {user_detail['sessionCount']} (Completed: {user_detail['completedSessions']})")
print(f"Total Activity Attempts: {user_detail['attemptCount']}")
print(f"Real Average Score: {user_detail['averageScore']}%")
print(f"Recent Activity Items in Database: {len(user_detail.get('recentActivity', []))}")
for act in user_detail.get("recentActivity", []):
    print(f" - [{act['type']}] {act['title']} (Timestamp: {act['timestamp']})")

assert user_detail["sessionCount"] >= 1, "Session count should be >= 1"
assert user_detail["completedSessions"] >= 1, "Completed sessions should be >= 1"
assert user_detail["attemptCount"] >= 1, "Attempt count should be >= 1"
assert user_detail["averageScore"] is not None, "Average score should not be null"
assert len(user_detail.get("recentActivity", [])) >= 2, "Should have both session and attempt in recent activity"

print("\n🎉 ALL REAL ACTIVITY TRACKING CHECKS PASSED WITH 100% REAL PRODUCTION DATA!")
