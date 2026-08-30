import { Router } from 'express';
import { getSkillModules, getSkillModuleDetails, evaluateSkillSolution } from '../services/skillModuleService.js';

const router = Router();

router.get('/modules/:persona', async (req, res) => {
  try {
    const { persona } = req.params;
    const { language } = req.query;
    const modules = await getSkillModules(persona, language || 'en');
    res.json({ modules });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/module/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { language, difficulty } = req.query;
    const moduleDetails = await getSkillModuleDetails(moduleId, language || 'en', difficulty);
    if (!moduleDetails) return res.status(404).json({ error: 'Module not found' });
    res.json({ module: moduleDetails });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/evaluate', async (req, res) => {
  try {
    const { userId, moduleId, scenarioId, optionId, customSolution } = req.body;
    if (!userId || !moduleId || !scenarioId) {
      return res.status(400).json({ error: 'userId, moduleId, and scenarioId are required' });
    }

    const result = await evaluateSkillSolution({
      userId,
      moduleId,
      scenarioId,
      optionId,
      customSolution,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
