import re
from typing import Dict, Any, List, Optional
from enum import Enum


class IntentCategory(str, Enum):
    GENERAL_QUESTION = "GENERAL_QUESTION"
    EDUCATION = "EDUCATION"
    CHILD_LEARNING = "CHILD_LEARNING"
    TEEN_LEARNING = "TEEN_LEARNING"
    ADULT_LEARNING = "ADULT_LEARNING"
    COMMUNICATION_PRACTICE = "COMMUNICATION_PRACTICE"
    SCENARIO_ROLEPLAY = "SCENARIO_ROLEPLAY"
    TECHNICAL_QUESTION = "TECHNICAL_QUESTION"
    PROJECT_QUESTION = "PROJECT_QUESTION"
    CASUAL_CONVERSATION = "CASUAL_CONVERSATION"
    FOLLOW_UP = "FOLLOW_UP"
    CLARIFICATION = "CLARIFICATION"
    REQUEST_FOR_EXPLANATION = "REQUEST_FOR_EXPLANATION"
    REQUEST_FOR_EXAMPLE = "REQUEST_FOR_EXAMPLE"
    REQUEST_FOR_SUMMARY = "REQUEST_FOR_SUMMARY"
    REQUEST_FOR_STEP_BY_STEP_HELP = "REQUEST_FOR_STEP_BY_STEP_HELP"
    UNSAFE_REQUEST = "UNSAFE_REQUEST"
    UNKNOWN = "UNKNOWN"


_UNSAFE_PATTERNS = [
    r"\b(?:ignore|override|bypass)\b.{0,30}\b(?:instructions?|prompts?|rules?|guardrails?)\b",
    r"\b(?:reveal|show|dump|print)\b.{0,30}\b(?:system prompt|secret|credentials?|api[ _-]?key|database password)\b",
    r"\b(?:hack|exploit|sql injection|drop table|destroy)\b",
]

_FOLLOW_UP_INDICATORS = {
    "why", "why?", "how", "how?", "explain", "explain it", "tell me more",
    "what about it", "can you explain", "make it simpler", "example", "give an example",
    "give me an example", "is it hard", "is it difficult", "how does it work",
    "kyun", "kyun?", "kaise", "kaise?", "samjhao", "mazeed batao", "isko samjhao",
    "ye kaise hota hai", "yeh kaise hota hai", "iski example do", "misal do",
    "roman urdu mein samjhao", "urdu mein samjhao", "english mein samjhao",
    "اور بتاؤ", "وضاحت کریں", "مثال دیں", "یہ کیسے ہوتا ہے", "کیوں", "کیسے"
}

_TECHNICAL_PATTERNS = [
    r"\b(?:python|javascript|typescript|react|fastapi|sql|database|api|html|css|docker|git|c\+\+|java)\b",
    r"\b(?:code|function|class|recursion|algorithm|debugging|variable|loop|array|dictionary|json)\b",
    r"\b(?:write|generate|show|debug|fix)\b.{0,35}\b(?:code|program|script|query)\b",
]

_CHILD_KEYWORDS = [
    "letter", "alphabet", "number", "count", "shape", "color", "animal", "rhyme", "drawing",
    "abdul", "huruf", "haroof", "ginti", "rang", "janwar", "اشکال", "حروف", "گنتی", "رنگ"
]

_TEEN_KEYWORDS = [
    "school project", "group discussion", "peer", "teacher extension", "homework", "friend dispute",
    "study tip", "social anxiety", "presentation", "teen", "classmate"
]

_ADULT_KEYWORDS = [
    "interview", "resume", "cv", "job", "salary", "workplace", "manager", "boss", "shift swap",
    "pharmacy", "medicine", "doctor", "appointment", "customer support", "bill", "refund", "professional email"
]

_PROJECT_KEYWORDS = [
    "humsaathi", "about humsaathi", "what is this app", "features of humsaathi",
    "how to use humsaathi", "who made humsaathi", "sensory preferences", "calm mode",
    "parent view", "admin panel", "caregiver", "personas in humsaathi"
]


def detect_language(text: str, default_lang: str = "en") -> str:
    """
    Accurately detects whether text is Urdu script (ur), Roman Urdu (ur_rm), or English (en).
    """
    if not text or not text.strip():
        return default_lang

    clean = text.strip()

    # 1. Check for Urdu Unicode script range (\u0600-\u06FF)
    urdu_chars = sum(1 for c in clean if '\u0600' <= c <= '\u06FF')
    if urdu_chars > 0 and (urdu_chars / max(1, len(clean.replace(" ", "")))) > 0.25:
        return "ur"

    # 2. Check for Roman Urdu markers
    roman_urdu_words = {
        "kya", "kyun", "kaise", "kahan", "kab", "kaun", "mera", "meri", "mere",
        "aap", "tum", "hum", "yeh", "ye", "woh", "wo", "hai", "hain", "tha", "the",
        "thi", "hoga", "hogi", "batao", "samjhao", "karo", "karein", "shukriya",
        "madad", "chahiye", "zaroorat", "bohot", "acha", "achi", "theek", "nahi",
        "matlab", "misal", "isko", "usko", "sabak", "sawal", "jawab", "kaam"
    }

    words = [w.lower().strip(".,!?:;\"'()[]{}") for w in clean.split()]
    roman_matches = sum(1 for w in words if w in roman_urdu_words)

    if roman_matches >= 2 or (len(words) <= 3 and roman_matches >= 1):
        return "ur_rm"

    # Explicit phrases like "in Roman Urdu", "Roman Urdu mein"
    clean_lower = clean.lower()
    if "roman urdu" in clean_lower or "roman urdu mein" in clean_lower:
        return "ur_rm"

    return "en"


