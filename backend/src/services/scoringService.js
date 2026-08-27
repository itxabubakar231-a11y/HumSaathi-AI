import { DIFFICULTY_ORDER, clampDifficulty, scoreBand } from '../utils/constants.js';

export function scoreAssessment(questions, responses) {
  let correct = 0;
  const graded = responses.map((response) => {
    const question = questions.find((q) => q.id === response.questionId);
    const isCorrect = question
      ? String(question.correctAnswer).toLowerCase() === String(response.answer).toLowerCase()
      : false;
    if (isCorrect) correct += 1;
    return { ...response, correct: isCorrect };
  });
  const score = questions.length ? correct / questions.length : 0;
  return { score, graded, correct, total: questions.length };
}

export function scoreActivity(content, answers) {
  let correctCount = 0;
  const questions = content.questions || [];
  const graded = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    const expected = question?.correctAnswer;
    const isCorrect = expected !== undefined
      && String(expected).toLowerCase() === String(answer.answer).toLowerCase();
    if (isCorrect) correctCount += 1;
    return { ...answer, correct: isCorrect };
  });
  const totalCount = questions.length || answers.length;
  const score = totalCount ? correctCount / totalCount : 0;
  return { score, correctCount, totalCount, graded };
}

export function levelFromScore(score) {
  if (score >= 0.9) return 'medium';
  if (score >= 0.7) return 'easy';
  if (score >= 0.5) return 'beginner';
  return 'beginner';
}

export function adaptDifficulty(currentLevel, score, totalCount) {
  const ratio = totalCount ? score * totalCount : 0;
  const correct = Math.round(ratio);

  if (correct >= totalCount && totalCount >= 1) {
    return { level: clampDifficulty(currentLevel, 1), shouldRetry: false, action: 'increase' };
  }
  if (correct >= totalCount - 1 && totalCount >= 2) {
    return { level: clampDifficulty(currentLevel, 0), shouldRetry: false, action: 'maintain_or_slight_increase' };
  }
  if (correct >= 2) {
    return { level: currentLevel, shouldRetry: false, action: 'maintain' };
  }
  return { level: clampDifficulty(currentLevel, -1), shouldRetry: true, action: 'decrease' };
}

export { scoreBand };
