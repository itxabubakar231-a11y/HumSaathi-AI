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
    COMMUNICATION_COACHING = "COMMUNICATION_COACHING"
    PARENT_COACHING = "PARENT_COACHING"
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

_CREDENTIAL_PATTERNS = [
    r"\b(?:api[ _-]?key|secret[ _-]?key|secret[ _-]?token|gemini[ _-]?key|gemini[ _-]?api[ _-]?key|openai[ _-]?key|openai[ _-]?api[ _-]?key|access[ _-]?token|private[ _-]?key|database[ _-]?password|db[ _-]?password|database[ _-]?credentials?)\b",
    r"\b(?:give|tell|share|leak|provide|send|display|show|reveal|dump|what\s+is\s+your)\b.{0,30}\b(?:api[ _-]?key|secret[ _-]?key|password|credentials?|access[ _-]?token)\b",
]

_CLINICAL_DIAGNOSTIC_PATTERNS = [
    # Personal diagnosis requests (vs informational 'what is autism?')
    r"\b(?:can\s+you\s+)?(?:diagnose|evaluat\w*)\s+(?:me|my|mera|meri|mujhe)\b",
    r"\b(?:do\s+i\s+have|could\s+i\s+have)\s+(?:autism|adhd|anxiety|depression|aspergers?|ocd)\b",
    r"\b(?:diagnose\s+my|autism\s+diagnosis\s+for\s+me|medical\s+diagnosis\s+for\s+me)\b",
    r"\b(?:mujhe|mera|meri)\b.{0,25}\b(?:diagnose|diagnosis)\b",
    r"\b(?:diagnose|diagnosis)\b.{0,25}\b(?:karo|karein|karna)\b",
    # Prescription & medication requests

    r"\b(?:what|which|suggest|recommend)\s+(?:medication|medicine|drug|pill|tablets?)\s+(?:should\s+i|can\s+i|to)\s+(?:take|use|have)\b",
    r"\b(?:prescribe|prescription)\s+(?:me|something|medicine|for\s+me)\b",
    r"\b(?:kaunsi|konsi|k konsi)\s+(?:medicine|dawa|dawaii)\s+(?:loon|lenii|lani|khaaun)\b",
    # Dosage requests
    r"\b(?:what|which)\s+(?:dosage|dose)\s+(?:should\s+i|can\s+i|to)\s+(?:take|use)\b",
    r"\b(?:kitni|kitna)\s+(?:dose|dosage|dawa)\s+(?:loon|lena)\b",
    # Guaranteed medical cure / therapy claims
    r"\b(?:can\s+you\s+)?(?:cure|treat)\s+(?:my\s+)?(?:anxiety|autism|depression)\b",
    r"\b(?:guarantee\s+that\s+this\s+will\s+cure|cure\s+my\s+anxiety)\b",
]


_PARENT_SIGNALS = [
    "my child", "my kid", "my son", "my daughter", "as a parent", "at home with my",
    "help my child", "help my kid", "how can i support", "teach my child", "parent coaching",
    "home practice", "for parents", "parent support", "practice with my child", "practice with my kid",
    "child doesn't know", "child does not know", "kid struggles", "child struggles",
    "how can parents", "support communication practice", "practice at home",
    "mera bacha", "meri bachi", "mera beta", "meri beti", "walidain",
    "bachay ki madad", "bachay ko kaise", "گھر پر مشق", "میرا بچہ", "میری بچی", "والدین", "بچے کی مدد"
]

