import pytest
from app.services.ai.intent_classifier import classify_intent, detect_language, IntentCategory
from app.services.ai.knowledge_base import retrieve_relevant_knowledge, normalize_multilingual_text
from app.services.ai.context_builder import assemble_context_window, resolve_referent_anchor


# =============================================================================
# 1. MULTILINGUAL RETRIEVAL TESTS (P3 & P14)
# =============================================================================

def test_multilingual_conversation_starters():
    """Verify English, Roman Urdu, and Urdu script queries retrieve the SAME coaching knowledge."""
    en_query = "How do I start a conversation with a new classmate?"
    ur_rm_query = "main new class fellow se baat kaisy start karun?"
    ur_query = "میں نئے کلاس فیلو سے بات کیسے شروع کروں؟"

    # English
    en_knowledge = retrieve_relevant_knowledge(
        intent=IntentCategory.COMMUNICATION_COACHING,
        persona="teen",
        user_message=en_query,
    )
    assert "Teen Communication: Starting Conversations" in en_knowledge
    assert "Low-Pressure Greeting" in en_knowledge

    # Roman Urdu
    ur_rm_knowledge = retrieve_relevant_knowledge(
        intent=IntentCategory.COMMUNICATION_COACHING,
        persona="teen",
        user_message=ur_rm_query,
    )
    assert "Teen Communication: Starting Conversations" in ur_rm_knowledge
    assert "Low-Pressure Greeting" in ur_rm_knowledge

    # Urdu Script
    ur_knowledge = retrieve_relevant_knowledge(
        intent=IntentCategory.COMMUNICATION_COACHING,
        persona="teen",
        user_message=ur_query,
    )
    assert "Teen Communication: Starting Conversations" in ur_knowledge
    assert "Low-Pressure Greeting" in ur_knowledge


# =============================================================================
# 2. FOLLOW-UP TOPIC ANCHOR RETRIEVAL TESTS (P1 & P13)
# =============================================================================

def test_followup_topic_anchor_retrieval_interview():
    """
    Turn 1: "I have a job interview tomorrow. Help me practice."
    Turn 2: "What should I say first?"
    Verify Turn 2 correctly uses the resolved topic anchor to retrieve interview knowledge.
    """
    history = [
        {"role": "user", "content": "I have a job interview tomorrow. Help me practice."},
        {"role": "assistant", "content": "I would be happy to help you practice! What role are you applying for?"},
    ]
    user_message = "What should I say first?"

    # 1. Verify anchor resolution
    anchor = resolve_referent_anchor(history, user_message)
    assert "job interview" in anchor.lower()

    # 2. Verify full context window assembly uses the anchor for knowledge retrieval
    ctx = assemble_context_window(
        history=history,
        user_message=user_message,
        user_persona="adult",
        user_language="en",
    )

    system_prompt = ctx["system_prompt"]
    # Must retrieve Adult Job Interview and STAR method, NOT generic Teen or Child knowledge
    assert "Job Interview Mastery" in system_prompt or "STAR Framework" in system_prompt
    assert "Child Learning Portal" not in system_prompt


# =============================================================================
# 3. PARENT VS CHILD INTENT & KNOWLEDGE ROUTING (P6 & P15)
# =============================================================================

def test_parent_intent_not_conflated_with_child_learning():
    """Queries mentioning 'my child' must route to PARENT_COACHING, NOT CHILD_LEARNING."""
    q1 = "My child doesn't know how to ask for help."
    res1 = classify_intent(q1, persona="parent")
    assert res1["category"] == IntentCategory.PARENT_COACHING

    q2 = "How can I practice asking for help with my child at home?"
    res2 = classify_intent(q2, persona="parent")
    assert res2["category"] == IntentCategory.PARENT_COACHING

    q3 = "How can parents support communication practice?"
    res3 = classify_intent(q3, persona="parent")
    assert res3["category"] == IntentCategory.PARENT_COACHING


def test_parent_knowledge_retrieval():
    """Parent coaching query retrieves home practice and help-seeking guidance, NOT preschool games."""
    q = "My child doesn't know how to ask for help."
    knowledge = retrieve_relevant_knowledge(
        intent=IntentCategory.PARENT_COACHING,
        persona="parent",
        user_message=q,
    )
    assert "Parent Companion: Helping a Learner Learn to Ask for Help" in knowledge
    assert "Model Help-Seeking Out Loud" in knowledge
    assert "Letters & Phonics" not in knowledge


def test_actual_child_learning_preserves_child_intent():
    """Direct learner queries without parent signals still map to CHILD_LEARNING."""
    res = classify_intent("teach me letters and colors", persona="child")
    assert res["category"] == IntentCategory.CHILD_LEARNING


# =============================================================================
# 4. INTERVIEW QUERIES ACROSS LANGUAGES (P16)
# =============================================================================

def test_interview_queries_multilingual():
    """Verify job interview queries in EN, Roman Urdu, and Urdu script retrieve adult interview knowledge."""
    # English
    en_res = retrieve_relevant_knowledge(
        intent=IntentCategory.ADULT_LEARNING,
        persona="adult",
        user_message="I have a job interview tomorrow. Help me practice.",
    )
    assert "Job Interview" in en_res
    assert "STAR Framework" in en_res

    # Roman Urdu
    ur_rm_res = retrieve_relevant_knowledge(
        intent=IntentCategory.ADULT_LEARNING,
        persona="adult",
        user_message="main kal job interview ke liye practice karna chahta hoon",
    )
    assert "Job Interview" in ur_rm_res
    assert "STAR Framework" in ur_rm_res

    # Urdu Script
    ur_res = retrieve_relevant_knowledge(
        intent=IntentCategory.ADULT_LEARNING,
        persona="adult",
        user_message="کل میرا انٹرویو ہے، مجھے پریکٹس کرواؤ",
    )
    assert "Job Interview" in ur_res
    assert "STAR Framework" in ur_res


# =============================================================================
# 5. TEACHER HELP GUIDANCE
# =============================================================================

def test_teacher_help_guidance_retrieval():
    """Asking teacher for help retrieves actionable 3-step teacher communication framework."""
    q = "How can I ask my teacher for help?"
    res = retrieve_relevant_knowledge(
        intent=IntentCategory.COMMUNICATION_COACHING,
        persona="teen",
        user_message=q,
    )
    assert "Asking a Teacher for Help" in res
    assert "Respectful Timing & Greeting" in res


# =============================================================================
# 6. TEXT NORMALIZATION SAFETY
# =============================================================================

def test_multilingual_text_normalization():
    """Verify normalization cleans punctuation without destroying Urdu Unicode."""
    # Urdu
    norm_ur = normalize_multilingual_text("کیا حال ہے؟ میں ٹھیک ہوں۔")
    assert "کیا" in norm_ur
    assert "حال" in norm_ur
    assert "؟" not in norm_ur

    # English & Roman Urdu
    norm_mix = normalize_multilingual_text("Hello! YAAR, class-fellow se baat...")
    assert "hello" in norm_mix
    assert "yaar" in norm_mix
    assert "class fellow" in norm_mix
    assert "!" not in norm_mix
