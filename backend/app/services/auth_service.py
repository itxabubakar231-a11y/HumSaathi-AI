import base64
import hashlib
import hmac
import json
import logging
import secrets
import time
from typing import Optional

from app.config import settings

logger = logging.getLogger("humsaathi-auth")

# Fallback secret if not explicitly configured in environment
AUTH_SECRET = getattr(settings, "secret_key", None) or getattr(settings, "jwt_secret", None) or "humsaathi-secure-auth-secret-key-2026-production"
if isinstance(AUTH_SECRET, str):
    AUTH_SECRET = AUTH_SECRET.encode("utf-8")

def hash_password(password: str) -> str:
    """Securely hash a password using PBKDF2-HMAC-SHA256 with a unique 16-byte cryptographic salt."""
    if not password:
        raise ValueError("Password cannot be empty")
    salt = secrets.token_bytes(16)
    iterations = 100_000
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived_key.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored PBKDF2 hash using constant-time comparison."""
    if not password or not hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_key = bytes.fromhex(parts[3])
        computed_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(computed_key, expected_key)
    except Exception as e:
        logger.warning(f"Error during password verification: {e}")
        return False

def create_access_token(user_id: str, expires_in_seconds: int = 86400 * 30) -> str:
    """Create a cryptographically signed HMAC-SHA256 bearer token with expiration."""
    now = int(time.time())
    payload = {
        "uid": user_id,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode("utf-8").rstrip("=")
    
    signature = hmac.new(AUTH_SECRET, payload_b64.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    
    return f"{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[str]:
    """Decode and verify an HMAC-SHA256 bearer token. Returns user_id if valid and not expired, else None."""
    if not token or not isinstance(token, str):
        return None
    try:
        parts = token.strip().split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig_b64 = parts

        # Verify HMAC signature
        expected_sig = hmac.new(AUTH_SECRET, payload_b64.encode("utf-8"), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        # Pad base64 if needed
        padding = "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64 + padding)
        payload = json.loads(payload_json.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp", 0)
        if int(time.time()) > exp:
            return None

        return payload.get("uid")
    except Exception as e:
        logger.debug(f"Token decode error: {e}")
        return None
