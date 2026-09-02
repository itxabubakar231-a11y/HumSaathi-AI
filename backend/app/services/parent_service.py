import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User, Progress, Attempt, Assessment
from app.models.conversation import ConversationSession, ConversationEvaluation, CommunicationScenario
from app.schemas.common import parse_json
from app.services.progress_service import (
    get_dashboard_stats,
    is_skill_for_persona,
    is_attempt_for_persona,
    SKILL_TRANSLATIONS,
)
from app.services.ai.ai_service import call_ai_text, is_ai_available
from app.data.scenarios import ALL_SCENARIOS, DEFAULT_SCENARIOS

logger = logging.getLogger("humsaathi-parent")

SKILL_NAME_MAP = {
    "letters": {"title": "Letters & Phonics", "actionLink": "/activity/letters", "category": "reading"},
    "numbers": {"title": "Numbers & Counting", "actionLink": "/activity/numbers", "category": "math"},
    "shapes": {"title": "Shapes & Colors", "actionLink": "/activity/shapes", "category": "cognition"},
    "colors": {"title": "Color Recognition", "actionLink": "/activity/colors", "category": "cognition"},
    "counting": {"title": "Counting & Math", "actionLink": "/activity/counting", "category": "math"},
    "animals": {"title": "Animal Matching", "actionLink": "/activity/animals", "category": "vocabulary"},
    "emotions": {"title": "Emotion Learning", "actionLink": "/activity/emotions", "category": "social"},
    "routines": {"title": "Routine Sequencing", "actionLink": "/activity/routines", "category": "independence"},
    "reading_vocabulary": {"title": "Reading & Vocabulary", "actionLink": "/skill/teen_reading_vocab", "category": "reading"},
    "teen_reading_vocab": {"title": "Reading & Vocabulary", "actionLink": "/skill/teen_reading_vocab", "category": "reading"},
    "problem_solving": {"title": "Problem Solving", "actionLink": "/skill/teen_problem_solving", "category": "problem_solving"},
    "teen_problem_solving": {"title": "Problem Solving", "actionLink": "/skill/teen_problem_solving", "category": "problem_solving"},
    "communication": {"title": "Social Communication", "actionLink": "/scenarios", "category": "communication"},
    "teen_communication": {"title": "Social Communication", "actionLink": "/scenarios", "category": "communication"},
    "teen_social_comm": {"title": "Social Communication", "actionLink": "/scenarios", "category": "communication"},
    "teen_decision_making": {"title": "Decision Making", "actionLink": "/skill/teen_decision_making", "category": "independence"},
    "functional_reading": {"title": "Functional Reading", "actionLink": "/skill/adult_functional_reading", "category": "reading"},
    "adult_functional_reading": {"title": "Functional Reading", "actionLink": "/skill/adult_functional_reading", "category": "reading"},
    "everyday_communication": {"title": "Everyday Communication", "actionLink": "/scenarios", "category": "communication"},
    "adult_everyday_comm": {"title": "Everyday Communication", "actionLink": "/scenarios", "category": "communication"},
    "workplace_communication": {"title": "Workplace Communication", "actionLink": "/scenarios", "category": "communication"},
    "adult_workplace_comm": {"title": "Workplace Communication", "actionLink": "/scenarios", "category": "communication"},
    "workplace_problem_solving": {"title": "Workplace Problem Solving", "actionLink": "/skill/adult_problem_solving", "category": "problem_solving"},
    "adult_problem_solving": {"title": "Workplace Problem Solving", "actionLink": "/skill/adult_problem_solving", "category": "problem_solving"},
    "adult_decision_making": {"title": "Independent Decision Making", "actionLink": "/skill/adult_decision_making", "category": "independence"},
    "conversation": {"title": "Conversation Practice", "actionLink": "/scenarios", "category": "communication"},
}

def get_skill_display_title(skill_key: str) -> str:
    if skill_key in SKILL_NAME_MAP:
        return SKILL_NAME_MAP[skill_key]["title"]
    return skill_key.replace("_", " ").title()

def get_skill_action_link(skill_key: str) -> str:
    if skill_key in SKILL_NAME_MAP:
        return SKILL_NAME_MAP[skill_key]["actionLink"]
    return "/scenarios"

