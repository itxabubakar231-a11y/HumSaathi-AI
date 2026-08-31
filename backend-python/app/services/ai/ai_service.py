import json
import logging
import re
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("humsaathi-ai")

def is_ai_available() -> bool:
    return bool(settings.AI_API_KEY and settings.AI_API_KEY.strip())

def clean_json_text(raw_text: str) -> str:
    """Strips markdown code fences and whitespace from raw JSON response."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()

async def call_ai_chat(messages: List[Dict[str, str]], temperature: float = 0.5) -> Optional[Dict[str, Any]]:
    if not is_ai_available():
        logger.info("[HumSaathi AI] No API key provided. Using rule-based fallback.")
        return None

    url = f"{settings.AI_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.AI_API_KEY}",
    }
    payload = {
        "model": settings.AI_MODEL,
        "temperature": temperature,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                logger.warning(f"[HumSaathi AI Error] HTTP {response.status_code}: {response.text}")
                return None

            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                return None
            content = choices[0].get("message", {}).get("content")
            if not content:
                return None

            cleaned = clean_json_text(content)
            try:
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                # If model returned a raw conversational string instead of JSON
                if cleaned:
                    return {"response": cleaned}

            return None
    except Exception as e:
        logger.warning(f"[HumSaathi AI] AI request failed: {e}. Falling back to rules.")
        return None

