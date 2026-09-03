# test_teen_adult_coach_upgrade.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from app.models.user import User, Progress
from app.models.conversation import ConversationSession, ConversationEvaluation
from app.data.scenarios import ALL_SCENARIOS, DEFAULT_SCENARIOS
from app.services.progress_service import get_dashboard_stats, is_skill_for_persona
from app.services.evaluation_service import update_progress_from_evaluation
import uuid
from datetime import datetime

client = TestClient(app)

def test_new_scenarios_exist_and_validate():
    scenario_ids = [s["id"] for s in ALL_SCENARIOS]
    
    # Required Adult Workplace & Everyday Scenarios
    expected_adult = [
        "scenario_adult_job_interview",
        "scenario_adult_workplace_meeting",
        "scenario_adult_workplace_disagreement",
        "scenario_adult_prof_intro",
        "scenario_adult_bank_inquiry",
        "scenario_adult_restaurant_order",
        "scenario_adult_transit_delay",
        "scenario_adult_confusing_email",
    ]
    for s_id in expected_adult:
        assert s_id in scenario_ids, f"Missing adult scenario: {s_id}"
        scen = next(s for s in ALL_SCENARIOS if s["id"] == s_id)
        assert "adult" in scen["personas"]
        assert scen.get("category") in ["workplace", "everyday", "problem_solving"]
        assert len(scen["options"]) == 4

    # Required Teen Scenarios
    expected_teen = [
        "scenario_teen_need_help",
        "scenario_teen_intro_club",
        "scenario_teen_peer_dispute",
    ]
    for s_id in expected_teen:
        assert s_id in scenario_ids, f"Missing teen scenario: {s_id}"
        scen = next(s for s in ALL_SCENARIOS if s["id"] == s_id)
        assert "teen" in scen["personas"]
        assert len(scen["options"]) == 4

def test_scenario_endpoint_category_filter():
    res = client.get("/api/conversations/scenarios?category=workplace")
    assert res.status_code == 200
    body = res.json()
    data = body.get("data", body)["scenarios"]
    assert len(data) >= 4
    for item in data:
        assert item["category"] == "workplace"

@pytest.mark.anyio
async def test_update_progress_from_evaluation_for_teen_and_adult():
    db = next(get_db())
    test_teen_id = f"test_teen_{uuid.uuid4().hex[:8]}"
    test_adult_id = f"test_adult_{uuid.uuid4().hex[:8]}"
    
    teen = User(id=test_teen_id, name="Test Teen", persona="teen", language="en")
    adult = User(id=test_adult_id, name="Test Adult", persona="adult", language="en")
    db.add(teen)
    db.add(adult)
    db.commit()

    try:
        # Evaluate for Teen
        await update_progress_from_evaluation(db, test_teen_id, "Resolving a Team Project Disagreement", 90)
        teen_prog = db.query(Progress).filter(Progress.userId == test_teen_id, Progress.skill == "teen_communication").first()
        assert teen_prog is not None
        assert is_skill_for_persona("teen_communication", "teen") is True
        assert teen_prog.accuracy == 0.9

        # Evaluate for Adult Workplace
        await update_progress_from_evaluation(db, test_adult_id, "Handling a Workplace Disagreement", 85)
        adult_prog = db.query(Progress).filter(Progress.userId == test_adult_id, Progress.skill == "adult_workplace_comm").first()
        assert adult_prog is not None
        assert is_skill_for_persona("adult_workplace_comm", "adult") is True
        assert adult_prog.accuracy == 0.85

        # Check real dashboard stats (streak and todayCount)
        stats = get_dashboard_stats(db, test_teen_id, persona="teen")
        assert stats["currentStreak"] >= 0
        assert "todayCompletedCount" in stats
        assert "weeklyActivityDays" in stats

    finally:
        db.query(Progress).filter(Progress.userId.in_([test_teen_id, test_adult_id])).delete(synchronize_session=False)
        db.query(User).filter(User.id.in_([test_teen_id, test_adult_id])).delete(synchronize_session=False)
        db.commit()
