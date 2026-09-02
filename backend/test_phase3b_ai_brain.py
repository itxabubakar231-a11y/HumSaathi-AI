import pytest
from app.services.ai.intent_classifier import classify_intent, detect_language, IntentCategory
from app.services.ai.knowledge_base import retrieve_relevant_knowledge, normalize_multilingual_text
from app.services.ai.context_builder import assemble_context_window, resolve_referent_anchor


# =============================================================================
# 1. FIX 1: TECHNICAL COLLISION DEFENSE
# =============================================================================

def test_class_fellow_not_technical():
    """Verify 'class fellow' and school queries never trigger TECHNICAL_QUESTION."""
    comm_queries = [
        "class fellow se baat kese shuru karun",
        "yaar naye class fellow se baat kese shuru karun",
        "classmate se baat kaise karun",
        "new class fellow se friendship kaise start karun",
        "math class mein kisi se baat kaise shuru karun",
    ]
    for q in comm_queries:
        res = classify_intent(q, persona="teen")
        assert res["category"] == IntentCategory.COMMUNICATION_COACHING, f"Failed on '{q}': got {res['category']}"


def test_programming_class_remains_technical():
    """Verify actual OOP programming class questions remain TECHNICAL_QUESTION."""
    prog_queries = [
        "What is a class in Python?",
        "How do I create a class in Java?",
        "Explain class inheritance",
        "What is a subclass?",
        "How does class definition work?",
        "Show me a Python class example",
    ]
    for q in prog_queries:
        res = classify_intent(q, persona="adult")
        assert res["category"] == IntentCategory.TECHNICAL_QUESTION, f"Failed on '{q}': got {res['category']}"


# =============================================================================
# 2. FIX 2: ZERO OUT-OF-DOMAIN KNOWLEDGE POLLUTION
# =============================================================================

def test_out_of_domain_retrieval_is_empty():
    """Unrelated questions must return empty string (pure general intelligence)."""
    ood_queries = [
        ("What is quantum physics?", IntentCategory.GENERAL_QUESTION, "teen"),
        ("Who won yesterday's cricket match?", IntentCategory.GENERAL_QUESTION, "teen"),
        ("Explain Python classes.", IntentCategory.TECHNICAL_QUESTION, "adult"),
        ("What is photosynthesis?", IntentCategory.GENERAL_QUESTION, "teen"),
        ("Tell me a joke.", IntentCategory.CASUAL_CONVERSATION, "teen"),
    ]
    for q, intent, persona in ood_queries:
        res = retrieve_relevant_knowledge(intent=intent, persona=persona, user_message=q)
        assert res == "", f"Expected empty knowledge for OOD '{q}', got:\n{res}"


def test_in_domain_retrieval_remains_active():
    """Genuine HumSaathi coaching queries must retrieve rich coaching knowledge."""
    in_domain_queries = [
        ("How do I make friends?", IntentCategory.COMMUNICATION_COACHING, "teen"),
        ("How do I start a conversation?", IntentCategory.COMMUNICATION_COACHING, "teen"),
        ("How do I ask my teacher for help?", IntentCategory.COMMUNICATION_COACHING, "teen"),
        ("I have a job interview tomorrow. Help me practice.", IntentCategory.ADULT_LEARNING, "adult"),
        ("My child doesn't know how to ask for help.", IntentCategory.PARENT_COACHING, "parent"),
    ]
    for q, intent, persona in in_domain_queries:
        res = retrieve_relevant_knowledge(intent=intent, persona=persona, user_message=q)
        assert len(res) > 50, f"Expected relevant knowledge for in-domain '{q}', got empty string!"


# =============================================================================
# 3. FIX 3: ROMAN URDU PHONETIC SPELLING DETECTION
# =============================================================================

def test_roman_urdu_phonetic_variants():
    """Verify common Roman Urdu phonetic spelling variants route to ur_rm."""
    roman_queries = [
        "teacher se help kaise maangun?",
        "teacher se help kaisy maangun?",
        "teacher se help kesy maangun?",
        "mujhe kya bolna chahiye?",
        "main ye kaise karun?",
        "mujhy samjha do",
        "yaar naye class fellow se baat kese shuru karun",
    ]
    for q in roman_queries:
        lang = detect_language(q)
        assert lang == "ur_rm", f"Failed on '{q}': got '{lang}' instead of 'ur_rm'"


def test_standard_english_remains_en():
    """Verify regular English queries are not misclassified as Roman Urdu."""
    en_queries = [
        "How can I communicate better?",
        "What is Python?",
        "Can you explain this?",
        "What is quantum physics?",
        "How do I start a conversation with a new person?",
    ]
    for q in en_queries:
        lang = detect_language(q)
        assert lang == "en", f"Failed on '{q}': got '{lang}' instead of 'en'"


# =============================================================================
# 4. FIX 4: ADULT COMMUNITY & SOCIAL CONNECTION KNOWLEDGE
# =============================================================================

def test_adult_social_connection_knowledge():
    """Adult asking how to make friends retrieves adult social framework, NOT teen school starters."""
    q = "How do I make friends as an adult?"
    res = retrieve_relevant_knowledge(
        intent=IntentCategory.COMMUNICATION_COACHING,
        persona="adult",
        user_message=q,
    )
    assert "Adult Community: Making Friends & Social Connections" in res
    assert "Repeated Environments" in res
    assert "Teen Communication: Starting Conversations" not in res
    assert "classmate" not in res.lower()