def classify_intent(
    user_message: str,
    history: Optional[List[Dict[str, Any]]] = None,
    scenario_id: Optional[str] = None,
    persona: str = "teen",
) -> Dict[str, Any]:
    """
    Classifies the user message into internal intent categories with metadata.
    Does NOT expose internal labels to the end user.
    """
    msg = user_message.strip().lower()
    history = history or []

    # 1. Unsafe prompt injection or security leak attempt
    for pat in _UNSAFE_PATTERNS:
        if re.search(pat, msg, re.IGNORECASE):
            return {
                "category": IntentCategory.UNSAFE_REQUEST,
                "confidence": 0.99,
                "is_safe": False,
                "requires_clarification": False,
            }

    # 2. Project Question (HumSaathi specific features)
    if any(k in msg for k in _PROJECT_KEYWORDS):
        return {
            "category": IntentCategory.PROJECT_QUESTION,
            "confidence": 0.95,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 3. Explicit Request for Examples, Summaries, Step-by-Step, Explanations or Follow-ups
    if any(k in msg for k in ["example", "give an example", "give me an example", "misal", "misal do", "مثال"]):
        return {
            "category": IntentCategory.REQUEST_FOR_EXAMPLE,
            "confidence": 0.94,
            "is_safe": True,
            "requires_clarification": False,
        }

    if any(k in msg for k in ["summary", "summarize", "brief summary", "khulasa", "خلاصہ"]):
        return {
            "category": IntentCategory.REQUEST_FOR_SUMMARY,
            "confidence": 0.94,
            "is_safe": True,
            "requires_clarification": False,
        }

    if any(k in msg for k in ["step by step", "step-by-step", "steps", "tareeqa", "طریقہ"]):
        return {
            "category": IntentCategory.REQUEST_FOR_STEP_BY_STEP_HELP,
            "confidence": 0.94,
            "is_safe": True,
            "requires_clarification": False,
        }

    if any(k in msg for k in ["explain", "samjhao", "explain it", "وضاحت"]):
        return {
            "category": IntentCategory.REQUEST_FOR_EXPLANATION,
            "confidence": 0.92,
            "is_safe": True,
            "requires_clarification": False,
        }

    normalized = re.sub(r"[^\w\s?]", "", msg).strip()
    is_short = len(msg.split()) <= 6
    if normalized in _FOLLOW_UP_INDICATORS or (is_short and any(msg.startswith(p) for p in ["why", "how", "what about", "is it", "ye ", "yeh ", "isko ", "usko "])):
        return {
            "category": IntentCategory.FOLLOW_UP,
            "confidence": 0.90,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 4. Technical / Programming Query
    for pat in _TECHNICAL_PATTERNS:
        if re.search(pat, msg, re.IGNORECASE):
            return {
                "category": IntentCategory.TECHNICAL_QUESTION,
                "confidence": 0.90,
                "is_safe": True,
                "requires_clarification": False,
            }

    # 5. In-Scenario Roleplay & Communication Practice
    is_general = (scenario_id in ["scenario_general_chat", "general", "ai_coach", "assistant"] or not scenario_id)
    if not is_general:
        return {
            "category": IntentCategory.SCENARIO_ROLEPLAY,
            "confidence": 0.90,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 6. Persona-specific educational queries
    if persona == "child" or any(k in msg for k in _CHILD_KEYWORDS):
        return {
            "category": IntentCategory.CHILD_LEARNING,
            "confidence": 0.85,
            "is_safe": True,
            "requires_clarification": False,
        }

    if any(k in msg for k in _ADULT_KEYWORDS):
        return {
            "category": IntentCategory.ADULT_LEARNING,
            "confidence": 0.85,
            "is_safe": True,
            "requires_clarification": False,
        }

    if any(k in msg for k in _TEEN_KEYWORDS):
        return {
            "category": IntentCategory.TEEN_LEARNING,
            "confidence": 0.85,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 7. Casual conversation
    if any(msg.startswith(g) for g in ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening", "how are you", "kya haal hai", "kese ho"]):
        return {
            "category": IntentCategory.CASUAL_CONVERSATION,
            "confidence": 0.88,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 8. General question
    return {
        "category": IntentCategory.GENERAL_QUESTION,
        "confidence": 0.80,
        "is_safe": True,
        "requires_clarification": False,
    }
