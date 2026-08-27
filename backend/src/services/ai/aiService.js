const AI_API_KEY = process.env.AI_API_KEY || process.env.DASHSCOPE_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const AI_MODEL = process.env.AI_MODEL || 'gemini-3.5-flash';

export function isAiAvailable() {
  return Boolean(AI_API_KEY);
}

export async function callAiChat(messages, { temperature = 0.3 } = {}) {
  if (!isAiAvailable()) {
    return null;
  }

  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('AI API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (error) {
    console.warn('AI call failed:', error.message);
    return null;
  }
}

export { AI_API_KEY };
