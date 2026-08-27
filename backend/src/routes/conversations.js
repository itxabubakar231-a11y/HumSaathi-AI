import { Router } from 'express';
import { getScenarios, getScenarioById, startSession, sendMessage, endSession } from '../services/conversationService.js';
import { startConversationSchema, sendMessageSchema } from '../validators/requestSchemas.js';
import prisma from '../lib/prisma.js';
import { parseJson } from '../utils/constants.js';

const router = Router();

router.get('/scenarios', async (req, res) => {
  try {
    const { persona, language, difficulty } = req.query;
    const scenarios = await getScenarios({ persona, language, difficulty });
    res.json({ scenarios });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/scenarios/:id', async (req, res) => {
  try {
    const scenario = await getScenarioById(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ scenario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/start', async (req, res) => {
  try {
    const data = startConversationSchema.parse(req.body);
    const result = await startSession(data.userId, data.scenarioId, data.mode);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:sessionId/message', async (req, res) => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const result = await sendMessage(req.params.sessionId, data.userId, data.message);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:sessionId/end', async (req, res) => {
  try {
    const result = await endSession(req.params.sessionId);
    res.json({ session: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/sessions/:userId', async (req, res) => {
  try {
    const sessions = await prisma.conversationSession.findMany({
      where: { userId: req.params.userId },
      include: { scenario: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      sessions: sessions.map((s) => ({
        ...s,
        transcript: parseJson(s.transcript, []),
        scenario: {
          ...s.scenario,
          personas: parseJson(s.scenario.personas, []),
          languages: parseJson(s.scenario.languages, []),
          objectives: parseJson(s.scenario.objectives, []),
          initialPrompt: parseJson(s.scenario.initialPrompt, {}),
        }
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET single session by sessionId
router.get('/session/:sessionId', async (req, res) => {
  try {
    const s = await prisma.conversationSession.findUnique({
      where: { id: req.params.sessionId },
      include: { scenario: true }
    });
    if (!s) return res.status(404).json({ error: 'Session not found' });
    res.json({
      session: {
        ...s,
        transcript: parseJson(s.transcript, []),
        scenario: {
          ...s.scenario,
          personas: parseJson(s.scenario.personas, []),
          languages: parseJson(s.scenario.languages, []),
          objectives: parseJson(s.scenario.objectives, []),
          initialPrompt: parseJson(s.scenario.initialPrompt, {}),
        }
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

