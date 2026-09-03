import json
import logging
import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User, Progress
from app.models.conversation import CommunicationScenario, ConversationSession, ConversationEvaluation
from app.schemas.common import parse_json, stringify_json
from app.services.ai.ai_service import call_ai_chat, is_ai_available

logger = logging.getLogger("humsaathi-evaluation")

FALLBACK_FEEDBACKS = {
    'adult': {
        'en': {
            'feedback': "You demonstrated clear, professional communication throughout this workplace interaction. You maintained constructive dialogue, asked relevant questions, and clarified practical next steps effectively.",
            'strengths': [
                "Maintained professional workplace tone",
                "Directly addressed key priorities and deadlines",
                "Constructive problem-solving approach",
            ],
            'improvements': [
                "Continue practicing proactive timeline adjustments",
                "Confirm final action items clearly before concluding",
            ],
            'betterResponse': "Good morning. I've drafted the client summary. Could you clarify whether I should prioritize the financial charts or executive brief first?",
        },
        'ur': {
            'feedback': "آپ نے اس گفتگو کے دوران واضح اور پیشہ ورانہ انداز اپنایا۔ آپ نے اہم معاملات پر بات کی اور اگلے عملی اقدامات کی موثر انداز میں تصدیق کی۔",
            'strengths': [
                "پیشہ ورانہ اور شائستہ دفتری انداز",
                "ترجیحات اور ڈیڈ لائنز کا واضح جائزہ",
                "مسئلہ حل کرنے کا مثبت طریقہ کار",
            ],
            'improvements': [
                "وقت کے شیڈول پر پیشگی بات چیت کی مشق جاری رکھیں",
                "گفتگو ختم کرنے سے پہلے حتمی لائحہ عمل واضح کریں",
            ],
            'betterResponse': "صبح بخیر! میں نے کلائنٹ سمری کا مسودہ تیار کر لیا ہے۔ کیا آپ واضح کر سکتے ہیں کہ پہلے مالیاتی چارٹس پر کام کروں یا ایگزیکٹو بریف پر؟",
        },
        'ur_rm': {
            'feedback': "Aap ne clear aur professional communication ka muzahira kiya. Important points discuss kiye aur practical next steps efficiently confirm kiye.",
            'strengths': [
                "Professional workplace tone maintain kiya",
                "Priorities aur deadlines ko clearly address kiya",
                "Constructive problem-solving approach",
            ],
            'improvements': [
                "Proactive timeline adjustment ki practice jari rakhein",
                "Final action items conclude karne se pehle confirm karein",
            ],
            'betterResponse': "Good morning! Main ne client summary draft kar li hai. Kya aap clarify kar sakte hain ke pehle financial charts complete karoon ya executive brief?",
        },
    },
    'teen': {
        'en': {
            'feedback': "Great job communicating with your peer! You joined the discussion smoothly, shared your ideas, and kept the conversation positive and collaborative.",
            'strengths': [
                "Friendly and approachable peer tone",
                "Shared relevant ideas and experience",
                "Kept the conversation active and engaging",
            ],
            'improvements': [
                "Ask follow-up questions to invite other classmates' opinions",
                "Propose specific tasks you'd like to help with",
            ],
            'betterResponse': "Thanks! I'd love to join. Which topic or chapter are you guys focusing on first?",
        },
        'ur': {
            'feedback': "اپنے ساتھی کے ساتھ بات چیت کا شاندار مظاہرہ! آپ گفتگو میں آسانی سے شامل ہوئے، اپنے خیالات پیش کیے اور مثبت ماحول برقرار رکھا۔",
            'strengths': [
                "دوستانہ اور خوشگوار انداز",
                "موضوع کے مطابق خیالات کا اظہار",
                "بات چیت کو فعال اور دلچسپ رکھا",
            ],
            'improvements': [
                "دوسرے ساتھیوں کی رائے جاننے کے لیے مزید سوالات پوچھیں",
                "مخصوص ذمہ داری سنبھالنے کی پیشکش کریں",
            ],
            'betterResponse': "شکریہ! مجھے آپ کے گروپ میں شامل ہو کر خوشی ہوگی۔ آپ سب پہلے کس موضوع پر کام کر رہے ہیں؟",
        },
        'ur_rm': {
            'feedback': "Classmate ke sath bohot achi conversation rahi! Aap ne smooth entry li, ideas share kiye aur collaborative discussion maintain ki.",
            'strengths': [
                "Friendly aur natural peer tone",
                "Relevant points aur experience share kiya",
                "Engaging group participation",
            ],
            'improvements': [
                "Classmates ki opinion lene ke liye follow-up questions poochein",
                "Specific task offer karne ki practice karein",
            ],
            'betterResponse': "Thanks! Main zaroor join karna chahoonga. Aap log pehle kis topic par focus kar rahe hain?",
        },
    },
    'child': {
        'en': {
            'feedback': "You did a wonderful job talking and asking for help! You expressed yourself clearly and politely. Remember, speaking up is a great way to learn and grow.",
            'strengths': [
                "Polite and respectful greeting",
                "Answered the questions directly",
                "Followed the flow of the conversation",
            ],
            'improvements': [
                "Try adding a bit more detail when explaining what you need",
                "Practice using clear and simple words",
            ],
            'betterResponse': "Excuse me, Teacher. Could you please show me how to solve question number 3?",
        },
        'ur': {
            'feedback': "آپ نے استاد سے بات کرنے کا بہترین کام کیا! آپ نے اپنے خیالات کا اظہار واضح اور شائستگی سے کیا۔ یاد رکھیں، بولنا سیکھنے اور آگے بڑھنے کا ایک بہترین طریقہ ہے۔",
            'strengths': [
                "شائستہ اور احترام والا سلام",
                "سوالات کا براہ راست جواب دیا",
                "بات چیت کے بہاؤ پر عمل کیا",
            ],
            'improvements': [
                "جب آپ کو ضرورت ہو تو وضاحت کرتے ہوئے تھوڑی مزید تفصیل شامل کرنے کی کوشش کریں",
                "واضح اور آسان الفاظ استعمال کرنے کی مشق کریں",
            ],
            'betterResponse': "معاف کیجئے گا، ٹیچر۔ کیا آپ براہ کرم مجھے سوال نمبر 3 حل کرنے کا طریقہ دکھا سکتے ہیں؟",
        },
        'ur_rm': {
            'feedback': "Aap ne teacher se baat karne ka behtareen kaam kiya! Aap ne apne aap ko wazih aur polite tariqe se express kiya. Yaad rakhein, bolna seekhne aur grow karne ka behtareen zariya hai.",
            'strengths': [
                "Polite aur respectful greeting",
                "Sawal ka direct jawab diya",
                "Conversation flow ko maintain kiya",
            ],
            'improvements': [
                "Jab aap ko madad chahiye ho to thori mazeed detail add karne ki koshish karein",
                "Wazih aur simple words use karne ki practice karein",
            ],
            'betterResponse': "Excuse me, Teacher. Kya aap please mujhe question number 3 solve karne ka tarika dikha sakte hain?",
        },
    },
}

