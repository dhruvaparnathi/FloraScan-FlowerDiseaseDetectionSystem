"""
Scan Telemetry Routes Blueprint
===============================
Endpoints for retrieving authenticated operator diagnostic histories.
- GET /api/scans/history
"""

from flask import Blueprint, jsonify
from middleware.auth_middleware import token_required
from models.scan_model import get_user_scans

scan_bp = Blueprint("scans", __name__, url_prefix="/api/scans")


@scan_bp.route("/history", methods=["GET"])
@token_required
def get_scan_history(current_user):
    try:
        user_id = current_user.get("id")
        scans = get_user_scans(user_id=user_id, limit=30)
        return jsonify({
            "status": "success",
            "count": len(scans),
            "scans": scans
        }), 200
    except Exception as exc:
        print(f"[SCAN ROUTE ERROR]: {exc}")
        return jsonify({"status": "error", "message": "Failed to fetch scan history."}), 500