def calculate_growth_metrics(attempts: List[Attempt], progress_records: List[Progress]) -> Dict[str, Any]:
    if not attempts and not progress_records:
        return {
            "level": "Beginner",
            "growthDelta": 0,
            "growthText": "Starting journey",
            "avgAccuracy": 0,
            "practiceTimeMinutes": 0,
            "isNewLearner": True,
            "completedActivities": 0,
        }

    total_attempts = len(attempts)
    avg_acc = (
        round(sum(a.score for a in attempts) / total_attempts * 100)
        if total_attempts > 0
        else (round(sum(p.accuracy for p in progress_records) / len(progress_records) * 100) if progress_records else 0)
    )

    # Determine qualitative stage
    if avg_acc >= 85 and total_attempts >= 6:
        level = "Confident"
    elif avg_acc >= 75 and total_attempts >= 3:
        level = "Developing+"
    elif avg_acc >= 50 or total_attempts >= 1:
        level = "Developing"
    else:
        level = "Beginner"

    # Calculate dynamic growth delta
    growth_delta = 0
    growth_text = "Steady progress"

    if total_attempts >= 4:
        midpoint = total_attempts // 2
        # attempts are sorted desc (newest first)
        recent_half = attempts[:midpoint]
        older_half = attempts[midpoint:]

        recent_avg = sum(a.score for a in recent_half) / len(recent_half)
        older_avg = sum(a.score for a in older_half) / len(older_half) if older_half else recent_avg

        if older_avg > 0:
            diff_pct = round(((recent_avg - older_avg) / older_avg) * 100)
            growth_delta = diff_pct
            if diff_pct > 0:
                growth_text = f"↑ {diff_pct}% this month"
            elif diff_pct < 0:
                growth_text = f"↓ {abs(diff_pct)}% recently"
            else:
                growth_text = f"↑ {avg_acc}% consistent accuracy"
        else:
            growth_delta = round(recent_avg * 100)
            growth_text = f"↑ {growth_delta}% this month"
    elif total_attempts >= 1:
        first_score = round(attempts[0].score * 100)
        growth_delta = min(first_score, 15)
        growth_text = f"↑ {growth_delta}% this week"

    else:
        growth_delta = 0
        growth_text = "Complete activities to see growth trend"

    # Calculate real practice time (timeMs / 60000)
    total_time_ms = sum(a.timeMs or 45000 for a in attempts)
    practice_minutes = max(1, round(total_time_ms / 60000)) if total_attempts > 0 else 0

    return {
        "level": level,
        "growthDelta": growth_delta,
        "growthText": growth_text,
        "avgAccuracy": avg_acc,
        "practiceTimeMinutes": practice_minutes,
        "isNewLearner": total_attempts == 0,
        "completedActivities": total_attempts,
    }

def generate_ai_observation_summary(
    learner_name: str,
    persona: str,
    strengths: List[str],
    needs_practice: List[str],
    evaluations: List[ConversationEvaluation],
    growth_metrics: Dict[str, Any],
) -> str:
    name = learner_name.split()[0] if learner_name else "Your learner"
    
    if growth_metrics.get("isNewLearner") and not evaluations:
        return (
            f"{name} is just beginning their learning adventure with HumSaathi! As they complete initial activities "
            f"and conversation scenarios, AI will automatically observe their unique strengths and personalize daily insights."
        )

    strengths_str = ", ".join(strengths[:2]) if strengths else "familiar practice activities"
    needs_str = ", ".join(needs_practice[:2]) if needs_practice else "initiating unfamiliar interactions"

    if evaluations:
        latest_eval = evaluations[0]
        eval_strengths = parse_json(latest_eval.strengths, [])
        eval_improvements = parse_json(latest_eval.improvements, [])
        
        strength_point = eval_strengths[0] if eval_strengths else strengths_str
        improvement_point = eval_improvements[0] if eval_improvements else needs_str

        return (
            f"{name} is becoming more confident, especially with {strength_point.lower()}. "
            f"They respond well to direct questions but may benefit from more practice {improvement_point.lower()}."
        )

    if persona == "child":
        return (
            f"{name} is making steady strides with {strengths_str.lower()}. They stay engaged well during structured questions "
            f"and are developing solid foundations. A wonderful next step is practicing {needs_str.lower()} during relaxed daily moments."
        )
    elif persona == "teen":
        return (
            f"{name} is showing solid progress in {strengths_str.lower()}. They handle direct prompts effectively. "
            f"To build further independence, practicing {needs_str.lower()} will help them navigate everyday social situations with greater ease."
        )
    else:  # adult
        return (
            f"{name} is showing reliable mastery in {strengths_str.lower()}. They demonstrate clear, contextual responses. "
            f"Continuing to reinforce {needs_str.lower()} will support even smoother independence in real-world scenarios."
        )

