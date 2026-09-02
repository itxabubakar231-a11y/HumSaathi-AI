from app.data.scenarios import DEFAULT_SCENARIOS
from app.services.ai.conversation_policy import (
    GENERAL_GROUNDING_POLICY,
    PRACTICE_SCOPE_POLICY,
    detect_off_topic_request,
    infer_topic_anchor,
    recent_chat_history,
    scope_redirect,
)
from app.services.conversation_service import generate_contextual_fallback, validate_ai_response


def _scenario(scenario_id):
    return next(item for item in DEFAULT_SCENARIOS if item["id"] == scenario_id)


def _details(scenario):
    return [
        scenario["title"],
        scenario["description"],
        scenario["context"],
        scenario["objectives"],
        scenario["aiRole"],
    ]


def test_obvious_topic_switch_is_blocked_in_closed_scenario():
    shop = _scenario("scenario_shop_buying")
    assert detect_off_topic_request(
        shop["id"], "Write a Python function to reverse a string", _details(shop)
    ) is True
    assert detect_off_topic_request(
        shop["id"], "What is the capital of Pakistan?", _details(shop)
    ) is True


def test_teacher_help_allows_subject_questions():
    teacher = _scenario("scenario_teacher_help")
    assert detect_off_topic_request(
        teacher["id"], "Can you explain this algebra equation?", _details(teacher)
    ) is False


def test_normal_scenario_replies_are_not_misclassified():
    group = _scenario("scenario_group_discussion")
    assert detect_off_topic_request(
        group["id"], "I made slides for science class before.", _details(group)
    ) is False
    assert detect_off_topic_request(
        group["id"], "Can I work on the presentation slides?", _details(group)
    ) is False


def test_fallback_redirects_instead_of_answering_off_topic_code():
    shop = _scenario("scenario_shop_buying")
    response, _ = generate_contextual_fallback(
        scenario_id=shop["id"],
        user_message="Write Python code that reverses a string",
        turn_count=2,
        language="en",
        history=[],
        def_s=shop,
        role_str="Shopkeeper",
        user_persona="teen",
    )
    assert "General Chat" in response
    assert "def " not in response


def test_short_followup_uses_previous_substantive_topic():
    history = [
        {"role": "user", "content": "How does photosynthesis work?"},
        {"role": "assistant", "content": "Plants convert light energy into chemical energy."},
        {"role": "user", "content": "Why?"},
    ]
    assert infer_topic_anchor(history, "Why?") == "How does photosynthesis work?"


def test_history_window_is_bounded_and_role_normalized():
    history = [{"role": "user" if i % 2 == 0 else "assistant", "content": str(i)} for i in range(30)]
    selected = recent_chat_history(history, limit=8)
    assert len(selected) == 8
    assert selected[0]["content"] == "22"
    assert {item["role"] for item in selected} == {"user", "assistant"}


def test_grounding_copy_covers_accuracy_scope_and_locales():
    assert "Never invent" in GENERAL_GROUNDING_POLICY
    assert "time-sensitive" in GENERAL_GROUNDING_POLICY
    assert "closed-scope" in PRACTICE_SCOPE_POLICY
    assert "General Chat" in scope_redirect("en")
    assert not any("\u0600" <= char <= "\u06ff" for char in scope_redirect("ur_rm"))
    assert any("\u0600" <= char <= "\u06ff" for char in scope_redirect("ur"))


def test_response_validator_rejects_unsupported_certainty_and_memory_claims():
    assert validate_ai_response("This answer is guaranteed accurate for every case.", "en", "Coach", True) is False
    assert validate_ai_response("I remember our full conversation history.", "en", "Coach", True) is False
