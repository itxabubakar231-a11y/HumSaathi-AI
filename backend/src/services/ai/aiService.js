export function getAiConfig() {
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    '';
  const baseUrl =
    process.env.AI_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta/openai';
  const model =
    process.env.AI_MODEL ||
    'gemini-1.5-flash';

  return { apiKey, baseUrl, model };
}

export function isAiAvailable() {
  const { apiKey } = getAiConfig();
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export async function callAiChat(messages, { temperature = 0.3 } = {}) {
  const { apiKey, baseUrl, model } = getAiConfig();

  if (!isAiAvailable()) {
    console.warn('[HumSaathi AI] No AI API Key found in environment variables (checked AI_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY, OPENAI_API_KEY). Using fallback.');
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[HumSaathi AI Error] HTTP ${response.status} (${response.statusText}):`, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[HumSaathi AI] Empty content in response:', data);
      return null;
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('[HumSaathi AI] AI call failed:', error.message);
    return null;
  }
}

export const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY || '';