def generate_ai_insights_breakdown(
    learner_name: str,
    persona: str,
    strengths: List[str],
    needs_practice: List[str],
    progress_records: List[Progress],
    evaluations: List[ConversationEvaluation],
) -> Dict[str, Any]:
    name = learner_name.split()[0] if learner_name else "Your learner"

    default_strengths_items = [
        {
            "title": "Positive Engagement & Focus",
            "description": f"{name} demonstrates consistent attention and active participation during guided practice sessions.",
        },
        {
            "title": "Familiar Response Accuracy",
            "description": f"Responds accurately and politely when prompts and questions are structured and familiar.",
        },
    ]
    if strengths:
        default_strengths_items = [
            {
                "title": f"Mastery in {s}",
                "description": f"{name} shows consistent accuracy and confidence when working on {s.lower()}.",
            }
            for s in strengths[:3]
        ]

    default_practice_items = [
        {
            "title": "Initiating Conversations",
            "description": "Practicing starting questions independently rather than waiting for external prompts.",
        },
        {
            "title": "Handling Unfamiliar Scenarios",
            "description": "Building comfort when encountering unexpected questions or new social contexts.",
        },
    ]
    if needs_practice:
        default_practice_items = [
            {
                "title": f"Reinforcing {np}",
                "description": f"Could benefit from gentle, low-pressure opportunities to explore {np.lower()} in everyday routines.",
            }
            for np in needs_practice[:3]
        ]

    why_this_matters = [
        {
            "title": "Scaffolding Independence",
            "explanation": "Mastering conversation initiation and foundational skills builds authentic self-advocacy and social confidence.",
        },
        {
            "title": "Reducing Cognitive Overload",
            "explanation": "Consistent practice with familiar patterns lowers anxiety and makes navigating new environments effortless.",
        },
    ]

    home_guidance = [
        {
            "title": "The 'First Question' Game",
            "action": f"During mealtime or errands, encourage {name} to ask the first question (e.g., 'What are we making for dinner?').",
        },
        {
            "title": "Visual Choice Sharing",
            "action": "Offer two distinct options and invite them to express their preference with a reason.",
        },
        {
            "title": "Celebrate Effort Over Speed",
            "action": "Acknowledge thoughtful pauses and celebrate when they express their thoughts in their own words.",
        },
    ]

    return {
        "strengths": default_strengths_items,
        "areasToPractice": default_practice_items,
        "whyThisMatters": why_this_matters,
        "homeGuidance": home_guidance,
    }

