import re
from typing import Any, Dict, Iterable, List


HUMSAATHI_COACHING_SYSTEM_PROMPT = """
CORE IDENTITY & PURPOSE:
You are HumSaathi (Urdu: "Hum" = We, "Saathi" = Friend/Companion) - an empathetic, intelligent communication coach designed to help learners practice and master interpersonal communication skills. Your mission is: Practice. Communicate. Grow.
You are a dedicated mentor invested in the learner's communication journey: celebrate progress, identify areas for improvement, and guide with patience and professionalism.

PRIMARY FUNCTIONS:
1. CONVERSATION PRACTICE: Engage in realistic dialogue scenarios (professional, personal, social, and everyday). Adapt complexity to learner persona.
2. REAL-TIME COACHING: Provide constructive, specific, encouraging observations on key dimensions: Clarity, Confidence, Relevance, Tone, Engagement, Listening, Empathy.
3. SKILL COACHING: Teach communication techniques (active listening, assertiveness, empathy, de-escalation, turn-taking). Explain why certain approaches work better.
4. PERSONALIZED GUIDANCE: Adapt to user persona (Child / Teen / Adult), language (English / Urdu / Roman Urdu), and sensory needs.

TONE & PERSONALITY:
- Warm & Encouraging: Supportive, never judgmental.
- Clear & Accessible: Simple, natural language without unnecessary jargon.
- Bilingual-Friendly: Authentic English, Urdu (اردو رسم الخط), and Roman Urdu.
- Respectful of South Asian culture and diverse neurodiverse learning styles.
- Professional yet approachable, honest, and direct.
""".strip()

GENERAL_GROUNDING_POLICY = """
ACCURACY AND GROUNDING POLICY:
- Answer the learner's latest question and use earlier messages only when they are relevant.
- Never invent facts, quotations, citations, sources, names, dates, prices, addresses, or claims of verification.
- Clearly separate established facts from estimates, opinions, or inferences. If important information is missing, ask a focused clarification.
- If you are not confident that a factual claim is correct, say so briefly instead of guessing.
- For current or time-sensitive information, explain that you cannot verify live information in this chat and recommend checking an authoritative current source.
- For medical, legal, or financial topics, provide general educational information, identify uncertainty, and recommend a qualified professional for decisions with meaningful consequences.
- Do not claim perfect or permanent memory. You may refer only to messages supplied in this conversation.
- Do not fabricate links or citations. Mention a source only when that source was actually supplied in the conversation.
""".strip()


PRACTICE_SCOPE_POLICY = """
SCENARIO GROUNDING POLICY:
- This is a closed-scope communication practice. Stay in the assigned role and current situation.
- Use only details supplied by the scenario or learner. Never invent names, prices, schedules, addresses, policies, medical instructions, or other factual details.
- If a needed detail is missing, ask a natural in-character clarification.
- If the learner switches to an unrelated subject, briefly redirect them to General Chat and immediately return to the current situation. Do not answer the unrelated question inside practice mode.
- A clarification about the current situation is on-topic and should be answered directly in character.
""".strip()


_FOLLOW_UPS = {
    "why", "why?", "how", "how?", "explain", "explain it", "tell me more",
    "what about it", "can you explain", "make it simpler", "example", "give an example",
    "kyun", "kyun?", "kaise", "kaise?", "samjhao", "mazeed batao",
}

_DOMAIN_PATTERNS = {
    "coding": (
        r"\b(?:python|javascript|typescript|react|java|c\+\+|programming|algorithm|api|sql)\b",
        r"\b(?:write|generate|show|give|create|debug|fix|explain)\b.{0,35}\b(?:code|function|program|script)\b",
    ),
    "science": (
        r"\b(?:photosynthesis|atom|molecule|chemistry|biology|physics|planet|gravity|cell division)\b",
    ),
    "mathematics": (
        r"\b(?:algebra|calculus|geometry|equation|trigonometry|quadratic)\b",
        r"\b(?:solve|calculate|differentiate|integrate)\b.{0,30}(?:\d|equation|formula)",
    ),
    "current affairs": (
        r"\b(?:latest news|breaking news|current president|prime minister|election result|today'?s news)\b",
    ),
    "finance": (
        r"\b(?:bitcoin|crypto|stock price|forex|investment advice|buy shares|sell shares)\b",
    ),
    "general knowledge": (
        r"\b(?:capital of|who invented|who discovered|when was|population of)\b",
    ),
    "writing and language": (
        r"\b(?:translate this|translation|write an essay|write a poem|cover letter|grammar check)\b",
    ),
    "career preparation": (
        r"\b(?:interview tips|interview prep|prepare for an interview|job interview|resume advice|cv advice)\b",
    ),
    "general assistant request": (
        r"\b(?:project ideas|tell me a joke|make me laugh|what is humsaathi|different from chatgpt|useful for neurodiverse|can you speak urdu|can you speak roman urdu)\b",
    ),
}

