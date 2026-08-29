from typing import Dict, Any
from app.services.scoring_service import score_band
from app.services.ai.ai_service import call_ai_chat, is_ai_available

FALLBACK_FEEDBACK = {
    'perfect': {
        'en': {'message': 'Great work! You got everything right.', 'encouragement': 'You are doing wonderfully.', 'nextStepHint': 'Let us try a slightly harder activity.'},
        'ur': {'message': 'بہترین! آپ نے سب درست کیا۔', 'encouragement': 'آپ بہت اچھا کر رہے ہیں۔', 'nextStepHint': 'آئیے تھوڑی مشکل سرگرمی آزمائیں۔'},
        'ur_rm': {'message': 'Behtareen! Aap ne sab durust kiya.', 'encouragement': 'Aap bohot acha kar rahe hain.', 'nextStepHint': 'Aaiye thori mushkil activity azmayen.'},
    },
    'strong': {
        'en': {'message': 'Great work! You identified most answers correctly.', 'encouragement': 'Keep going at your own pace.', 'nextStepHint': 'Let us try a slightly more challenging activity.'},
        'ur': {'message': 'بہت اچھا! آپ نے زیادہ تر جوابات درست دیے۔', 'encouragement': 'اپنی رفتار سے آگے بڑھیں۔', 'nextStepHint': 'آئیے تھوڑی مشکل سرگرمی آزمائیں۔'},
        'ur_rm': {'message': 'Bohot acha! Aap ne zyada tar jawabaat durust diye.', 'encouragement': 'Apni raftaar se aage barhein.', 'nextStepHint': 'Aaiye thori mushkil activity azmayen.'},
    },
    'moderate': {
        'en': {'message': 'Good effort! Some answers were tricky.', 'encouragement': 'That is okay — learning takes practice.', 'nextStepHint': 'Let us practice this skill a bit more.'},
        'ur': {'message': 'اچھی کوشش! کچھ جوابات مشکل تھے۔', 'encouragement': 'یہ ٹھیک ہے — سیکھنے میں مشق چاہیے۔', 'nextStepHint': 'آئیے اس مہارت کی مزید مشق کریں۔'},
        'ur_rm': {'message': 'Achi koshish! Kuch jawabaat mushkil thay.', 'encouragement': 'Yeh theek hai — seekhne mein mashq chahiye.', 'nextStepHint': 'Aaiye is maharat ki mazeed mashq karein.'},
    },
    'struggling': {
        'en': {'message': 'That is okay. Let us practice this skill with a simpler activity.', 'encouragement': 'Every step counts.', 'nextStepHint': 'We will try again together at an easier level.'},
        'ur': {'message': 'یہ ٹھیک ہے۔ آئیے اس مہارت کی آسان سرگرمی سے مشق کریں۔', 'encouragement': 'ہر قدم اہم ہے۔', 'nextStepHint': 'ہم آسان سطح پر دوبارہ کوشش کریں گے۔'},
        'ur_rm': {'message': 'Yeh theek hai. Aaiye is maharat ki aasaan activity se mashq karein.', 'encouragement': 'Har qadam ahem hai.', 'nextStepHint': 'Hum aasaan satah par dobara koshish karenge.'},
    },
}

def fallback_feedback(persona: str, language: str, score: float, should_retry: bool) -> Dict[str, Any]:
    band = score_band(score)
    band_dict = FALLBACK_FEEDBACK.get(band, FALLBACK_FEEDBACK['moderate'])
    templates = band_dict.get(language, band_dict['en'])
    return {
        **templates,
        "shouldRetry": should_retry,
        "source": "rules_fallback",
    }

async def generate_feedback(
    persona: str,
    language: str,
    score: float,
    correct_count: int,
    total_count: int,
    topic: str,
    should_retry: bool,
) -> Dict[str, Any]:
    fallback = fallback_feedback(persona, language, score, should_retry)

    if not is_ai_available():
        return fallback

    prompt = (
        f"Generate supportive learning feedback for HumSaathi AI (NOT medical).\n"
        f"Return JSON: {{ message, encouragement, nextStepHint }} — each max 2 short sentences, age-appropriate for {persona}, language tone: {language}.\n"
        f"Score: {correct_count}/{total_count} on {topic}. Should retry: {should_retry}.\n"
        f"Be positive, clear, non-judgmental. No diagnosis language."
    )

    messages = [
        {"role": "system", "content": "Return valid JSON only."},
        {"role": "user", "content": prompt},
    ]

    ai_result = await call_ai_chat(messages, temperature=0.4)
    if not ai_result or not isinstance(ai_result, dict):
        return fallback

    msg = ai_result.get("message")
    enc = ai_result.get("encouragement")
    hint = ai_result.get("nextStepHint")

    if not msg:
        return fallback

    return {
        "message": msg[:400],
        "encouragement": (enc or "")[:200],
        "nextStepHint": (hint or "")[:200],
        "shouldRetry": should_retry,
        "source": "ai",
    }
