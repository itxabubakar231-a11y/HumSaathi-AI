import os
import subprocess
import requests
import time

BASE_API = "http://127.0.0.1:8000/api"
FRONTEND = "http://localhost:5173"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOTS_DIR = os.path.abspath("screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def capture_url(name, url, time_budget=5000):
    out = os.path.join(SCREENSHOTS_DIR, name)
    cmd = [
        CHROME,
        "--headless=old",
        "--no-sandbox",
        "--disable-gpu",
        f"--virtual-time-budget={time_budget}",
        f"--screenshot={out}",
        "--window-size=1440,900",
        url
    ]
    subprocess.run(cmd, timeout=25)
    size = os.path.getsize(out) if os.path.exists(out) else 0
    print(f"Captured {name}: {os.path.exists(out)} ({size} bytes)")
    return out

def run():
    print("Setting up users...")
    # 1. Child
    r_c = requests.post(f"{BASE_API}/users/setup", json={
        "name": "Leo", "persona": "child", "language": "en", "sensoryPrefs": {"calmMode": True, "textSize": "medium"}
    })
    c_id = r_c.json()["data"]["user"]["id"]

    # 2. Teen
    r_t = requests.post(f"{BASE_API}/users/setup", json={
        "name": "Zayd", "persona": "teen", "language": "en", "sensoryPrefs": {"calmMode": False, "textSize": "medium"}
    })
    t_id = r_t.json()["data"]["user"]["id"]

    # 3. Adult
    r_a = requests.post(f"{BASE_API}/users/setup", json={
        "name": "Sarah", "persona": "adult", "language": "en", "sensoryPrefs": {"calmMode": False, "textSize": "medium"}
    })
    a_id = r_a.json()["data"]["user"]["id"]

    # Start a conversation for Teen so there's active session history
    r_conv = requests.post(f"{BASE_API}/conversations/start", json={
        "userId": t_id, "scenarioId": "scenario_teen_peer_dispute", "mode": "text", "language": "en"
    })
    sess_id = r_conv.json()["data"]["session"]["id"]
    requests.post(f"{BASE_API}/conversations/{sess_id}/message", json={
        "userId": t_id, "message": "I noticed the slides were distributed unevenly. Let's reorganize them together."
    })
    requests.post(f"{BASE_API}/evaluation/conversation", json={
        "sessionId": sess_id, "userId": t_id
    })

    print("Capturing screens...")
    capture_url("child_portal.png", f"{FRONTEND}/quick_auth.html?userId={c_id}&redirect=/dashboard", 5000)
    capture_url("teen_portal.png", f"{FRONTEND}/quick_auth.html?userId={t_id}&redirect=/dashboard", 5000)
    capture_url("adult_portal.png", f"{FRONTEND}/quick_auth.html?userId={a_id}&redirect=/dashboard", 5000)
    capture_url("scenarios_portal.png", f"{FRONTEND}/quick_auth.html?userId={t_id}&redirect=/scenarios", 5000)
    capture_url("conversation_portal.png", f"{FRONTEND}/quick_auth.html?userId={t_id}&redirect=/conversation/{sess_id}", 5000)
    capture_url("parent_portal.png", f"{FRONTEND}/quick_auth.html?userId={t_id}&redirect=/parent", 5500)
    print("All captures completed!")

if __name__ == "__main__":
    run()