def get_next_recommendation(db: Session, user_id: str, last_scenario_id: str = "") -> Optional[Dict[str, Any]]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    all_scenarios = db.query(CommunicationScenario).filter(CommunicationScenario.isActive == True).all()
    if not all_scenarios:
        return None

    remaining = [s for s in all_scenarios if s.id != last_scenario_id]
    selected = random.choice(remaining) if remaining else all_scenarios[0]

    reasons = {
        'en': "To improve your conversation skills, let's practice this next:",
        'ur': "آپ کی گفتگو کی مہارت کو بہتر بنانے کے لیے، آئیے آگے اس کی مشق کریں:",
        'ur_rm': "Aap ki conversation skills behtar karne ke liye, aaiye next iski practice karein:",
    }

    user_lang = user.language or 'en'
    from app.data.scenarios import DEFAULT_SCENARIOS
    def_s = next((s for s in DEFAULT_SCENARIOS if s["id"] == selected.id), None)
    if def_s and isinstance(def_s.get("title"), dict):
        title_str = def_s["title"].get(user_lang, def_s["title"].get("en", selected.title))
    else:
        title_str = selected.title

    return {
        "scenarioId": selected.id,
        "title": title_str,
        "reason": reasons.get(user_lang, reasons['en']),
    }

async def update_progress_from_evaluation(db: Session, user_id: str, scenario_title: str, overall_score: int):
    user = db.query(User).filter(User.id == user_id).first()
    persona = user.persona if user and user.persona else "child"
    if persona == "teen":
        skill = "teen_communication"
    elif persona == "adult":
        s_lower = str(scenario_title).lower()
        if any(w in s_lower for w in ["workplace", "interview", "meeting", "disagreement", "manager", "colleague"]):
            skill = "adult_workplace_comm"
        else:
            skill = "adult_everyday_comm"
    else:
        skill = "communication"

    prog = db.query(Progress).filter(Progress.userId == user_id, Progress.skill == skill).first()

    prev_attempts = prog.attempts if prog else 0
    prev_accuracy = prog.accuracy if prog else 0.0
    new_attempts = prev_attempts + 1
    new_accuracy = ((prev_accuracy * prev_attempts) + (overall_score / 100)) / new_attempts

    if overall_score >= 80:
        level = "medium"
    elif overall_score >= 50:
        level = "easy"
    else:
        level = "beginner"

    if prog:
        prog.level = level
        prog.accuracy = new_accuracy
        prog.attempts = new_attempts
        prog.updatedAt = datetime.utcnow()
    else:
        prog = Progress(
            userId=user_id,
            skill=skill,
            level=level,
            accuracy=new_accuracy,
            attempts=1,
        )
        db.add(prog)

    db.commit()

