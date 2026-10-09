"""
Scan Telemetry Model & Data Access Layer
========================================
Manages botanical scan records in MongoDB 'scans' collection,
including Generative AI treatment and care plans.
"""

from datetime import datetime, timezone
from bson import ObjectId
from config.db import get_db


def get_scans_collection():
    db = get_db()
    if db is None:
        return None
    scans = db["scans"]
    scans.create_index([("user_id", 1), ("created_at", -1)])
    return scans


def serialize_scan(doc: dict) -> dict:
    """Format a scan document for API JSON responses."""
    if not doc:
        return None
    return {
        "id": str(doc.get("_id")),
        "user_id": str(doc.get("user_id")),
        "image_url": doc.get("image_url", ""),
        "thumbnail_url": doc.get("thumbnail_url", doc.get("image_url", "")),
        "file_id": doc.get("file_id", ""),
        "species": doc.get("species", "Unknown"),
        "health": doc.get("health", "Unknown"),
        "species_confidence": doc.get("species_confidence", 0.0),
        "health_confidence": doc.get("health_confidence", 0.0),
        "treatment_plan": doc.get("treatment_plan", None),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
    }


def create_scan(
    user_id: str,
    image_url: str,
    file_id: str,
    species: str,
    health: str,
    species_confidence: float,
    health_confidence: float,
    thumbnail_url: str = "",
    treatment_plan: dict = None
) -> dict:
    """
    Saves a new scan telemetry record along with its AI treatment plan in MongoDB.
    """
    scans = get_scans_collection()
    if scans is None:
        raise RuntimeError("MongoDB connection not available.")

    now = datetime.now(timezone.utc)
    scan_doc = {
        "user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id,
        "image_url": image_url,
        "thumbnail_url": thumbnail_url or image_url,
        "file_id": file_id,
        "species": species,
        "health": health,
        "species_confidence": round(species_confidence, 4),
        "health_confidence": round(health_confidence, 4),
        "treatment_plan": treatment_plan,
        "created_at": now
    }

    result = scans.insert_one(scan_doc)
    scan_doc["_id"] = result.inserted_id
    return serialize_scan(scan_doc)


def get_user_scans(user_id: str, limit: int = 20) -> list:
    """
    Retrieves recent scans for a specific user, sorted newest first.
    """
    scans = get_scans_collection()
    if scans is None:
        return []

    query_uid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    cursor = scans.find({"user_id": query_uid}).sort("created_at", -1).limit(limit)
    return [serialize_scan(doc) for doc in cursor]