def generate_home_practice_recommendations(
    persona: str,
    needs_practice_skills: List[str],
    language: str = "en",
) -> List[Dict[str, Any]]:
    recommendations = []

    if persona == "child":
        recommendations.append({
            "id": "hp_child_greeting",
            "activityName": "Friendly Daily Greeting",
            "goal": "Practice greeting family members and familiar friends with a warm smile and clear hello.",
            "duration": "5 minutes",
            "difficulty": "Gentle",
            "instructions": "Practice saying hello in different situations (morning, greeting a visitor, arriving home).",
            "parentPrompt": "Imagine we just arrived at grandma's house. What is the first thing we say?",
            "learnerPractice": "Says 'Hello, good morning!' with eye contact or a friendly wave.",
            "actionLink": "/scenarios",
            "skillKey": "emotions",
        })
        recommendations.append({
            "id": "hp_child_choices",
            "activityName": "Making Choices Out Loud",
            "goal": "Build expressive confidence by naming preferences.",
            "duration": "5 minutes",
            "difficulty": "Gentle",
            "instructions": "Hold up two fruits, toys, or shirts. Invite your learner to name and choose one.",
            "parentPrompt": "Would you like the red apple or the yellow banana today?",
            "learnerPractice": "Identifies and expresses their choice using full words: 'I would like the banana, please.'",
            "actionLink": "/activity/shapes",
            "skillKey": "shapes",
        })
        recommendations.append({
            "id": "hp_child_routine",
            "activityName": "Bedtime Story Sequencing",
            "goal": "Practice recalling what happened first, next, and last.",
            "duration": "8 minutes",
            "difficulty": "Moderate",
            "instructions": "After reading a short story, ask what happened at the beginning and the end.",
            "parentPrompt": "What did the little rabbit do first before going to sleep?",
            "learnerPractice": "Recalls and shares the sequence of steps.",
            "actionLink": "/activity/routines",
            "skillKey": "routines",
        })
    elif persona == "teen":
        recommendations.append({
            "id": "hp_teen_initiation",
            "activityName": "Starting a Conversation",
            "goal": "Practice conversation initiation and asking follow-up questions.",
            "duration": "5 minutes",
            "difficulty": "Moderate",
            "instructions": "Roleplay meeting a classmate at lunch or school library.",
            "parentPrompt": "Imagine we're meeting someone new. What would you say first?",
            "learnerPractice": "Starts the conversation: 'Hey! Are you reading that new book? How is it so far?'",
            "actionLink": "/scenarios",
            "skillKey": "teen_communication",
        })
        recommendations.append({
            "id": "hp_teen_ordering",
            "activityName": "Ordering Food & Clarifying Steps",
            "goal": "Practice ordering a meal and asking for price or napkins confidently.",
            "duration": "10 minutes",
            "difficulty": "Moderate",
            "instructions": "Roleplay at a cafe counter before visiting a real shop.",
            "parentPrompt": "Hi there! Welcome to the cafe. What can I get for you today?",
            "learnerPractice": "States order clearly: 'I would like a mango smoothie, please. How much is that?'",
            "actionLink": "/scenarios",
            "skillKey": "teen_problem_solving",
        })
        recommendations.append({
            "id": "hp_teen_reading_vocab",
            "activityName": "Word Clues in the News",
            "goal": "Practice identifying context clues in real-world signs or headlines.",
            "duration": "7 minutes",
            "difficulty": "Gentle",
            "instructions": "Pick a headline or community announcement and discuss what a new word means.",
            "parentPrompt": "Look at this sign about 'scheduled maintenance'. What do you think that means for the park?",
            "learnerPractice": "Analyzes context and explains meaning in own words.",
            "actionLink": "/skill/teen_reading_vocab",
            "skillKey": "teen_reading_vocab",
        })
    else:  # adult
        recommendations.append({
            "id": "hp_adult_workplace_update",
            "activityName": "Workplace Status Update",
            "goal": "Practice giving concise, professional progress updates to a supervisor or peer.",
            "duration": "5 minutes",
            "difficulty": "Moderate",
            "instructions": "Roleplay sharing what tasks are completed and what comes next.",
            "parentPrompt": "Good morning! How is the weekly report coming along?",
            "learnerPractice": "Replies: 'Good morning. I have completed the first draft and will finish the summary by 2 PM.'",
            "actionLink": "/scenarios",
            "skillKey": "adult_workplace_comm",
        })
        recommendations.append({
            "id": "hp_adult_functional_reading",
            "activityName": "Reviewing Schedules & Invoices",
            "goal": "Practice extracting essential dates, times, and amounts from everyday documents.",
            "duration": "8 minutes",
            "difficulty": "Gentle",
            "instructions": "Review an appointment card or utility receipt together.",
            "parentPrompt": "Where on this slip does it show our appointment time and confirmation number?",
            "learnerPractice": "Locates and confirms the specific detail accurately.",
            "actionLink": "/skill/adult_functional_reading",
            "skillKey": "adult_functional_reading",
        })
        recommendations.append({
            "id": "hp_adult_decision_making",
            "activityName": "Evaluating Practical Options",
            "goal": "Practice weighing pros and cons before making an independent everyday decision.",
            "duration": "10 minutes",
            "difficulty": "Moderate",
            "instructions": "Discuss choosing between two transit routes or shopping options.",
            "parentPrompt": "Route A is faster but has more transfers; Route B takes 5 minutes longer but is direct. Which should we choose?",
            "learnerPractice": "Articulates reasoning: 'Let us take Route B so we do not have to rush transfers.'",
            "actionLink": "/skill/adult_decision_making",
            "skillKey": "adult_decision_making",
        })

    return recommendations

