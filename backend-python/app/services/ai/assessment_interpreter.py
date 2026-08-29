import json
from typing import Dict, Any, List
from app.services.ai.ai_service import call_ai_chat, is_ai_available
from app.services.scoring_service import level_from_score

def fallback_interpretation(persona: str, language: str, score: float, area_levels: Dict[str, str]) -> Dict[str, Any]:
    areas = [
        {"skill": skill, "level": level, "confidence": 0.7}
        for skill, level in area_levels.items()
    ]
    est_level = level_from_score(score)

    summaries = {
        'en': f"Based on your answers, your starting level is {est_level}. We'll personalize activities for you.",
        'ur': f"آپ کے جوابات کی بنیاد پر، آپ کی ابتدائی سطح {est_level} ہے۔ ہم آپ کے لیے سرگرمیاں ذاتی بنائیں گے۔",
        'ur_rm': f"Aap ke jawabaat ki bunyaad par, aap ki ibtidaai satah {est_level} hai. Hum aap ke liye activities personalize karenge.",
    }

    return {
        "areas": areas,
        "summary": summaries.get(language, summaries['en']),
        "recommendedDifficulty": est_level,
        "source": "rules_fallback",
    }

async def interpret_assessment(
    persona: str,
    language: str,
    score: float,
    area_levels: Dict[str, str],
    responses: List[Dict[str, Any]],
) -> Dict[str, Any]:
    fallback = fallback_interpretation(persona, language, score, area_levels)

    if not is_ai_available():
        return fallback

    prompt = (
        f"You are an educational assistant for HumSaathi AI, a learning support platform (NOT medical/diagnostic).\n"
        f"Given assessment results, return JSON only with: areas (array of {{skill, level, confidence}}), summary (max 2 sentences, supportive), recommendedDifficulty (beginner|easy|medium|hard|advanced).\n"
        f"Persona: {persona}. Language: {language}. Score: {int(score * 100)}%. Area levels: {json.dumps(area_levels)}.\n"
        f"Do not mention autism diagnosis or medical terms."
    )

    messages = [
        {"role": "system", "content": "Return valid JSON only. No chain-of-thought."},
        {"role": "user", "content": prompt},
    ]

    ai_result = await call_ai_chat(messages, temperature=0.3)
    if not ai_result or not isinstance(ai_result, dict):
        return fallback

    summary = ai_result.get("summary")
    areas = ai_result.get("areas")
    rec_diff = ai_result.get("recommendedDifficulty")

    if not summary or not isinstance(areas, list) or not rec_diff:
        return fallback

    return {
        "areas": areas,
        "summary": summary,
        "recommendedDifficulty": rec_diff,
        "source": "ai",
    }
