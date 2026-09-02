import re
from typing import Dict, Any, List, Optional
from app.services.ai.intent_classifier import classify_intent, detect_language, IntentCategory
from app.services.ai.knowledge_base import retrieve_relevant_knowledge
from app.services.ai.conversation_policy import (
    HUMSAATHI_COACHING_SYSTEM_PROMPT,
    GENERAL_GROUNDING_POLICY,
    PRACTICE_SCOPE_POLICY,
)


_REFERENT_PRONOUNS = {
    "it", "this", "that", "these", "those",
    "ye", "yeh", "woh", "wo", "isko", "usko", "iska", "uska", "unko", "unka", "unki",
    "یہ", "وہ", "اس", "اسے", "اسکو", "انہیں"
}

_GENERIC_FOLLOWUP_PATTERNS = [
    # 1. Asking what to say / do
    r"^(?:what\s+(?:should|can|do)\s+i\s+(?:say|do)(?:\s+(?:first|next|then|now|to\s+them))?|what\s+to\s+(?:say|do)(?:\s+first)?)\b",
    # 2. What if variants (e.g. what if they ask, what if i get nervous, what if they don't respond, what if they ignore)
    r"^what\s+if\s+(?:they|she|he|i|we|someone|the\s+interviewer|that)\b",
    r"^what\s+if\s+that\s+doesn'?t\s+work\b",
    # 3. Examples and elaborations
    r"^(?:can\s+you\s+)?(?:give|show)\s+(?:me\s+)?(?:an?|another|one\s+more)\s+example\b",
    r"^(?:another\s+(?:one|example)|give\s+an?\s+example|more\s+examples?)\b",
    # 4. Simplifications
    r"^(?:make\s+it\s+(?:simpler|simple|easier|less\s+awkward|shorter|longer|more\s+polite)|simplify\s+(?:this|it)?)\b",
    # 5. Question words / short follow-ups
    r"^(?:tell\s+me\s+more|what\s+next|what\s+now|what\s+about\s+it|how\s+does\s+it\s+work|can\s+you\s+explain(?:\s+this|\s+it)?|explain\s+(?:this|it)?)\b",
    r"^(?:why|how|why\?|how\?|how\s+so\??|how\s+come\??)$",
    # 6. Urdu / Roman Urdu follow-ups
    r"^(?:misal\s+do|aur\s+batao|samjhao|isko\s+samjhao|ye\s+kaise\s+hota\s+hai|kya\s+bolun|kya\s+kahoon|phir\s+kya|ab\s+kya)\b",
]



def is_generic_followup(text: str) -> bool:
    clean = text.strip().lower()
    # Normalize trailing punctuation before regex matching
    clean_normalized = re.sub(r"[.!?,:;\"'()\[\]{}]+$", "", clean).strip()
    words = [w.strip(".,!?:;\"'()[]{}") for w in clean.split()]
    if not words:
        return True
    if any(re.search(pat, clean_normalized, re.IGNORECASE) for pat in _GENERIC_FOLLOWUP_PATTERNS):
        return True
    if any(re.search(pat, clean, re.IGNORECASE) for pat in _GENERIC_FOLLOWUP_PATTERNS):
        return True
    if len(words) <= 4:
        non_stop = [w for w in words if w not in _REFERENT_PRONOUNS and w not in {"why", "how", "what", "can", "you", "give", "me", "do", "this", "first", "say", "is", "it"}]
        if not non_stop:
            return True
    return False



def resolve_referent_anchor(history: List[Dict[str, Any]], current_message: str) -> str:
    """
    Extracts and resolves what pronouns or short follow-ups refer to based on earlier dialogue turns.
    Maintains a persistent primary topic anchor across 4+ turns of multi-turn dialogue while
    allowing explicit topic switches when the user introduces a new substantive topic.
    """
    current_clean = current_message.strip()
    words = [w.lower().strip(".,!?:;\"'()[]{}") for w in current_clean.split()]

    # Check if current message is an explicit substantive domain topic
    substantive_markers = {
        "friend", "friends", "work", "office", "interview", "manager", "boss", "teacher",
        "classmate", "class fellow", "doctor", "pharmacy", "medicine", "presentation",
        "homework", "child", "kid", "dost", "dosti", "naukri", "job", "salary", "shift"
    }
    has_substantive_content = any(m in current_clean.lower() for m in substantive_markers)

    if not is_generic_followup(current_clean) and (has_substantive_content or len(words) > 7):
        return current_clean[:240]


    # Look back in history for the latest substantive primary topic anchor (skipping intermediate generic follow-ups)
    for item in reversed(history):
        role = item.get("role")
        content = str(item.get("content", "")).strip()
        if not content:
            continue
        if role == "user":
            if not is_generic_followup(content):
                content_words = [w.lower() for w in content.split()]
                if len(content_words) >= 3 and not all(w in _REFERENT_PRONOUNS for w in content_words):
                    return content[:240]

    # Fallback to the first available non-empty user turn or current clean message
    for item in history:
        if item.get("role") == "user" and item.get("content"):
            return str(item.get("content")).strip()[:240]

    return current_clean[:240]


