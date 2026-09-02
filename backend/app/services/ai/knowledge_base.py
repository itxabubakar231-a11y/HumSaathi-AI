from typing import Dict, Any, List, Optional
from app.services.ai.intent_classifier import IntentCategory


HUMSAATHI_PLATFORM_OVERVIEW = {
    "title": "HumSaathi AI Platform Context",
    "summary": (
        "HumSaathi (ہم ساتھی - 'We are companions') is an AI-powered communication and life-skills coaching platform "
        "built in Pakistan for neurodiverse and diverse learners across Child (ages 4-12), Teen (ages 13-17), and Adult (ages 18+) portals. "
        "It supports English, authentic Urdu (اردو رسم الخط), and Roman Urdu with voice recognition (STT), text-to-speech (TTS), "
        "sensory accommodations (calm mode, high contrast, text scaling), baseline assessments, caregiver summaries, and an admin control center."
    ),
}

CHILD_PORTAL_KNOWLEDGE = {
    "title": "Child Learning Portal Capabilities",
    "details": (
        "Child Portal (Ages 4-12): Designed for joyful foundational learning with 8 interactive activity types: "
        "1. Letters & Phonics (A-Z alphabet recognition and letter sounds) "
        "2. Numbers & Arithmetic (Basic numbers 1-20 and early math concepts) "
        "3. Color Identification (Primary and secondary colors in everyday items) "
        "4. Shapes & Geometry (Circles, squares, triangles, rectangles) "
        "5. Counting (Visual object counting with immediate positive reinforcement) "
        "6. Animal Matching (Animal names, habitats, and sounds) "
        "7. Emotion Learning (Identifying happy, sad, excited, calm feelings) "
        "8. Routine Sequencing (Morning routine, packing school bag, bedtime steps). "
        "Tone: Warm, encouraging, simple words, short sentences (1-2 lines), gentle feedback with star rewards."
    ),
}

TEEN_PORTAL_KNOWLEDGE = {
    "title": "Teen Communication & Life-Skills Portal",
    "details": (
        "Teen Portal (Ages 13-17): Focuses on real-world school and social communication: "
        "1. Group Project Discussions (Constructive idea sharing, active listening, turn-taking) "
        "2. Expressing Preferences in Social Groups (Balancing personal choices with peer consensus) "
        "3. Requesting Teacher Assignment Extensions (Polite greeting, clear rationale, proposing realistic deadlines) "
        "4. Resolving Peer Disagreements (Calm de-escalation, acknowledging opposing views, balanced compromise) "
        "5. Social Anxiety & Conversational Warmup (Approaching new classmates, introducing oneself). "
        "Tone: Relatable, educational, peer-respectful, with actionable communication feedback."
    ),
}

ADULT_PORTAL_KNOWLEDGE = {
    "title": "Adult Professional & Community Navigation Portal",
    "details": (
        "Adult Portal (Ages 18+): Equips adult learners for independent workplace and community navigation: "
        "1. Manager Clarification (Seeking brief clarifications on deliverables, task prioritization) "
        "2. Healthcare & Pharmacy Navigation (Confirming medication dosages, meal timing, doctor appointment booking) "
        "3. Shift Swap Negotiations (Polite colleague requests, offering return shifts, supervisor coordination) "
        "4. Customer Support Dispute Resolution (Account reference verification, billing dispute explanations) "
        "5. Job Interview Preparation (STAR method responses, professional introductions, salary discussions). "
        "Tone: Respectful, mature, practical, with actionable real-world communication tips."
    ),
}

EVALUATION_RUBRIC_KNOWLEDGE = {
    "title": "HumSaathi Communication Assessment Rubric",
    "details": (
        "Communication is evaluated on 7 core dimensions: "
        "1. Clarity (Is the message clear and easy to understand?) "
        "2. Confidence (Does the tone express self-assurance?) "
        "3. Relevance (Does it directly address the prompt/situation?) "
        "4. Tone (Is the tone socially and contextually appropriate?) "
        "5. Engagement (Does it invite reciprocal dialogue?) "
        "6. Listening (Did the learner acknowledge what the other speaker said?) "
        "7. Empathy (Does the learner demonstrate perspective-taking?)."
    ),
}

SENSORY_ACCESSIBILITY_KNOWLEDGE = {
    "title": "Sensory & Accessibility Accommodations",
    "details": (
        "HumSaathi includes customizable sensory controls: "
        "Calm Mode (reduced sensory stimulation, muted colors), High Contrast (enhanced readability), "
        "Text Scaling (Small, Medium, Large, Extra Large), Reduced Motion (disables intense animations), "
        "and Sound Controls (audio cues toggle, speech synthesis pitch/speed)."
    ),
}


def retrieve_relevant_knowledge(
    intent: IntentCategory,
    persona: str = "teen",
    user_message: str = "",
    scenario_id: Optional[str] = None,
) -> str:
    """
    Selectively retrieves relevant application context based on intent and persona.
    Ensures prompt token efficiency by avoiding unnecessary monolithic dumps.
    """
    msg = user_message.lower()
    selected_blocks: List[str] = []

    # If asking about HumSaathi or app features, include platform overview
    if intent == IntentCategory.PROJECT_QUESTION or any(k in msg for k in ["humsaathi", "what is this", "features", "app", "help me use"]):
        selected_blocks.append(f"### {HUMSAATHI_PLATFORM_OVERVIEW['title']}\n{HUMSAATHI_PLATFORM_OVERVIEW['summary']}")
        selected_blocks.append(f"### {SENSORY_ACCESSIBILITY_KNOWLEDGE['title']}\n{SENSORY_ACCESSIBILITY_KNOWLEDGE['details']}")

    # Persona specific knowledge
    if persona == "child" or intent == IntentCategory.CHILD_LEARNING or any(k in msg for k in ["child", "letter", "shape", "color", "count", "kid"]):
        selected_blocks.append(f"### {CHILD_PORTAL_KNOWLEDGE['title']}\n{CHILD_PORTAL_KNOWLEDGE['details']}")
    elif persona == "adult" or intent == IntentCategory.ADULT_LEARNING or any(k in msg for k in ["adult", "job", "interview", "workplace", "boss", "doctor", "pharmacy"]):
        selected_blocks.append(f"### {ADULT_PORTAL_KNOWLEDGE['title']}\n{ADULT_PORTAL_KNOWLEDGE['details']}")
    else:
        # Default teen knowledge
        selected_blocks.append(f"### {TEEN_PORTAL_KNOWLEDGE['title']}\n{TEEN_PORTAL_KNOWLEDGE['details']}")

    # Communication practice & evaluation context
    if intent in [IntentCategory.COMMUNICATION_PRACTICE, IntentCategory.SCENARIO_ROLEPLAY] or any(k in msg for k in ["score", "feedback", "rubric", "practice", "communicate"]):
        selected_blocks.append(f"### {EVALUATION_RUBRIC_KNOWLEDGE['title']}\n{EVALUATION_RUBRIC_KNOWLEDGE['details']}")

    if not selected_blocks:
        return ""

    return "\n\n".join(selected_blocks)