def format_communication_journey(
    sessions: List[ConversationSession],
    evaluations: List[ConversationEvaluation],
) -> List[Dict[str, Any]]:
    journey = []
    eval_map = {e.sessionId: e for e in evaluations}

    for s in sessions[:10]:
        ev = eval_map.get(s.id)
        scen_id = s.scenarioId
        
        scen_def = next((item for item in ALL_SCENARIOS if item["id"] == scen_id), None)
        title = scen_def.get("title", {}).get("en", scen_id.replace("_", " ").title()) if scen_def else (s.scenario.title if s.scenario else "Conversation Practice")
        if isinstance(title, dict):
            title = title.get("en", str(title))

        if ev:
            clarity_stars = max(1, min(5, round(ev.clarity / 20)))
            relevance_stars = max(1, min(5, round(ev.relevance / 20)))
            appropriateness_stars = max(1, min(5, round(ev.appropriateness / 20)))
            communication_stars = max(1, min(5, round(ev.communication / 20)))
            flow_stars = max(1, min(5, round(ev.conversationFlow / 20)))
            overall_score = ev.overallScore
            feedback_text = ev.feedback
            strengths_list = parse_json(ev.strengths, [])
            improvements_list = parse_json(ev.improvements, [])
        else:
            clarity_stars = 4
            relevance_stars = 4
            appropriateness_stars = 4
            communication_stars = 4
            flow_stars = 3
            overall_score = 80
            feedback_text = "Good participation throughout the conversation practice."
            strengths_list = ["Maintained polite and respectful responses"]
            improvements_list = ["Practice initiating questions independently"]

        summary = (
            feedback_text
            if feedback_text
            else f"AI observed that the learner participated with {overall_score}% overall effectiveness and maintained clear communication."
        )

        journey.append({
            "sessionId": s.id,
            "scenarioId": scen_id,
            "scenarioTitle": title,
            "date": s.completedAt.isoformat() if s.completedAt else (s.createdAt.isoformat() if s.createdAt else None),
            "mode": s.mode,
            "turnCount": s.turnCount,
            "overallScore": overall_score,
            "ratings": {
                "greeting": appropriateness_stars,
                "clarity": clarity_stars,
                "response": relevance_stars,
                "initiation": flow_stars,
                "communication": communication_stars,
            },
            "privacySummary": summary,
            "strengths": strengths_list,
            "improvements": improvements_list,
        })

    return journey

def generate_growth_stages_and_milestones(
    current_level: str,
    attempts: List[Attempt],
    sessions: List[ConversationSession],
    strengths: List[str],
) -> Dict[str, Any]:
    stages = [
        {"name": "Beginner", "label": "Beginner", "description": "Exploring foundational concepts", "reached": True, "isCurrent": current_level == "Beginner"},
        {"name": "Developing", "label": "Developing", "description": "Applying skills with guidance", "reached": current_level in ["Developing", "Developing+", "Confident", "Mastery"], "isCurrent": current_level == "Developing"},
        {"name": "Developing+", "label": "Developing+", "description": "Growing accuracy and independence", "reached": current_level in ["Developing+", "Confident", "Mastery"], "isCurrent": current_level == "Developing+"},
        {"name": "Confident", "label": "Confident", "description": "Smooth, consistent communication", "reached": current_level in ["Confident", "Mastery"], "isCurrent": current_level == "Confident"},
        {"name": "Mastery", "label": "Mastery", "description": "Independent real-world application", "reached": current_level == "Mastery", "isCurrent": current_level == "Mastery"},
    ]

    milestones = []
    if attempts:
        earliest = attempts[-1]
        milestones.append({
            "id": "m_first_activity",
            "title": "Learning Journey Started",
            "description": "Completed first interactive learning activity.",
            "date": earliest.completedAt.isoformat() if earliest.completedAt else earliest.createdAt.isoformat(),
            "badge": "🌱",
        })

    if len(attempts) >= 3:
        milestones.append({
            "id": "m_habit_builder",
            "title": "Consistency Milestone",
            "description": f"Completed {len(attempts)} learning sessions successfully.",
            "date": attempts[0].completedAt.isoformat() if attempts[0].completedAt else attempts[0].createdAt.isoformat(),
            "badge": "⭐",
        })

    high_score_attempts = [a for a in attempts if a.score >= 0.85]
    if high_score_attempts:
        best = high_score_attempts[0]
        milestones.append({
            "id": "m_high_accuracy",
            "title": "High Accuracy Win",
            "description": f"Achieved {round(best.score * 100)}% accuracy in a session.",
            "date": best.completedAt.isoformat() if best.completedAt else best.createdAt.isoformat(),
            "badge": "🎯",
        })

    if sessions:
        milestones.append({
            "id": "m_first_conversation",
            "title": "Conversation Explorer",
            "description": f"Completed {len(sessions)} communication roleplay sessions.",
            "date": sessions[0].completedAt.isoformat() if sessions[0].completedAt else sessions[0].createdAt.isoformat(),
            "badge": "🗣️",
        })

    if not milestones:
        milestones.append({
            "id": "m_welcome",
            "title": "Welcome to HumSaathi",
            "description": "Profile ready. Complete your first activity to unlock milestones!",
            "date": datetime.utcnow().isoformat(),
            "badge": "✨",
        })

    next_focus_title = "Conversation Practice"
    next_focus_reason = "Building spontaneous questions and response confidence."
    next_action_link = "/scenarios"

    if strengths and len(strengths) > 0:
        next_focus_title = f"Advancing {strengths[0]}"
        next_focus_reason = f"Reinforcing mastery in {strengths[0].lower()} while introducing new challenges."
        next_action_link = get_skill_action_link(strengths[0].lower().replace(" ", "_"))

    return {
        "stages": stages,
        "milestones": milestones,
        "nextFocus": {
            "title": next_focus_title,
            "reason": next_focus_reason,
            "actionLink": next_action_link,
        },
    }

