import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)

def get_body(response):
    data = response.json()
    return data.get("data", data)

def get_error(response):
    data = response.json()
    return data.get("error") or data.get("detail") or ""

@pytest.fixture(autouse=True)
def clean_test_users():
    db = SessionLocal()
    db.query(User).filter(User.email.like("test_google_%@example.com")).delete(synchronize_session=False)
    db.commit()
    db.close()
    yield
    db = SessionLocal()
    db.query(User).filter(User.email.like("test_google_%@example.com")).delete(synchronize_session=False)
    db.commit()
    db.close()

def test_google_auth_missing_token():
    response = client.post("/api/users/auth/google", json={})
    assert response.status_code == 400
    assert "required" in get_error(response).lower()

def test_google_auth_new_user_success():
    fake_token = "valid_google_token_123"
    fake_google_response = {
        "email": "test_google_new@example.com",
        "email_verified": "true",
        "name": "Google Learner",
        "sub": "google-user-id-12345",
        "aud": "humsaathi-google-client-id",
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_google_response

    with patch("httpx.Client.get", return_value=mock_resp):
        response = client.post("/api/users/auth/google", json={"credential": fake_token})
        assert response.status_code == 200
        data = get_body(response)
        assert "token" in data
        assert data["user"]["email"] == "test_google_new@example.com"
        assert data["user"]["role"] == "learner"  # NEVER admin
        assert data["isNewUser"] is True

def test_google_auth_existing_user_login():
    db = SessionLocal()
    existing = User(
        name="Existing Google User",
        email="test_google_existing@example.com",
        role="learner",
        persona="teen",
        language="ur",
        isActive=True,
    )
    db.add(existing)
    db.commit()
    db.refresh(existing)
    db.close()

    fake_token = "valid_google_token_existing"
    fake_google_response = {
        "email": "test_google_existing@example.com",
        "email_verified": "true",
        "name": "Existing Google User",
        "sub": "google-user-id-99999",
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_google_response

    with patch("httpx.Client.get", return_value=mock_resp):
        response = client.post("/api/users/auth/google", json={"idToken": fake_token})
        assert response.status_code == 200
        data = get_body(response)
        assert "token" in data
        assert data["user"]["email"] == "test_google_existing@example.com"
        assert data["user"]["role"] == "learner"
        assert data["user"]["persona"] == "teen"
        assert data["isNewUser"] is False

def test_google_auth_invalid_token_rejected():
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.json.return_value = {"error_description": "Invalid Value"}

    with patch("httpx.Client.get", return_value=mock_resp):
        response = client.post("/api/users/auth/google", json={"credential": "invalid_forged_token"})
        assert response.status_code == 401
        assert "invalid" in get_error(response).lower()

def test_google_auth_unverified_email_rejected():
    fake_google_response = {
        "email": "test_google_unverified@example.com",
        "email_verified": "false",
        "name": "Unverified User",
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_google_response

    with patch("httpx.Client.get", return_value=mock_resp):
        response = client.post("/api/users/auth/google", json={"credential": "token_unverified"})
        assert response.status_code == 401
        assert "not verified" in get_error(response).lower()

def test_google_auth_deactivated_account_rejected():
    db = SessionLocal()
    deactivated = User(
        name="Deactivated Google User",
        email="test_google_deactivated@example.com",
        role="learner",
        isActive=False,
    )
    db.add(deactivated)
    db.commit()
    db.close()

    fake_google_response = {
        "email": "test_google_deactivated@example.com",
        "email_verified": "true",
        "name": "Deactivated Google User",
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = fake_google_response

    with patch("httpx.Client.get", return_value=mock_resp):
        response = client.post("/api/users/auth/google", json={"credential": "token_deactivated"})
        assert response.status_code == 403
