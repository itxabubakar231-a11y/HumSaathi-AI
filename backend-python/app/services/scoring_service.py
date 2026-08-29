from typing import List, Dict, Any, Tuple

DIFFICULTY_ORDER = ['beginner', 'easy', 'medium', 'hard', 'advanced']

def difficulty_index(level: str) -> int:
    try:
        return DIFFICULTY_ORDER.index(level)
    except ValueError:
        return 1  # default 'easy'

def clamp_difficulty(level: str, delta: int = 0) -> str:
    idx = difficulty_index(level)
    next_idx = max(0, min(len(DIFFICULTY_ORDER) - 1, idx + delta))
    return DIFFICULTY_ORDER[next_idx]

def score_band(score: float) -> str:
    if score >= 1.0:
        return 'perfect'
    if score >= 0.8:
        return 'strong'
    if score >= 0.4:
        return 'moderate'
    return 'struggling'

def score_assessment(questions: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    correct = 0
    graded = []
    
    for response in responses:
        qid = response.get("questionId")
        q = next((item for item in questions if item.get("id") == qid), None)
        is_correct = False
        if q and q.get("correctAnswer") is not None:
            is_correct = str(q["correctAnswer"]).strip().lower() == str(response.get("answer", "")).strip().lower()
        if is_correct:
            correct += 1
        graded.append({**response, "correct": is_correct})
        
    total = len(questions)
    score = correct / total if total > 0 else 0.0
    return {"score": score, "graded": graded, "correct": correct, "total": total}

def score_activity(content: Dict[str, Any], answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    correct_count = 0
    questions = content.get("questions", []) if isinstance(content, dict) else []
    graded = []
    
    for ans in answers:
        qid = ans.get("questionId")
        q = next((item for item in questions if item.get("id") == qid), None)
        expected = q.get("correctAnswer") if q else None
        
        if ans.get("correct") is not None:
            is_correct = bool(ans.get("correct"))
        elif expected is not None:
            is_correct = str(expected).strip().lower() == str(ans.get("answer", "")).strip().lower()
        else:
            is_correct = False
            
        if is_correct:
            correct_count += 1
        graded.append({**ans, "correct": is_correct})
        
    total_count = len(answers) if answers else (len(questions) if questions else 1)
    score = correct_count / total_count if total_count > 0 else 0.0
    return {
        "score": score,
        "correctCount": correct_count,
        "totalCount": total_count,
        "graded": graded,
    }

def level_from_score(score: float) -> str:
    if score >= 0.9:
        return 'medium'
    if score >= 0.7:
        return 'easy'
    return 'beginner'

def adapt_difficulty(current_level: str, score: float, total_count: int) -> Dict[str, Any]:
    ratio = score * total_count if total_count else 0
    correct = round(ratio)

    if correct >= total_count and total_count >= 1:
        return {
            "level": clamp_difficulty(current_level, 1),
            "shouldRetry": False,
            "action": "increase",
        }
    if correct >= total_count - 1 and total_count >= 2:
        return {
            "level": clamp_difficulty(current_level, 0),
            "shouldRetry": False,
            "action": "maintain_or_slight_increase",
        }
    if correct >= 2:
        return {
            "level": current_level,
            "shouldRetry": False,
            "action": "maintain",
        }
    return {
        "level": clamp_difficulty(current_level, -1),
        "shouldRetry": True,
        "action": "decrease",
    }
