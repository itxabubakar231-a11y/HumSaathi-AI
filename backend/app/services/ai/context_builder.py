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
    "ye", "yeh", "woh", "wo", "isko", "usko", "iska", "uska",
    "یہ", "وہ", "اس", "اسے", "اسکو"
}


def resolve_referent_anchor(history: List[Dict[str, Any]], current_message: str) -> str:
    """
    Extracts and resolves what pronouns or short follow-ups refer to based on earlier dialogue turns.
    Example:
      Turn 1 (User): "What is photosynthesis?"
      Turn 2 (Assistant): "Photosynthesis is the process..."
      Turn 3 (User): "ye kaise hota hai?"
      -> Resolves anchor: "photosynthesis (from recent turn: 'What is photosynthesis?')"
    """
    current_clean = current_message.strip()
    words = [w.lower().strip(".,!?:;\"'()[]{}") for w in current_clean.split()]

    # If the user message is requesting an example, explanation, or uses pronouns/follow-ups
    has_pronoun = any(w in _REFERENT_PRONOUNS for w in words)
    has_request = any(k in current_clean.lower() for k in ["example", "misal", "explain", "samjhao", "how does", "is it", "why", "kyun", "kaise"])
    is_followup = len(words) <= 8 or has_pronoun or has_request

    if not is_followup and len(words) > 5:
        return current_clean[:240]

    # Look back in history for the last substantial user query or assistant topic
    for item in reversed(history):
        role = item.get("role")
        content = str(item.get("content", "")).strip()
        if not content:
            continue
        if role == "user":
            content_words = [w.lower() for w in content.split()]
            if len(content_words) >= 3 and not all(w in _REFERENT_PRONOUNS for w in content_words):
                return content[:240]

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

    # 3. Resolve Referent Anchor
    topic_anchor = resolve_referent_anchor(history, user_message)

    # 4. Retrieve Relevant Application Knowledge
    relevant_knowledge = retrieve_relevant_knowledge(
        intent=intent,
        persona=user_persona,
        user_message=user_message,
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
