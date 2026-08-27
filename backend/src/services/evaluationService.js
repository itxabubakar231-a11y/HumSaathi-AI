import prisma from '../lib/prisma.js';
import { callAiChat, isAiAvailable } from './ai/aiService.js';
import { parseJson } from '../utils/constants.js';

// Predefined fallback feedback templates for different languages
const FALLBACK_FEEDBACKS = {
  en: {
    feedback: "You did a wonderful job talking to the teacher/person! You expressed yourself clearly and politely. Remember, speaking up is a great way to learn and grow.",
    strengths: ["Polite and respectful greeting", "Answered the questions directly", "Followed the flow of the conversation"],
    improvements: ["Try adding a bit more detail when explaining what you need", "Practice using clear and simple words"],
    betterResponse: "Excuse me, teacher. Could you please show me how to solve the first math problem on the worksheet?"
  },
  ur: {
    feedback: "آپ نے استاد/دوسرے شخص سے بات کرنے کا بہترین کام کیا! آپ نے اپنے خیالات کا اظہار واضح اور شائستگی سے کیا۔ یاد رکھیں، بولنا سیکھنے اور آگے بڑھنے کا ایک بہترین طریقہ ہے۔",
    strengths: ["شائستہ اور احترام والا سلام", "سوالات کا براہ راست جواب دیا", "بات چیت کے بہاؤ پر عمل کیا"],
    improvements: ["جب آپ کو ضرورت ہو تو وضاحت کرتے ہوئے تھوڑی مزید تفصیل شامل کرنے کی کوشش کریں", "واضح اور آسان الفاظ استعمال کرنے کی مشق کریں"],
    betterResponse: "معاف کیجئے گا، ٹیچر۔ کیا آپ براہ کرم مجھے ورک شیٹ پر پہلا ریاضی کا سوال حل کرنے کا طریقہ دکھا سکتے ہیں؟"
  },
  ur_rm: {
    feedback: "Aap ne teacher/person se baat karne ka behtareen kaam kiya! Aap ne apne aap ko wazih aur polite tariqe se express kiya. Yaad rakhein, bolna seekhne aur grow karne ka behtareen zariya hai.",
    strengths: ["Polite aur respectful greeting", "Sawal ka direct jawab diya", "Conversation flow ko maintain kiya"],
    improvements: ["Jab aap ko madad chahiye ho to thori mazeed detail add karne ki koshish karein", "Wazih aur simple words use karne ki practice karein"],
    betterResponse: "Excuse me, teacher. Kya aap please mujhe worksheet par pehla math problem solve karne ka tarika dikha sakte hain?"
  }
};