_COMMUNICATION_COACHING_PATTERNS = [
    # English question formats
    r"\b(?:how\s+(?:do|can|should)\s+i|what\s+(?:should|can|do)\s+i)\s+(?:introduce|start\s+(?:a\s+)?conversation|say\s+first|approach|ask\s+for\s+help|make\s+friends|respond|talk\s+to|speak\s+to)\b",
    r"\b(?:how\s+to\s+start\s+(?:a\s+)?conversation|how\s+to\s+introduce|how\s+do\s+i\s+start\s+talking|how\s+to\s+approach)\b",
    r"\b(?:what\s+to\s+say|what\s+should\s+i\s+say|what\s+can\s+i\s+say|give\s+me\s+an?\s+example\s+of\s+what\s+to\s+say)\b",
    r"\b(?:what\s+should\s+i\s+say\s+first|what\s+to\s+say\s+first|first\s+line\s+to\s+say)\b",
    r"\b(?:break\s+the\s+ice|break\s+ice|icebreaker|conversation\s+starter)\b",
    r"\b(?:what\s+should\s+i\s+say\s+when\s+meeting|how\s+to\s+make\s+friends)\b",
    # Roman Urdu patterns with all spelling variants
    r"\b(?:baat|bat)\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah)\s+(?:start|shuru|karun|karein|karna|krun)\b",
    r"\b(?:baat|bat)\s+(?:shuru|start)\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah)\b",
    r"\b(?:kya\s+(?:bolun|boloon|kahoon|kehna|bolna)\s+chahiye|kya\s+bolun|kya\s+kahoon)\b",
    r"\b(?:pehli\s+(?:line|dafa|baar|bar)\s+kya\s+(?:bolun|boloon|kahoon|baat))\b",
    r"\b(?:intro(?:duction)?\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah)\s+(?:du|doon|karun|karein))\b",
    r"\b(?:help|madad)\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah)\s+(?:maangun|mangoon|mangu|mangna|maangna)\b",
    r"\b(?:dost\s+banan(?:ay|e)\s+ka\s+(?:best\s+)?tareeqa|dosti\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah))\b",
    r"\b(?:friendship|dosti)\s+(?:k(?:aise|aisy|ese|esy|aisay)|kis\s+tarah)\s+(?:start|shuru|karein|karun)\b",
    # Urdu script patterns
    r"\b(?:بات\s+کیسے\s+شروع|کیا\s+کہوں|کیا\s+کہنا\s+چاہیے|تعارف\s+کیسے|بات\s+کیسے\s+کروں|مدد\s+کیسے\s+مانگوں|دوست\s+کیسے\s+بناؤں|پہلے\s+کیا\s+کہوں)\b",

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
    r"\b(?:code|function|recursion|algorithm|debugging|variable|loop|array|dictionary|json)\b",
    r"\b(?:write|generate|show|debug|fix)\b.{0,35}\b(?:code|program|script|query)\b",
    r"\b(?:python|java|c\+\+|javascript|typescript|c#|ruby|swift|kotlin|php|oop|object-oriented|programming|code)\b.{0,30}\bclass\b",
    r"\bclass\b.{0,30}\b(?:python|java|c\+\+|javascript|typescript|c#|ruby|swift|kotlin|php|oop|object-oriented|programming|code)\b",
    r"\bclass\b.{0,30}\b(?:inheritance|subclass|superclass|constructor|instantiat\w*|definition|syntax|object|method|variable|polymorphism)\b",
    r"\b(?:subclass|superclass|abstract\s+class|base\s+class|inner\s+class|data\s+class|class\s+[A-Z]\w*)\b",
]