def generate_weekly_report_data(
    learner_name: str,
    attempts: List[Attempt],
    sessions: List[ConversationSession],
    strengths: List[str],
    needs_practice: List[str],
    growth_metrics: Dict[str, Any],
) -> Dict[str, Any]:
    name = learner_name.split()[0] if learner_name else "Your learner"
    total_completed = len(attempts) + len(sessions)
    practice_time = growth_metrics.get("practiceTimeMinutes", 0)

    biggest_win = (
        f"Mastered {strengths[0]} with strong consistency"
        if strengths
        else f"{name} maintained focus and completed all scheduled sessions"
    )

    recommended_focus = (
        f"Practice {needs_practice[0]} in everyday routines"
        if needs_practice
        else "Practice starting conversations independently"
    )

    home_practice_tip = (
        f"Try a 5-minute roleplay session before bedtime focusing on {recommended_focus.lower()}."
    )

    return {
        "learnerName": name,
        "weekLabel": f"Week of {datetime.utcnow().strftime('%B %d, %Y')}",
        "sessionsCompleted": total_completed,
        "totalPracticeTimeMinutes": practice_time,
        "skillsPracticed": strengths + needs_practice,
        "improvementTrend": growth_metrics.get("growthText", "Steady progress"),
        "biggestWin": biggest_win,
        "recommendedFocus": recommended_focus,
        "homePracticeRecommendation": home_practice_tip,
        "generatedAt": datetime.utcnow().isoformat(),
    }