export async function evaluateSession(sessionId, userId) {
  // Check if evaluation already exists
  const existing = await prisma.conversationEvaluation.findUnique({
    where: { sessionId }
  });
  if (existing) {
    return {
      ...existing,
      strengths: parseJson(existing.strengths, []),
      improvements: parseJson(existing.improvements, []),
    };
  }

  const session = await prisma.conversationSession.findUnique({
    where: { id: sessionId },
    include: { scenario: true }
  });

  if (!session) throw new Error('Session not found');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const language = session.language || 'en';
  const transcript = parseJson(session.transcript, []);

  let clarity = 80;
  let relevance = 85;
  let appropriateness = 90;
  let communication = 80;
  let conversationFlow = 85;
  let overallScore = 84;
  let strengths = [];
  let improvements = [];
  let betterResponse = '';
  let feedbackText = '';

  if (isAiAvailable() && transcript.length > 1) {
    const prompt = `Evaluate this role-play conversation session for a neurodiverse learner.
Scenario: ${session.scenario.title}
Objectives: ${session.scenario.objectives}
AI Role: ${session.scenario.aiRole}
Learner Persona: ${user.persona}
Language: ${language}
Transcript: ${JSON.stringify(transcript)}

Please grade the learner's responses on exactly these 5 metrics (0-100 score):
1. Clarity (how clear/understandable)
2. Relevance (addressing context/situation)
3. Appropriateness (polite, contextual fit)
4. Communication (simple coherence/vocabulary)
5. Conversation Flow (natural turns, responses)

Also provide:
- Strengths (2-3 items, encouraging, simple language)
- Improvements (1-2 items, constructive, actionable)
- A better alternative response for one of the user turns.
- Encouraging overall feedback (max 3 short sentences, simple language, supportive tone, no medical diagnosis).

Return JSON format only:
{
  "clarity": <score 0-100>,
  "relevance": <score 0-100>,
  "appropriateness": <score 0-100>,
  "communication": <score 0-100>,
  "conversationFlow": <score 0-100>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "betterResponse": "<example of a better response>",
  "feedback": "<supportive overall feedback>"
}`;

    const aiResult = await callAiChat([
      { role: 'system', content: 'Return valid JSON only. Keep language simple.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    if (aiResult) {
      clarity = aiResult.clarity || clarity;
      relevance = aiResult.relevance || relevance;
      appropriateness = aiResult.appropriateness || appropriateness;
      communication = aiResult.communication || communication;
      conversationFlow = aiResult.conversationFlow || conversationFlow;
      strengths = aiResult.strengths || [];
      improvements = aiResult.improvements || [];
      betterResponse = aiResult.betterResponse || '';
      feedbackText = aiResult.feedback || '';
      overallScore = Math.round((clarity + relevance + appropriateness + communication + conversationFlow) / 5);
    }
  }

  // Fallback to rules/templates if AI is unavailable or failed
  if (!feedbackText) {
    const template = FALLBACK_FEEDBACKS[language] || FALLBACK_FEEDBACKS.en;
    feedbackText = template.feedback;
    strengths = template.strengths;
    improvements = template.improvements;
    betterResponse = template.betterResponse;

    // Adjust fallback scores slightly based on turn count as a simple heuristic
    const turns = session.turnCount;
    if (turns < 2) {
      clarity = 60;
      relevance = 60;
      conversationFlow = 50;
    } else if (turns >= 4) {
      clarity = 90;
      relevance = 95;
      conversationFlow = 90;
    }
    overallScore = Math.round((clarity + relevance + appropriateness + communication + conversationFlow) / 5);
  }

  // Save the evaluation in database
  const evaluation = await prisma.conversationEvaluation.create({
    data: {
      sessionId,
      clarity,
      relevance,
      appropriateness,
      communication,
      conversationFlow,
      overallScore,
      strengths: JSON.stringify(strengths),
      improvements: JSON.stringify(improvements),
      betterResponse,
      feedback: feedbackText
    }
  });

  // Automatically update learner progress/metrics
  await updateProgressFromEvaluation(userId, session.scenario.title, overallScore);

  return {
    ...evaluation,
    strengths,
    improvements
  };
}

async function updateProgressFromEvaluation(userId, scenarioTitle, overallScore) {
  // Map scenario title to a skill name in the Progress model
  // Keep skill name matching i18n/dashboard, e.g. "conversation" or "requesting" or "social"
  const skill = 'conversation'; // general fallback

  const existing = await prisma.progress.findUnique({
    where: { userId_skill: { userId, skill } }
  });

  const prevAttempts = existing?.attempts || 0;
  const prevAccuracy = existing?.accuracy || 0;
  const newAttempts = prevAttempts + 1;
  const newAccuracy = ((prevAccuracy * prevAttempts) + (overallScore / 100)) / newAttempts;

  // Let's adapt level based on score
  let level = existing?.level || 'beginner';
  if (overallScore >= 80) level = 'medium';
  else if (overallScore >= 50) level = 'easy';
  else level = 'beginner';

  await prisma.progress.upsert({
    where: { userId_skill: { userId, skill } },
    create: {
      userId,
      skill,
      level,
      accuracy: newAccuracy,
      attempts: 1
    },
    update: {
      level,
      accuracy: newAccuracy,
      attempts: newAttempts
    }
  });
}

export async function getEvaluation(sessionId) {
  const evaluation = await prisma.conversationEvaluation.findUnique({
    where: { sessionId }
  });
  if (!evaluation) return null;
  return {
    ...evaluation,
    strengths: parseJson(evaluation.strengths, []),
    improvements: parseJson(evaluation.improvements, []),
  };
}

export async function getNextRecommendation(userId, lastScenarioId) {
  // Recommend a different scenario based on available list
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const allScenarios = await prisma.communicationScenario.findMany({
    where: { isActive: true }
  });

  const remaining = allScenarios.filter((s) => s.id !== lastScenarioId);
  const selected = remaining[Math.floor(Math.random() * remaining.length)] || allScenarios[0] || null;

  if (!selected) return null;

  const reasons = {
    en: `To improve your conversation skills, let's practice this next:`,
    ur: `آپ کی گفتگو کی مہارت کو بہتر بنانے کے لیے، آئیے آگے اس کی مشق کریں:`,
    ur_rm: `Aap ki conversation skills behtar karne ke liye, aaiye next iski practice karein:`
  };

  const userLang = user.language || 'en';

  return {
    scenarioId: selected.id,
    title: selected.title,
    reason: reasons[userLang] || reasons.en
  };
}