_SCHOOL_SOCIAL_EXCLUSIONS = [
    r"\b(?:class\s+fellow|classmate|class\s+friend|in\s+class|in\s+my\s+class|math\s+class|chemistry\s+class|physics\s+class|science\s+class|meri\s+class|hamari\s+class|naye?\s+class\s+fellow|new\s+class\s+fellow)\b"
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

    # 2. Check for explicit multi-word Roman Urdu phrases
    clean_lower = clean.lower()
    roman_urdu_phrases = [
        "samjha do", "samjha dein", "samjhayein", "bata do", "bata dein",
        "kisi ko", "kisi se", "kisi naye", "kisi banday", "thora sa", "thoda sa",
        "madad chahiye", "madad karo", "baat karni", "baat karna", "baat karein",
        "nahi aa raha", "nahi aati", "nahi ata", "kya karun", "kya karoon",
        "simple samjha", "thora simple", "mujhy simple", "mujhe simple",
    ]
    if any(phrase in clean_lower for phrase in roman_urdu_phrases):
        return "ur_rm"

    # 3. Check for Roman Urdu markers with phonetic variants
    roman_urdu_words = {
        # Question words & interrogatives (with spelling variants)
        "kya", "kyun", "kaise", "kaisy", "kesy", "kese", "kesay", "kaisay", "kis", "tarah",
        "kahan", "kab", "kaun", "kisko", "kisne",
        # Pronouns
        "mera", "meri", "mere", "mujhe", "mujhy", "aap", "ap", "tum", "tumhara", "tumhari",
        "hum", "hamara", "hamari", "yeh", "ye", "woh", "wo", "unka", "unki", "iska", "iski",
        # Auxiliary & verbs
        "hai", "hain", "tha", "the", "thi", "hoga", "hogi", "honge", "ho", "hun", "hoon", "houn",
        # Action verbs & variants
        "batao", "bataun", "bataoon", "batayein", "samjhao", "samjh", "samjha",
        "karo", "karun", "karoon", "karein", "karna", "karta", "karti",
        "bolun", "boloon", "bolna", "bolo", "bole",
        "mangna", "maangna", "maangun", "mangoon", "maangoon", "maang", "mang",
        # Common conversational markers
        "yaar", "naye", "naya", "shuru", "baat", "cheet", "dost", "dosti", "shukriya",
        "madad", "chahiye", "zaroorat", "bohot", "acha", "achi", "theek", "nahi", "na",
        "thora", "thoda", "phir", "toh", "dein",
        "matlab", "misal", "isko", "usko", "sabak", "sawal", "jawab", "kaam",
        "se", "mein", "mai", "par", "ko", "ke", "ki", "ka"
    }

    words = [w.lower().strip(".,!?:;\"'()[]{}\u060C\u061B\u061F\u06D4") for w in clean.split()]
    roman_matches = sum(1 for w in words if w in roman_urdu_words)

    if roman_matches >= 2 or (len(words) <= 3 and roman_matches >= 1):
        return "ur_rm"

    # Explicit phrases like "in Roman Urdu", "Roman Urdu mein"
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

    # 1. Unsafe prompt injection, credential exposure, or clinical diagnostic requests
    for pat in _UNSAFE_PATTERNS + _CREDENTIAL_PATTERNS + _CLINICAL_DIAGNOSTIC_PATTERNS:
        if re.search(pat, msg, re.IGNORECASE):
            return {
                "category": IntentCategory.UNSAFE_REQUEST,
                "confidence": 0.99,
                "is_safe": False,
                "requires_clarification": False,
            }


    # 2. Parent Coaching Intent (Distinguished before child learning)
    if persona == "parent" or any(s in msg for s in _PARENT_SIGNALS):
        return {
            "category": IntentCategory.PARENT_COACHING,
            "confidence": 0.95,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 3. Project Question (HumSaathi specific features)
    if any(k in msg for k in _PROJECT_KEYWORDS):
        return {
            "category": IntentCategory.PROJECT_QUESTION,
            "confidence": 0.95,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 4. Actionable Communication Coaching Intent
    if any(re.search(pat, msg, re.IGNORECASE) for pat in _COMMUNICATION_COACHING_PATTERNS):
        return {
            "category": IntentCategory.COMMUNICATION_COACHING,
            "confidence": 0.93,
            "is_safe": True,
            "requires_clarification": False,
        }

    # 5. Technical / Programming Query (Exclude school and social contexts)
    is_school_social = any(re.search(pat, msg, re.IGNORECASE) for pat in _SCHOOL_SOCIAL_EXCLUSIONS)
    if not is_school_social:
        for pat in _TECHNICAL_PATTERNS:
            if re.search(pat, msg, re.IGNORECASE):
                return {
                    "category": IntentCategory.TECHNICAL_QUESTION,
                    "confidence": 0.90,
                    "is_safe": True,
                    "requires_clarification": False,
                }

    # 6. Explicit Request for Examples, Summaries, Step-by-Step, Explanations or Follow-ups
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
