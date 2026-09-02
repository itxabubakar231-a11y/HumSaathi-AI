import json
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

def run_actual_adult_conversation():
    db = SessionLocal()
    client = TestClient(app)
    try:
        # Create user
        uid = str(uuid.uuid4())[:8]
        user = User(
            id=f"adult_inspect_{uid}",
            email=f"adult_inspect_{uid}@test.com",
            name="Manual Live Adult Learner",
            passwordHash=hash_password("AdultPassword123!"),
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
        print("   LIVE ADULT AI COACH VERBATIM CONVERSATION TEST")
        print("   Scenario: scenario_manager_clarification (Asking Manager for Task Clarification)")
        print("==================================================================")

        # Start session
        res_start = client.post(
            "/api/conversations/start",
            json={"scenarioId": "scenario_manager_clarification", "mode": "text"},
            headers=headers,
        )
        sess_data = res_start.json().get("data", res_start.json())
        session_id = sess_data["session"]["id"]
        init_greeting = sess_data["session"]["transcript"][0]["content"]
        print(f"\n[AI Manager Opening]: \"{init_greeting}\"\n")

        turns = [
            "I'm not completely sure what you need me to do.",
            "Should I finish the report today?",
            "I also need more time for the data.",
            "I think I can finish the summary today, but the data may take until tomorrow.",
            "I'm worried I'll make a mistake.",
        ]

        for i, user_msg in enumerate(turns, 1):
            print(f"--- Turn {i} ---")
            print(f"Learner: \"{user_msg}\"")
            msg_res = client.post(
                f"/api/conversations/{session_id}/message",
                json={"message": user_msg},
                headers=headers,
            )
            msg_data = msg_res.json().get("data", msg_res.json())
            ai_reply = msg_data["response"]
            print(f"AI Manager: \"{ai_reply}\"\n")

        # Quick response test
        quick_msg = "Good morning! I have drafted the client summary. Could you clarify whether I should prioritize the financial charts or the executive brief first?"
        print("--- Quick Suggested Response Test ---")
        print(f"Learner (Quick Option Clicked): \"{quick_msg}\"")
        q_res = client.post(
            f"/api/conversations/{session_id}/message",
            json={"message": quick_msg},
            headers=headers,
        )
        q_data = q_res.json().get("data", q_res.json())
        print(f"AI Manager: \"{q_data['response']}\"\n")

        # Voice input simulation
        voice_msg = "I can finish the summary today, but I need until tomorrow for the data."
        print("--- Voice Mode Transcript Test ---")
        print(f"Learner (Spoken Voice Input): \"{voice_msg}\"")
        v_res = client.post(
            f"/api/conversations/{session_id}/message",
            json={"message": voice_msg},
            headers=headers,
        )
        v_data = v_res.json().get("data", v_res.json())
        print(f"AI Manager: \"{v_data['response']}\"\n")

        # End & evaluate
        client.post(f"/api/conversations/{session_id}/end", headers=headers)
        eval_res = client.post(
            "/api/evaluations/conversation",
            json={"sessionId": session_id},
            headers=headers,
        )
        eval_data = eval_res.json().get("data", eval_res.json())["evaluation"]
        print("==================================================================")
        print("   FINAL EVALUATION REPORT GENERATED")
        print("==================================================================")
        print(f"Overall Score: {eval_data['overallScore']}/100")
        print(f"Clarity: {eval_data['clarity']}/100 | Relevance: {eval_data['relevance']}/100 | Appropriateness: {eval_data['appropriateness']}/100")
        print(f"Communication: {eval_data['communication']}/100 | Conversation Flow: {eval_data['conversationFlow']}/100")
        print(f"Strengths: {eval_data.get('strengths')}")
        print(f"Improvements: {eval_data.get('improvements')}")
        print(f"Feedback: {eval_data.get('feedback')}")

        # Clean up inspect user
        db.delete(user)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    run_actual_adult_conversation()