async def evaluate_session(db: Session, session_id: str, user_id: str) -> Dict[str, Any]:
    existing_eval = db.query(ConversationEvaluation).filter(ConversationEvaluation.sessionId == session_id).first()
    if existing_eval:
        return {
            "id": existing_eval.id,
            "sessionId": existing_eval.sessionId,
            "clarity": existing_eval.clarity,
            "relevance": existing_eval.relevance,
            "appropriateness": existing_eval.appropriateness,
            "communication": existing_eval.communication,
            "conversationFlow": existing_eval.conversationFlow,
            "overallScore": existing_eval.overallScore,
            "strengths": parse_json(existing_eval.strengths, []),
            "improvements": parse_json(existing_eval.improvements, []),
            "betterResponse": existing_eval.betterResponse,
            "feedback": existing_eval.feedback,
            "createdAt": existing_eval.createdAt.isoformat() if existing_eval.createdAt else None,
        }

    session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    scenario = session.scenario or db.query(CommunicationScenario).filter(CommunicationScenario.id == session.scenarioId).first()
    language = session.language or user.language or "en"
    transcript = parse_json(session.transcript, [])

    clarity = 80
    relevance = 85
    appropriateness = 90
    communication = 80
    conversation_flow = 85
    overall_score = 84
    strengths = []
    improvements = []
    better_response = ""
    feedback_text = ""

    if is_ai_available() and len(transcript) > 1 and scenario:
        prompt = (
            f"Evaluate this role-play conversation session for a neurodiverse learner.\n"
            f"Scenario: {scenario.title}\n"
            f"Objectives: {scenario.objectives}\n"
            f"AI Role: {scenario.aiRole}\n"
            f"Learner Persona: {user.persona}\n"
            f"Language: {language}\n"
            f"Transcript: {json.dumps(transcript, indent=2)}\n\n"
            f"Please grade the learner's responses on exactly these 5 metrics (0-100 score):\n"
            f"1. Clarity (how clear/understandable)\n"
            f"2. Relevance (addressing context/situation)\n"
            f"3. Appropriateness (polite, contextual fit)\n"
            f"4. Communication (simple coherence/vocabulary)\n"
            f"5. Conversation Flow (natural turns, responses)\n\n"
            f"Also provide:\n"
            f"- Strengths (2-3 items, encouraging, simple language)\n"
            f"- Improvements (1-2 items, constructive, actionable)\n"
            f"- A better alternative response for one of the user turns.\n"
            f"- Encouraging overall feedback (max 3 short sentences, simple language, supportive tone, no medical diagnosis).\n\n"
            f"Return JSON format only:\n"
            f'{{\n  "clarity": 85,\n  "relevance": 85,\n  "appropriateness": 90,\n  "communication": 80,\n  "conversationFlow": 85,\n  "strengths": ["...", "..."],\n  "improvements": ["...", "..."],\n  "betterResponse": "<example of a better response>",\n  "feedback": "<supportive overall feedback>"\n}}'
        )

        messages = [
            {"role": "system", "content": "Return valid JSON only. Keep language simple."},
            {"role": "user", "content": prompt},
        ]

        ai_eval = await call_ai_chat(messages, temperature=0.3)
        if ai_eval and isinstance(ai_eval, dict):
            clarity = int(ai_eval.get("clarity", clarity))
            relevance = int(ai_eval.get("relevance", relevance))
            appropriateness = int(ai_eval.get("appropriateness", appropriateness))
            communication = int(ai_eval.get("communication", communication))
            conversation_flow = int(ai_eval.get("conversationFlow", conversation_flow))
            strengths = ai_eval.get("strengths") or []
            improvements = ai_eval.get("improvements") or []
            better_response = ai_eval.get("betterResponse") or ""
            feedback_text = ai_eval.get("feedback") or ""
            overall_score = round((clarity + relevance + appropriateness + communication + conversation_flow) / 5)

    if not feedback_text:
        persona_key = user.persona if user and user.persona in FALLBACK_FEEDBACKS else 'adult'
        template = FALLBACK_FEEDBACKS.get(persona_key, {}).get(language) or FALLBACK_FEEDBACKS.get(persona_key, {}).get('en') or FALLBACK_FEEDBACKS['adult']['en']
        feedback_text = template['feedback']
        strengths = template['strengths']
        improvements = template['improvements']
        better_response = template['betterResponse']

        turns = session.turnCount
        if turns < 2:
            clarity = 60
            relevance = 60
            conversation_flow = 50
        elif turns >= 4:
            clarity = 90
            relevance = 95
            conversation_flow = 90
        overall_score = round((clarity + relevance + appropriateness + communication + conversation_flow) / 5)

    eval_record = ConversationEvaluation(
        sessionId=session_id,
        clarity=clarity,
        relevance=relevance,
        appropriateness=appropriateness,
        communication=communication,
        conversationFlow=conversation_flow,
        overallScore=overall_score,
        strengths=stringify_json(strengths),
        improvements=stringify_json(improvements),
        betterResponse=better_response,
        feedback=feedback_text,
        createdAt=datetime.utcnow(),
    )
    session.completed = True
    if not session.completedAt:
        session.completedAt = datetime.utcnow()

    if user:
        user.lastActiveAt = datetime.utcnow()
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)

    await update_progress_from_evaluation(db, user_id, scenario.title if scenario else "Conversation", overall_score)

    confidence = round((appropriateness + conversation_flow) / 2)

    return {
        "id": eval_record.id,
        "sessionId": eval_record.sessionId,
        "clarity": eval_record.clarity,
        "relevance": eval_record.relevance,
        "appropriateness": eval_record.appropriateness,
        "communication": eval_record.communication,
        "conversationFlow": eval_record.conversationFlow,
        "confidence": confidence,
        "overallScore": eval_record.overallScore,
        "strengths": strengths,
        "improvements": improvements,
        "betterResponse": better_response,
        "feedback": feedback_text,
        "createdAt": eval_record.createdAt.isoformat() if eval_record.createdAt else None,
    }

def get_evaluation(db: Session, session_id: str) -> Optional[Dict[str, Any]]:
    ev = db.query(ConversationEvaluation).filter(ConversationEvaluation.sessionId == session_id).first()
    if not ev:
        return None

    confidence = round(((ev.appropriateness or 80) + (ev.conversationFlow or 80)) / 2)

    return {
        "id": ev.id,
        "sessionId": ev.sessionId,
        "clarity": ev.clarity,
        "relevance": ev.relevance,
        "appropriateness": ev.appropriateness,
        "communication": ev.communication,
        "conversationFlow": ev.conversationFlow,
        "confidence": confidence,
        "overallScore": ev.overallScore,
        "strengths": parse_json(ev.strengths, []),
        "improvements": parse_json(ev.improvements, []),
        "betterResponse": ev.betterResponse,
        "feedback": ev.feedback,
        "createdAt": ev.createdAt.isoformat() if ev.createdAt else None,
    }

