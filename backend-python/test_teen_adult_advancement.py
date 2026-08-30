import pytest
from app.database import SessionLocal, engine, Base
from app.models.user import User, Progress, Attempt
from app.models.activity import Activity
from app.services.skill_module_service import (
    get_skill_modules,
    get_skill_module_details,
    evaluate_skill_solution,
    SKILL_MODULES_DATA,
)
from app.services.recommendation_service import recommend_activity_rule_based
from app.services.progress_service import (
    is_skill_for_persona,
    is_attempt_for_persona,
    format_strengths_for_language,
    TEEN_SKILLS,
    ADULT_SKILLS,
    CHILD_SKILLS,
)
from app.data.scenarios import DEFAULT_SCENARIOS

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_teen_and_adult_module_retrieval(db_session):
    # Test Teen modules retrieval
    teen_mods = get_skill_modules("teen", "en")
    assert len(teen_mods) == 3
    mod_ids = [m["id"] for m in teen_mods]
    assert "teen_reading_vocab" in mod_ids
    assert "teen_problem_solving" in mod_ids
    assert "teen_communication" in mod_ids

    # Test Adult modules retrieval
    adult_mods = get_skill_modules("adult", "en")
    assert len(adult_mods) == 3
    adult_ids = [m["id"] for m in adult_mods]
    assert "adult_functional_reading" in adult_ids
    assert "adult_problem_solving" in adult_ids
    assert "adult_everyday_comm" in adult_ids

    # Test Multilingual module titles
    teen_ur = get_skill_modules("teen", "ur")
    assert any("مطالعہ" in m["title"] for m in teen_ur)

    adult_ur = get_skill_modules("adult", "ur")
    assert any("عملی مطالعہ" in m["title"] for m in adult_ur)

def test_module_details_and_difficulty_filtering(db_session):
    # Teen Reading & Vocab
    details = get_skill_module_details("teen_reading_vocab", "en")
    assert details is not None
    assert len(details["scenarios"]) >= 5
    assert details["persona"] == "teen"

    # Filter by Easy
    easy_details = get_skill_module_details("teen_reading_vocab", "en", difficulty="easy")
    assert all(s["difficulty"] == "easy" for s in easy_details["scenarios"])

    # Adult Functional Reading
    adult_details = get_skill_module_details("adult_functional_reading", "en")
    assert adult_details is not None
    assert len(adult_details["scenarios"]) >= 5
    assert any(s["passage"] is not None for s in adult_details["scenarios"])

def test_skill_solution_evaluation_and_adaptive_progression(db_session):
    # Clean prior test state for test user
    db_session.query(Attempt).filter(Attempt.userId == "test_adv_teen_user").delete()
    db_session.query(Progress).filter(Progress.userId == "test_adv_teen_user").delete()
    db_session.commit()

    # Create test teen user
    teen_user = User(
        id="test_adv_teen_user",
        name="Areeba",
        persona="teen",
        language="en",
        sensoryPrefs="{}"
    )
    db_session.merge(teen_user)
    db_session.commit()

    # Base activity for attempt foreign key
    base_act = Activity(id="letters", personas="child", language="en", type="letter", title="Letters", topic="letters", difficulty="easy", content="{}")
    db_session.merge(base_act)
    db_session.commit()

    import asyncio
    # Evaluate scenario 1
    eval_res = asyncio.run(evaluate_skill_solution(
        db=db_session,
        user_id="test_adv_teen_user",
        module_id="teen_reading_vocab",
        scenario_id="teen_rv_1",
        option_id="opt_rv_1",
    ))

    assert eval_res["score"] == 95
    assert "Correct comprehension" in eval_res["feedback"]
    assert eval_res["consequences"] != ""

    # Verify progress record created
    prog = db_session.query(Progress).filter(
        Progress.userId == "test_adv_teen_user",
        Progress.skill == "reading_vocabulary"
    ).first()

    assert prog is not None
    assert prog.attempts == 1
    assert prog.accuracy >= 0.9
    assert prog.level == "challenging"

def test_persona_isolation_for_teen_and_adult(db_session):
    # Verify skill definitions isolation
    assert is_skill_for_persona("reading_vocabulary", "teen") is True
    assert is_skill_for_persona("problem_solving", "teen") is True
    assert is_skill_for_persona("letters", "teen") is False
    assert is_skill_for_persona("numbers", "teen") is False

    assert is_skill_for_persona("functional_reading", "adult") is True
    assert is_skill_for_persona("problem_solving", "adult") is True
    assert is_skill_for_persona("shapes", "adult") is False

    # Check multilingual strength formatting
    formatted_teen = format_strengths_for_language(["reading_vocabulary", "problem_solving"], "ur")
    assert "مطالعہ اور الفاظ" in formatted_teen
    assert "مسائل کا حل" in formatted_teen

    formatted_adult = format_strengths_for_language(["functional_reading", "workplace_communication"], "ur")
    assert "عملی مطالعہ" in formatted_adult

def test_recommendation_engine_for_teen_and_adult(db_session):
    # Brand new Teen user (zero history)
    teen_user = User(
        id="test_rec_teen_user_new",
        name="Farhan",
        persona="teen",
        language="en",
        sensoryPrefs="{}"
    )
    db_session.merge(teen_user)
    db_session.commit()

    rec_teen = recommend_activity_rule_based(db_session, "test_rec_teen_user_new")
    assert rec_teen["topic"] in ["teen_reading_vocab", "teen_problem_solving", "teen_communication"]
    assert rec_teen["activityId"] in ["teen_reading_vocab", "teen_problem_solving", "teen_communication"]
    assert rec_teen["activityId"] != "letters"
    assert rec_teen["topic"] != "letters"

    # Brand new Adult user (zero history)
    adult_user = User(
        id="test_rec_adult_user_new",
        name="Zainab",
        persona="adult",
        language="en",
        sensoryPrefs="{}"
    )
    db_session.merge(adult_user)
    db_session.commit()

    rec_adult = recommend_activity_rule_based(db_session, "test_rec_adult_user_new")
    assert rec_adult["topic"] in ["adult_functional_reading", "adult_problem_solving", "adult_everyday_comm"]
    assert rec_adult["activityId"] in ["adult_functional_reading", "adult_problem_solving", "adult_everyday_comm"]
    assert rec_adult["activityId"] != "letters"
    assert rec_adult["topic"] != "letters"

    # Brand new Child user (zero history)
    child_user = User(
        id="test_rec_child_user_new",
        name="Ayan",
        persona="child",
        language="en",
        sensoryPrefs="{}"
    )
    db_session.merge(child_user)
    db_session.commit()

    rec_child = recommend_activity_rule_based(db_session, "test_rec_child_user_new")
    assert rec_child["topic"] == "letters"
    assert rec_child["activityId"] == "letters"

def test_communication_scenarios_for_all_personas():
    teen_scenarios = [s for s in DEFAULT_SCENARIOS if "teen" in s.get("personas", [])]
    adult_scenarios = [s for s in DEFAULT_SCENARIOS if "adult" in s.get("personas", [])]
    child_scenarios = [s for s in DEFAULT_SCENARIOS if "child" in s.get("personas", [])]

    assert len(teen_scenarios) >= 5
    assert len(adult_scenarios) >= 5
    assert len(child_scenarios) >= 5

    # Check that initial prompts are localized in en, ur, ur_rm
    for s in DEFAULT_SCENARIOS:
        assert "en" in s["initialPrompt"]
        assert "ur" in s["initialPrompt"]
        assert "ur_rm" in s["initialPrompt"]
