"""
Authentication Utilities
========================
Password hashing with bcrypt and RFC 7519 compliant JWT HS256 token handling.
Uses standard library hmac + hashlib to guarantee zero external C-extension/DLL issues.
"""

import os
import time
import json
import hmac
import hashlib
import base64
from datetime import datetime, timedelta, timezone
import bcrypt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
JWT_SECRET = os.getenv("JWT_SECRET", "flower_disease_detection_secret_jwt_key_2026")
JWT_EXPIRATION_DAYS = 7


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def check_password(password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def _b64_url_encode(data: bytes) -> str:
    """URL-safe base64 encoding without trailing padding '='."""
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64_url_decode(s: str) -> bytes:
    """URL-safe base64 decoding with restored padding."""
    padding = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)


def generate_token(user_id: str, email: str, name: str = "") -> str:
    """Generate a signed HS256 JWT token valid for 7 days."""
    now_ts = int(time.time())
    exp_ts = now_ts + (JWT_EXPIRATION_DAYS * 86400)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "iat": now_ts,
        "exp": exp_ts
    }
    
    h_b64 = _b64_url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    p_b64 = _b64_url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{h_b64}.{p_b64}".encode("utf-8")
    
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    s_b64 = _b64_url_encode(signature)
    
    return f"{h_b64}.{p_b64}.{s_b64}"


def decode_token(token: str) -> dict:
    """
    Decode and verify an HS256 JWT token.
    Raises ValueError on invalid format, invalid signature, or expired token.
    """
    parts = token.strip().split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format.")
    
    h_b64, p_b64, s_b64 = parts
    signing_input = f"{h_b64}.{p_b64}".encode("utf-8")
    expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    
    try:
        actual_sig = _b64_url_decode(s_b64)
    except Exception:
        raise ValueError("Invalid signature encoding.")
    
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid token signature.")
    
    try:
        payload_bytes = _b64_url_decode(p_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise ValueError("Invalid token payload.")
    
    # Check expiration
    exp = payload.get("exp")
    if exp and time.time() > exp:
        raise ValueError("Token has expired.")
    
    return payload