def test_friendship_persona_isolation():
    """Verify 'How do I make friends?' isolates knowledge across all 4 personas."""
    # Child
    child_res = retrieve_relevant_knowledge(IntentCategory.COMMUNICATION_COACHING, "child", "How do I make friends?")
    assert "Child Communication: Making Friends & Sharing" in child_res
    assert "Adult Community" not in child_res

    # Teen
    teen_res = retrieve_relevant_knowledge(IntentCategory.COMMUNICATION_COACHING, "teen", "How do I make friends?")
    assert "Teen Communication: Starting Conversations" in teen_res
    assert "Adult Community" not in teen_res

    # Adult
    adult_res = retrieve_relevant_knowledge(IntentCategory.COMMUNICATION_COACHING, "adult", "How do I make friends?")
    assert "Adult Community: Making Friends & Social Connections" in adult_res
    assert "Teen Communication" not in adult_res

    # Parent
    parent_res = retrieve_relevant_knowledge(IntentCategory.PARENT_COACHING, "parent", "How do I make friends?")
    assert "Parent Companion" in parent_res
    assert "Adult Community" not in parent_res


# =============================================================================
# 5. FIX 5: PERSISTENT PRIMARY TOPIC ANCHOR IN MULTI-TURN
# =============================================================================

def test_multi_turn_interview_persistence():
    """Simulate 5-turn interview conversation and verify interview topic persists across all turns."""
    turns = [
        "I have a job interview tomorrow.",
        "What should I say first?",
        "What if they ask about my weakness?",
        "Can you give me an example?",
        "Make it simpler.",
    ]
    history = []
    for turn_idx, turn in enumerate(turns, 1):
        ctx = assemble_context_window(
            history=history,
            user_message=turn,
            user_persona="adult",
            user_language="en",
        )
        anchor = ctx["topic_anchor"]
        assert "job interview" in anchor.lower(), f"Turn {turn_idx} lost interview topic! Anchor was: '{anchor}'"

        system_prompt = ctx["system_prompt"]
        assert "Job Interview Mastery" in system_prompt or "STAR Method" in system_prompt, f"Turn {turn_idx} lost interview knowledge!"

        history.append({"role": "user", "content": turn})
        history.append({"role": "assistant", "content": f"Response to turn {turn_idx}"})


def test_multi_turn_topic_switching():
    """Verify topic anchor switches when user introduces a new substantive topic."""
    history = [
        {"role": "user", "content": "I have a job interview tomorrow."},
        {"role": "assistant", "content": "Let's practice for your interview."},
        {"role": "user", "content": "What should I say first?"},
        {"role": "assistant", "content": "Start with a professional greeting."},
    ]

    # New topic turn
    switch_turn = "By the way, how do I make friends at work?"
    ctx = assemble_context_window(history=history, user_message=switch_turn, user_persona="adult", user_language="en")
    anchor = ctx["topic_anchor"]
    assert "friends at work" in anchor.lower() or "make friends" in anchor.lower()

    # Follow-up on new topic
    history.append({"role": "user", "content": switch_turn})
    history.append({"role": "assistant", "content": "Here is how to make friends at work."})

    followup_turn = "What should I say to them?"
    ctx2 = assemble_context_window(history=history, user_message=followup_turn, user_persona="adult", user_language="en")
    anchor2 = ctx2["topic_anchor"]
    assert "friends at work" in anchor2.lower() or "make friends" in anchor2.lower()


# =============================================================================
# 6. FIX 6: COMMUNICATION COACHING CONFIDENCE
# =============================================================================

def test_communication_coaching_confidence():
    """Verify communication coaching requests receive high confidence category."""
    coach_queries = [
        "What can I say to break the ice?",
        "What should I say first?",
        "How do I start a conversation?",
        "What should I say when meeting someone new?",
    ]
    for q in coach_queries:
        res = classify_intent(q, persona="teen")
        assert res["category"] == IntentCategory.COMMUNICATION_COACHING, f"Failed on '{q}': got {res['category']}"
        assert res["confidence"] >= 0.93


# =============================================================================
# 7. FIX 7: NORMALIZATION & PUNCTUATION SAFETY
# =============================================================================

def test_normalization_with_all_punctuation():
    """Verify punctuation marks do not break language or intent detection."""
    # With Urdu question mark and full stop
    q_ur_punc = "میں نئے کلاس فیلو سے بات کیسے شروع کروں؟"
    q_ur_clean = "میں نئے کلاس فیلو سے بات کیسے شروع کروں"
    assert detect_language(q_ur_punc) == detect_language(q_ur_clean) == "ur"
    assert classify_intent(q_ur_punc)["category"] == classify_intent(q_ur_clean)["category"] == IntentCategory.COMMUNICATION_COACHING

    # With English question mark
    q_rm_punc = "teacher se help kaisy maangun?"
    q_rm_clean = "teacher se help kaisy maangun"
    assert detect_language(q_rm_punc) == detect_language(q_rm_clean) == "ur_rm"
    assert classify_intent(q_rm_punc)["category"] == classify_intent(q_rm_clean)["category"] == IntentCategory.COMMUNICATION_COACHING
