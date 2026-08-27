import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { assessmentSubmitSchema } from '../validators/requestSchemas.js';
import { getAssessmentQuestions } from '../services/assessmentService.js';
import { scoreAssessment, levelFromScore } from '../services/scoringService.js';
import { buildAreaLevelsFromQuestions, upsertProgressFromAssessment, parseJson, stringifyJson } from '../services/progressService.js';
import { interpretAssessment } from '../services/ai/assessmentInterpreter.js';

const router = Router();

router.get('/:userId/questions', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user?.persona) return res.status(400).json({ error: 'Complete setup first' });

  const questions = getAssessmentQuestions(user.persona, user.language);
  res.json({
    questions: questions.map(({ id, area, skill, prompt, options }) => ({
      id, area, skill, prompt, options,
    })),
    persona: user.persona,
    language: user.language,
  });
});

router.post('/:userId/submit', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user?.persona) return res.status(400).json({ error: 'Complete setup first' });

    const { responses } = assessmentSubmitSchema.parse(req.body);
    const questions = getAssessmentQuestions(user.persona, user.language);
    const { score, graded, correct, total } = scoreAssessment(questions, responses);
    const areaLevels = buildAreaLevelsFromQuestions(questions, graded, score);
    const estimatedLevel = levelFromScore(score);

    const interpretation = await interpretAssessment({
      persona: user.persona,
      language: user.language,
      score,
      areaLevels,
      responses: graded,
    });

    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        persona: user.persona,
        language: user.language,
        questions: stringifyJson(questions),
        responses: stringifyJson(graded),
        score,
        estimatedLevel: interpretation.recommendedDifficulty || estimatedLevel,
        areaLevels: stringifyJson(areaLevels),
        aiSummary: stringifyJson({
          summary: interpretation.summary,
          areas: interpretation.areas,
          source: interpretation.source,
        }),
      },
    });

    await upsertProgressFromAssessment(user.id, areaLevels);

    res.json({
      assessment: {
        id: assessment.id,
        score,
        correct,
        total,
        estimatedLevel: assessment.estimatedLevel,
        areaLevels,
        summary: interpretation.summary,
        areas: interpretation.areas,
        source: interpretation.source,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:userId/latest', async (req, res) => {
  const assessment = await prisma.assessment.findFirst({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!assessment) return res.json({ assessment: null });

  res.json({
    assessment: {
      id: assessment.id,
      score: assessment.score,
      estimatedLevel: assessment.estimatedLevel,
      areaLevels: parseJson(assessment.areaLevels, {}),
      summary: parseJson(assessment.aiSummary, {}).summary,
      createdAt: assessment.createdAt,
    },
  });
});

export default router;
