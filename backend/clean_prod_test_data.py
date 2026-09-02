import urllib.request
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# 1. Login Admin
req_login = urllib.request.Request(
    'https://hum-saathi-ai.vercel.app/api/users/login',
    data=json.dumps({'email': 'admin@humsaathi.ai', 'password': 'AdminPassword123!'}).encode(),
    headers={'Content-Type': 'application/json'}
)
res_login = urllib.request.urlopen(req_login)
token = json.loads(res_login.read().decode())['data']['token']

# 2. Get all users
all_users = []
page = 1
while True:
    req_users = urllib.request.Request(
        f'https://hum-saathi-ai.vercel.app/api/admin/users?page={page}&limit=50',
        headers={'Authorization': f'Bearer {token}'}
    )
    res_users = urllib.request.urlopen(req_users)
    data = json.loads(res_users.read().decode())['data']
    users = data['users']
    all_users.extend(users)
    if page >= data['pagination']['pages']:
        break
    page += 1

print(f"Total users found in production database: {len(all_users)}")

# 3. Categorize
TEST_NAME_PATTERNS = [
    "production live auditor",
    "auditor adult",
    "auditor teen",
    "live tester",
    "live vercel teen",
    "test learner live",
    "test child coach",
    "test teen coach",
    "test adult coach",
]

TEST_EMAIL_PATTERNS = [
    "live_learner_sec_check@example.com",
    "live_2d673a@example.com",
    "intruder@test.com",
    "testlearner+",
]

real_users = []
test_artifacts = []

for u in all_users:
    name_lower = (u['name'] or '').lower().strip()
    email_lower = (u['email'] or '').lower().strip()

    is_test = False
    for pat in TEST_NAME_PATTERNS:
        if pat in name_lower:
            is_test = True
            break
    for pat in TEST_EMAIL_PATTERNS:
        if pat in email_lower:
            is_test = True
            break

    if is_test and u['role'] != 'ADMIN':
        test_artifacts.append(u)
    else:
        real_users.append(u)

print(f"\n✅ REAL PRODUCTION USERS TO PRESERVE ({len(real_users)}):")
for r in real_users:
    print(f" - [{r['role']}] {r['name']} (Email: {r['email']}, ID: {r['id']}, Persona: {r['persona']})")

print(f"\n🧹 TEST RUNNER ARTIFACTS TO CLEAN ({len(test_artifacts)}):")
for t in test_artifacts[:10]:
    print(f" - [{t['role']}] {t['name']} (Email: {t['email']}, ID: {t['id']})")
if len(test_artifacts) > 10:
    print(f" ... and {len(test_artifacts) - 10} more test runner artifacts.")

# 4. Clean up test artifacts
print("\nStarting safe removal of confirmed test artifacts...")
deleted_count = 0
for t in test_artifacts:
    req_del = urllib.request.Request(
        f'https://hum-saathi-ai.vercel.app/api/admin/users/{t["id"]}',
        headers={'Authorization': f'Bearer {token}'},
        method='DELETE'
    )
    try:
        res_del = urllib.request.urlopen(req_del)
        deleted_count += 1
    except Exception as e:
        print(f"Notice deleting {t['id']}: {e}")

print(f"✅ Successfully cleaned {deleted_count} test artifacts from production database.")

# 5. Final check
req_final = urllib.request.Request('https://hum-saathi-ai.vercel.app/api/admin/dashboard', headers={'Authorization': f'Bearer {token}'})
dash_final = json.loads(urllib.request.urlopen(req_final).read().decode())['data']
print("\n📊 UPDATED REAL PRODUCTION DASHBOARD METRICS:")
print(json.dumps(dash_final['overview'], indent=2))