_QUESTION_OR_REQUEST = re.compile(
    r"(?:\?|\bwhat\b|\bwhy\b|\bhow\b|\bwho\b|\bwhen\b|\bwhere\b|\bexplain\b|"
    r"\bwrite\b|\bgenerate\b|\bshow me\b|\btell me\b|\bsolve\b|\bcalculate\b|"
    r"\bkya\b|\bkyun\b|\bkaise\b|\bbatao\b|\bsamjhao\b)",
    re.IGNORECASE,
)

_OPEN_SUBJECT_SCENARIOS = {"scenario_teacher_help", "scenario_teacher_confused"}


def _text(value: Any) -> str:
    if isinstance(value, dict):
        return " ".join(_text(item) for item in value.values())
    if isinstance(value, (list, tuple, set)):
        return " ".join(_text(item) for item in value)
    return str(value or "")


def detect_off_topic_request(scenario_id: str, user_message: str, scenario_details: Iterable[Any]) -> bool:
    """Conservatively detects a clear subject switch during a closed practice scenario."""
    if not scenario_id or scenario_id in _OPEN_SUBJECT_SCENARIOS:
        return False

    message = user_message.strip().lower()
    if not message or not _QUESTION_OR_REQUEST.search(message):
        return False

    scenario_text = " ".join(_text(part) for part in scenario_details).lower()
    for patterns in _DOMAIN_PATTERNS.values():
        if any(re.search(pattern, message, re.IGNORECASE) for pattern in patterns):
            # A domain explicitly established by the scenario remains on-topic.
            if not any(re.search(pattern, scenario_text, re.IGNORECASE) for pattern in patterns):
                return True
    return False


def scope_redirect(language: str) -> str:
    if language == "ur":
        return "آئیے اس مشق کو موجودہ صورتِ حال تک محدود رکھیں۔ اس سوال کے لیے بعد میں جنرل چیٹ استعمال کریں۔ اب آپ اس صورتِ حال میں آگے کیا کہنا چاہیں گے؟"
    if language == "ur_rm":
        return "Aaiye is practice ko maujooda situation tak rakhein. Is sawal ke liye baad mein General Chat use karein. Ab aap is situation mein agay kya kehna chahein ge?"
    return "Let's keep this practice focused on the current situation. You can explore that question in General Chat afterward. What would you like to say next here?"


def infer_topic_anchor(history: List[Dict[str, Any]], current_message: str) -> str:
    """Returns a compact topic anchor so short follow-ups do not drift."""
    current = " ".join(current_message.split()).strip()
    normalized = re.sub(r"[^\w\s?]", "", current.lower()).strip()
    is_follow_up = len(current.split()) <= 5 and (
        normalized in _FOLLOW_UPS
        or any(normalized.startswith(prefix) for prefix in ("why ", "how ", "what about", "kyun ", "kaise "))
    )
    if not is_follow_up and current:
        return current[:240]

    skipped_current = False
    for item in reversed(history):
        if item.get("role") != "user":
            continue
        content = " ".join(str(item.get("content", "")).split()).strip()
        if not content:
            continue
        if not skipped_current and content == current:
            skipped_current = True
            continue
        if len(content.split()) > 2:
            return content[:240]
    return current[:240]


def recent_chat_history(history: List[Dict[str, Any]], limit: int = 18) -> List[Dict[str, str]]:
    """Keeps enough local context for follow-ups without letting old topics dominate."""
    selected = history[-max(1, limit):]
    return [
        {
            "role": "assistant" if item.get("role") == "assistant" else "user",
            "content": str(item.get("content", "")),
        }
        for item in selected
        if item.get("content")
    ]


def validate_ai_response(response_text: str, language: str, role_str: str, is_general: bool = False) -> bool:
    if not response_text or len(response_text.strip()) < 5:
        return False
    clean = response_text.lower().strip()

    # Critical security leak checks (strictly forbidden everywhere)
    critical_leaks = [
        "system prompt", "api key", "database credentials", "openai_api_key", "gemini_api_key",
        "secret_token", "bearer ey", "internal rubric", "scoring criteria"
    ]
    for leak in critical_leaks:
        if leak in clean:
            return False

    unsupported_overclaims = [
        "guaranteed accurate", "100% accurate", "i verified this live", "i checked this live",
        "i remember our full conversation history", "i have permanent memory",
    ]
    for phrase in unsupported_overclaims:
        if phrase in clean:
            return False

    if not is_general:
        # Roleplay filler words only restricted during structured in-character practice
        forbidden = [
            "as an ai", "i am an ai", "i am a language model", "as a language model", "as an ai assistant",
            "as a large language model",
            "let's improve your communication skills",
            "good job communicating", "great job", "keep practicing", "communication is excellent", "excellent communication",
            "correct answer", "that is the correct", "that's the correct",
            "here is your response:", "objectives achieved:", "scenario objectives:"
        ]
        for f in forbidden:
            if f in clean:
                return False

    has_ur = any('\u0600' <= c <= '\u06FF' for c in response_text)

    # 1. Urdu Script Enforcement: Must contain Urdu characters
    if language == "ur":
        if not has_ur:
            return False

    # 2. Roman Urdu Enforcement: Must be Latin script, NOT Urdu script
    elif language == "ur_rm":
        if has_ur:
            return False

    # 3. English Enforcement: Must NOT contain Urdu script
    elif language == "en":
        if has_ur:
            return False

    return True