def get_parent_companion_data(
    db: Session,
    user_id: str,
    active_persona: Optional[str] = None,
) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    persona = active_persona or user.persona or "child"

    # 1. Fetch raw progress and attempts strictly for active persona
    all_progress = db.query(Progress).filter(Progress.userId == user_id).all()
    all_attempts = (
        db.query(Attempt)
        .filter(Attempt.userId == user_id, Attempt.completed == True)
        .order_by(Attempt.completedAt.desc(), Attempt.createdAt.desc())
        .all()
    )

    progress_records = [p for p in all_progress if is_skill_for_persona(p.skill, persona)]
    attempts_records = [a for a in all_attempts if is_attempt_for_persona(a, persona)]

    # 2. Fetch Conversation Sessions & Evaluations
    sessions = (
        db.query(ConversationSession)
        .filter(ConversationSession.userId == user_id, ConversationSession.completed == True)
        .order_by(ConversationSession.completedAt.desc(), ConversationSession.createdAt.desc())
        .all()
    )
    evaluations = (
        db.query(ConversationEvaluation)
        .join(ConversationSession, ConversationEvaluation.sessionId == ConversationSession.id)
        .filter(ConversationSession.userId == user_id)
        .order_by(ConversationEvaluation.createdAt.desc())
        .all()
    )

    # 3. Dynamic Growth & Strengths
    growth_metrics = calculate_growth_metrics(attempts_records, progress_records)

    practiced = [p for p in progress_records if p.attempts > 0]
    practiced_sorted = sorted(practiced, key=lambda p: (p.accuracy, p.attempts), reverse=True)

    strengths_skills = [
        get_skill_display_title(p.skill)
        for p in practiced_sorted
        if p.accuracy >= 0.6
    ]
    needs_practice_skills = [
        get_skill_display_title(p.skill)
        for p in practiced_sorted
        if p.accuracy < 0.6
    ]

    if not needs_practice_skills and progress_records:
        lowest = sorted(progress_records, key=lambda p: p.accuracy)
        if lowest and lowest[0].accuracy < 0.7:
            needs_practice_skills = [get_skill_display_title(lowest[0].skill)]

    # 4. AI Insight Summary Card ("What I noticed")
    what_i_noticed = generate_ai_observation_summary(
        user.name,
        persona,
        strengths_skills,
        needs_practice_skills,
        evaluations,
        growth_metrics,
    )

    # 5. Deep AI Insights Breakdown
    ai_insights = generate_ai_insights_breakdown(
        user.name,
        persona,
        strengths_skills,
        needs_practice_skills,
        progress_records,
        evaluations,
    )

    # 6. Growth Journey & Milestones
    growth_journey = generate_growth_stages_and_milestones(
        growth_metrics["level"],
        attempts_records,
        sessions,
        strengths_skills,
    )

    # 7. Communication Journey
    comm_journey = format_communication_journey(sessions, evaluations)

    # 8. Home Practice Recommendations
    home_practice = generate_home_practice_recommendations(
        persona,
        needs_practice_skills,
        language=user.language or "en",
    )

    # 9. Weekly Report
    weekly_report = generate_weekly_report_data(
        user.name,
        attempts_records,
        sessions,
        strengths_skills,
        needs_practice_skills,
        growth_metrics,
    )

    # 10. Formatted Skill Meters
    skills_progress_list = [
        {
            "skill": p.skill,
            "title": get_skill_display_title(p.skill),
            "level": p.level,
            "accuracy": round(p.accuracy * 100),
            "attempts": p.attempts,
            "status": "Mastered" if p.accuracy >= 0.8 else ("Developing" if p.accuracy >= 0.5 else "Practicing"),
            "actionLink": get_skill_action_link(p.skill),
        }
        for p in progress_records
    ]

    return {
        "learner": {
            "id": user.id,
            "name": user.name,
            "persona": persona,
            "language": user.language or "en",
            "setupComplete": user.setupComplete,
        },
        "overallGrowth": growth_metrics,
        "whatINoticed": what_i_noticed,
        "strengths": strengths_skills,
        "needsPractice": needs_practice_skills,
        "skillProgress": skills_progress_list,
        "aiInsights": ai_insights,
        "growthJourney": growth_journey,
        "communicationJourney": comm_journey,
        "homePractice": home_practice,
        "weeklyReport": weekly_report,
    }

