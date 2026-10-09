"""
User Model & Data Access Layer
==============================
Manages User persistence, queries, and document serialization for MongoDB.
"""

from datetime import datetime, timezone
from bson import ObjectId
from config.db import get_users_collection
from utils.auth_utils import hash_password, check_password


def serialize_user(user_doc: dict) -> dict:
    """Format a Mongo user document for API JSON responses."""
    if not user_doc:
        return None
    
    return {
        "id": str(user_doc.get("_id")),
        "name": user_doc.get("name", ""),
        "email": user_doc.get("email", ""),
        "role": user_doc.get("role", "operator"),
        "created_at": user_doc.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(user_doc.get("created_at"), datetime) else str(user_doc.get("created_at", ""))
    }


def find_user_by_email(email: str) -> dict:
    """Find a user by email (case-insensitive)."""
    users = get_users_collection()
    if users is None:
        return None
    return users.find_one({"email": email.strip().lower()})


def find_user_by_id(user_id: str) -> dict:
    """Find a user by string ObjectId."""
    users = get_users_collection()
    if users is None:
        return None
    try:
        return users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def create_user(name: str, email: str, password: str, role: str = "operator") -> dict:
    """
    Creates and saves a new user in MongoDB.
    Returns the serialized user doc (or raises Exception on failure).
    """
    users = get_users_collection()
    if users is None:
        raise RuntimeError("Database connection not available.")

    normalized_email = email.strip().lower()
    
    # Check if user already exists
    if users.find_one({"email": normalized_email}):
        raise ValueError("User with this email already exists.")

    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "name": name.strip(),
        "email": normalized_email,
        "password": password_hash,
        "role": role,
        "created_at": now,
        "updated_at": now
    }

    result = users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return serialize_user(user_doc)