def assemble_context_window(
    history: List[Dict[str, Any]],
    user_message: str,
    user_persona: str = "teen",
    user_language: str = "en",
    scenario_id: Optional[str] = None,
    scenario_meta: Optional[Dict[str, Any]] = None,
    sensory_prefs: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Constructs the complete, optimized context payload for AI generation:
    1. Intent Classification
    2. Dynamic Language Resolution
    3. Topic Referent Anchor
    4. Relevant Knowledge Retrieval
    5. Structured Multi-layer System Prompt
    6. Bounded Chat History
    """
    scenario_meta = scenario_meta or {}
    is_general_chat = (scenario_id in ["scenario_general_chat", "general", "ai_coach", "assistant"] or not scenario_id)

    # 1. Detect Intent
    intent_result = classify_intent(user_message, history, scenario_id, user_persona)
    intent = intent_result["category"]

    # 2. Detect & Align Active Language
    detected_lang = detect_language(user_message, default_lang=user_language)
    active_language = detected_lang if detected_lang in ["ur", "ur_rm"] else user_language

    # 3. Resolve Referent Anchor (Persistent Primary Topic)
    topic_anchor = resolve_referent_anchor(history, user_message)

    # 4. Retrieve Relevant Application Knowledge (combining persistent topic anchor with current message)
    if topic_anchor and topic_anchor.lower() != user_message.lower():
        retrieval_query = f"{topic_anchor} {user_message}"
    else:
        retrieval_query = topic_anchor or user_message

    relevant_knowledge = retrieve_relevant_knowledge(
        intent=intent,
        persona=user_persona,
        user_message=retrieval_query,
        scenario_id=scenario_id,
    )



    # Language directives
    if active_language == "ur":
        lang_name = "Urdu (اردو Unicode script)"
        lang_directive = (
            "LANGUAGE MANDATE: Respond ONLY in authentic, grammatically correct Urdu script (اردو رسم الخط). "
            "DO NOT output English or Latin characters."
        )
    elif active_language == "ur_rm":
        lang_name = "Roman Urdu (Latin script)"
        lang_directive = (
            "LANGUAGE MANDATE: Respond ONLY in natural, conversational Roman Urdu using Latin alphabet "
            "(e.g., 'Photosynthesis wo process hai jisme paudhey sooraj ki roshni se khana banate hain.'). "
            "DO NOT use Urdu script characters. DO NOT write full English paragraphs."
        )
    else:
        lang_name = "English"
        lang_directive = "LANGUAGE MANDATE: Respond in natural, fluent, and warm English."

    # Persona Directives
    if user_persona == "child":
        persona_directive = (
            "PERSONA: Child Learner (Ages 4-12).\n"
            "- Tone: Warm, cheerful, encouraging, and playful.\n"
            "- Sentence structure: Short sentences (1-3 lines max), simple vocabulary, fun relatable analogies.\n"
            "- Zero academic jargon."
        )
    elif user_persona == "adult":
        persona_directive = (
            "PERSONA: Adult Learner (Ages 18+).\n"
            "- Tone: Respectful, mature, professional, and practical.\n"
            "- Content: Direct answers with workplace and real-world applicability."
        )
    else:
        persona_directive = (
            "PERSONA: Teen Learner (Ages 13-17).\n"
            "- Tone: Relatable, supportive, and engaging with step-by-step logic.\n"
            "- Content: High-school appropriate depth, practical examples, and communication tips."
        )

    # Construct Structured Prompt
    prompt_sections = [
        HUMSAATHI_COACHING_SYSTEM_PROMPT,
        "",
        "=== ACTIVE LEARNER CONTEXT ===",
        persona_directive,
        f"Active Language: {lang_name}",
        lang_directive,
        f"Active Topic Anchor: {topic_anchor}",
    ]

    if relevant_knowledge:
        prompt_sections.extend([
            "",
            "=== APPLICATION DOMAIN KNOWLEDGE ===",
            relevant_knowledge,
        ])

    if is_general_chat:
        prompt_sections.extend([
            "",
            "=== GENERAL ASSISTANT DIRECTIVES ===",
            "1. DIRECT RELEVANCE: Answer the user's latest query directly without generic introductions or boilerplate.",
            "2. MULTI-TURN MEMORY: Maintain continuity from previous turns. If the user uses pronouns ('it', 'this', 'ye', 'woh', 'isko'), resolve them to the Active Topic Anchor.",
            "3. ACCURACY: Provide true, verified information across science, math, coding, languages, and life skills.",
            GENERAL_GROUNDING_POLICY,
        ])
    else:
        role_str = scenario_meta.get("role", "Communication Partner")
        prompt_sections.extend([
            "",
            "=== SCENARIO ROLEPLAY DIRECTIVES ===",
            f"You are roleplaying in-character as: {role_str}",
            f"Scenario Title: {scenario_meta.get('title', '')}",
            f"Context: {scenario_meta.get('context', '')}",
            f"Learner Objectives: {scenario_meta.get('objectives', '')}",
            PRACTICE_SCOPE_POLICY,
        ])

    system_prompt = "\n".join(prompt_sections)

    # Bounded Chat History (last 16 messages)
    bounded_history = [
        {
            "role": "assistant" if item.get("role") == "assistant" else "user",
            "content": str(item.get("content", "")).strip(),
        }
        for item in history[-16:]
        if item.get("content")
    ]

    return {
        "intent": intent,
        "active_language": active_language,
        "lang_name": lang_name,
        "topic_anchor": topic_anchor,
        "system_prompt": system_prompt,
        "chat_history": bounded_history,
        "is_safe": intent_result["is_safe"],
    }