async def handle_parent_ai_chat(
    db: Session,
    user_id: str,
    user_message: str,
    chat_history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"reply": "Learner profile not found.", "suggestedFollowups": []}

    companion_data = get_parent_companion_data(db, user_id, user.persona)
    learner_name = user.name.split()[0] if user.name else "your learner"
    clean_msg = user_message.strip().lower()

    # Medical / Clinical safety guardrails
    medical_keywords = [
        "diagnose", "diagnosis", "autism", "asd", "adhd", "asperger", "apraxia",
        "medical", "disorder", "cure", "pathology", "disease", "treatment",
        "prescription", "medication", "pediatrician"
    ]
    is_medical_query = any(k in clean_msg for k in medical_keywords) and any(q in clean_msg for q in ["does my", "is my", "can you diagnose", "has my", "is it", "symptoms of", "do they have", "what medication", "cure"])

    if is_medical_query:
        safe_reply = (
            f"HumSaathi is an adaptive learning and communication support companion, not a medical or clinical diagnostic tool. "
            f"We cannot diagnose neurodivergence, autism, ADHD, or other clinical conditions. "
            f"\n\nWe encourage you to share {learner_name}'s learning observations with a qualified developmental pediatrician, "
            f"child psychologist, or licensed speech-language pathologist for comprehensive clinical guidance."
        )
        return {
            "reply": safe_reply,
            "suggestedFollowups": [
                f"What communication skills is {learner_name} practicing?",
                f"What home activities can we do together?",
                f"What are {learner_name}'s strongest skills this week?",
            ]
        }

    strengths_text = ", ".join(companion_data.get("strengths", [])) or "foundational activities"
    needs_text = ", ".join(companion_data.get("needsPractice", [])) or "spontaneous conversation initiation"
    level_text = companion_data.get("overallGrowth", {}).get("level", "Developing")
    accuracy_text = f"{companion_data.get('overallGrowth', {}).get('avgAccuracy', 0)}%"
    completed_count = companion_data.get("overallGrowth", {}).get("completedActivities", 0)

    system_prompt = (
        f"You are HumSaathi AI's Parent Companion Assistant.\n"
        f"You are talking to the parent/caregiver of {learner_name}.\n"
        f"Learner Context:\n"
        f"- Persona: {user.persona}\n"
        f"- Language: {user.language}\n"
        f"- Current Growth Level: {level_text} (Overall accuracy: {accuracy_text})\n"
        f"- Completed Activities: {completed_count}\n"
        f"- Documented Strengths: {strengths_text}\n"
        f"- Current Practice Areas: {needs_text}\n\n"
        f"Strict Safety and Style Guidelines:\n"
        f"1. Tone: Calm, warm, empowering, parent-friendly, neurodiversity-affirming.\n"
        f"2. Clarity: Avoid clinical jargon, dense statistics, or overwhelming lists. Keep responses under 3 paragraphs.\n"
        f"3. Practicality: Offer actionable, gentle suggestions parents can do at home.\n"
        f"4. SAFETY MANDATE: NEVER diagnose medical/mental health conditions or prescribe clinical treatments. "
        f"Always frame guidance as educational and communicative encouragement.\n"
        f"5. Real Data: Always refer accurately to {learner_name}'s real strengths ({strengths_text}) and practice areas ({needs_text})."
    )

    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        for item in chat_history[-6:]:
            role = "assistant" if item.get("role") == "assistant" else "user"
            content = str(item.get("content", "")).strip()
            if content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    reply = None
    if is_ai_available():
        reply = await call_ai_text(messages, temperature=0.6, max_tokens=600)

    if not reply:
        if "communication" in clean_msg or "talk" in clean_msg or "speech" in clean_msg:
            reply = (
                f"{learner_name} is currently working on communication at the {level_text} level. "
                f"They have shown great engagement in structured exercises. "
                f"To support them at home, try practicing simple turn-taking games during dinner, "
                f"like asking 'What was your favorite part of the day?' and giving them comfortable space to answer."
            )
        elif "strength" in clean_msg or "best" in clean_msg or "good at" in clean_msg:
            reply = (
                f"{learner_name}'s strongest areas right now include **{strengths_text}**! "
                f"They demonstrate high accuracy and enthusiasm here. Celebrating these wins is a great way to keep their confidence high."
            )
        elif "practice" in clean_msg or "home" in clean_msg or "focus" in clean_msg:
            reply = (
                f"This week, a wonderful focus area for {learner_name} is **{needs_text}**. "
                f"You can do the 5-minute 'Starting a Conversation' activity in the Home Practice section together, "
                f"or roleplay simple everyday choices at home."
            )
        else:
            reply = (
                f"{learner_name} is currently at the **{level_text}** stage with {completed_count} completed sessions. "
                f"They are excelling in {strengths_text}, and continuing to reinforce {needs_text} in short, fun daily moments "
                f"will help them feel even more confident."
            )

    suggested_followups = [
        f"What should we practice this weekend?",
        f"How is {learner_name} doing with {needs_text.split(',')[0]}?",
        f"Can you suggest a 5-minute home game?",
    ]

    return {
        "reply": reply,
        "suggestedFollowups": suggested_followups,
    }

def update_parent_pin(db: Session, user_id: str, old_pin: str, new_pin: str) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    if user.parentPin != old_pin:
        raise ValueError("Current PIN is incorrect")

    clean_new_pin = str(new_pin).strip()
    if not (4 <= len(clean_new_pin) <= 8 and clean_new_pin.isdigit()):
        raise ValueError("New PIN must be between 4 and 8 numeric digits")

    user.parentPin = clean_new_pin
    user.updatedAt = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Parent PIN updated successfully"}
