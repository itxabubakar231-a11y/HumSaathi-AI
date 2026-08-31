import sys
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_live_language_tests():
    db = SessionLocal()
    client = TestClient(app)
    try:
        uid = str(uuid.uuid4())[:8]
        user = User(
            id=f"user_live_{uid}",
            email=f"user_live_{uid}@test.com",
            name="Live Demo Learner",
            passwordHash=hash_password("DemoPassword123!"),
            role="learner",
            persona="adult",
            language="en",
            sensoryPrefs='{"calmMode": false, "reducedMotion": false}',
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        token = create_access_token(user.id)
        headers = {"Authorization": f"Bearer {token}"}

        print("==================================================================")
        print("   LIVE ACTUAL MULTILINGUAL AI RESPONSES VERIFICATION")
        print("==================================================================")

        # 1. English Test
        print("\n--- 1. English Test (scenario_teacher_help) ---")
        start_en = client.post("/api/conversations/start", json={"scenarioId": "scenario_teacher_help", "mode": "text", "language": "en"}, headers=headers)
        s_en_id = start_en.json().get("data", start_en.json())["session"]["id"]
        res_en = client.post(f"/api/conversations/{s_en_id}/message", json={"message": "I don't understand how to start this math problem.", "language": "en"}, headers=headers)
        en_output = res_en.json().get("data", res_en.json())["response"]
        print(f"Learner: \"I don't understand how to start this math problem.\"")
        print(f"AI Coach (English): \"{en_output}\"")

        # 2. Urdu Script Test
        print("\n--- 2. Urdu Script Test (scenario_teacher_help) ---")
        start_ur = client.post("/api/conversations/start", json={"scenarioId": "scenario_teacher_help", "mode": "text", "language": "ur"}, headers=headers)
        s_ur_id = start_ur.json().get("data", start_ur.json())["session"]["id"]
        res_ur = client.post(f"/api/conversations/{s_ur_id}/message", json={"message": "مجھے یہ سوال سمجھ نہیں آ رہا۔", "language": "ur"}, headers=headers)
        ur_output = res_ur.json().get("data", res_ur.json())["response"]
        print(f"Learner: \"مجھے یہ سوال سمجھ نہیں آ رہا۔\"")
        print(f"AI Coach (Urdu Script): \"{ur_output}\"")

        # 3. Roman Urdu Test
        print("\n--- 3. Roman Urdu Test (scenario_group_discussion) ---")
        start_ur_rm = client.post("/api/conversations/start", json={"scenarioId": "scenario_group_discussion", "mode": "text", "language": "ur_rm"}, headers=headers)
        s_ur_rm_id = start_ur_rm.json().get("data", start_ur_rm.json())["session"]["id"]
        res_ur_rm = client.post(f"/api/conversations/{s_ur_rm_id}/message", json={"message": "Hi, main aap logon ke group mein join ho sakta hoon?", "language": "ur_rm"}, headers=headers)
        ur_rm_output = res_ur_rm.json().get("data", res_ur_rm.json())["response"]
        print(f"Learner: \"Hi, main aap logon ke group mein join ho sakta hoon?\"")
        print(f"AI Classmate (Roman Urdu): \"{ur_rm_output}\"")

        # 4. Adult Urdu Test
        print("\n--- 4. Adult Urdu Test (scenario_manager_clarification) ---")
        start_adult = client.post("/api/conversations/start", json={"scenarioId": "scenario_manager_clarification", "mode": "text", "language": "ur"}, headers=headers)
        s_adult_id = start_adult.json().get("data", start_adult.json())["session"]["id"]
        res_adult = client.post(f"/api/conversations/{s_adult_id}/message", json={"message": "مجھے پوری طرح واضح نہیں ہے کہ مجھے کیا کرنا ہے۔", "language": "ur"}, headers=headers)
        adult_output = res_adult.json().get("data", res_adult.json())["response"]
        print(f"Learner: \"مجھے پوری طرح واضح نہیں ہے کہ مجھے کیا کرنا ہے۔\"")
        print(f"AI Manager (Urdu Script): \"{adult_output}\"")

        # Clean up
        db.delete(user)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    run_live_language_tests()
