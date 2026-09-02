import urllib.request
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

req_login = urllib.request.Request(
    'https://hum-saathi-ai.vercel.app/api/users/login',
    data=json.dumps({'email': 'admin@humsaathi.ai', 'password': 'AdminPassword123!'}).encode(),
    headers={'Content-Type': 'application/json'}
)
res_login = urllib.request.urlopen(req_login)
token = json.loads(res_login.read().decode())['data']['token']

req_users = urllib.request.Request('https://hum-saathi-ai.vercel.app/api/admin/users?limit=50', headers={'Authorization': f'Bearer {token}'})
res_users = urllib.request.urlopen(req_users)
data = json.loads(res_users.read().decode())['data']
users = data['users']

print(f"Total users in Production DB: {data['pagination']['total']}")
print("\nFirst 30 users in Production DB:")
for u in users[:30]:
    print(f" - [{u['role']}] {u['name']} (email: {u['email']}), persona: {u['persona']}, sessions: {u['sessionCount']}, attempts: {u['attemptCount']}, lastActive: {u['lastActiveAt']}, created: {u['createdAt']}")
