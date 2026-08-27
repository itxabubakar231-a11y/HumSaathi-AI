import { Router } from 'express';
import { evaluateSession, getEvaluation, getNextRecommendation } from '../services/evaluationService.js';

const router = Router();

router.post('/conversation', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'sessionId and userId are required' });
    }

    const evaluation = await evaluateSession(sessionId, userId);
    const recommendation = await getNextRecommendation(userId, evaluation.scenarioId || '');

    res.json({
      evaluation,
      recommendation
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const evaluation = await getEvaluation(req.params.sessionId);
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });
    res.json({ evaluation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
