"""
Authentication Routes Blueprint
===============================
Endpoints for User Registration, Login, and Profile details.
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me
"""

import re
from flask import Blueprint, request, jsonify
from models.user_model import create_user, find_user_by_email, serialize_user
from utils.auth_utils import check_password, generate_token
from middleware.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        role = data.get("role", "operator")

        # Validations
        if not name:
            return jsonify({"status": "error", "message": "Name is required."}), 400

        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"status": "error", "message": "A valid email address is required."}), 400

        if not password or len(password) < 6:
            return jsonify({"status": "error", "message": "Password must be at least 6 characters long."}), 400

        # Check existing user
        existing_user = find_user_by_email(email)
        if existing_user:
            return jsonify({"status": "error", "message": "An account with this email already exists."}), 409

        # Create user
        user = create_user(name=name, email=email, password=password, role=role)
        token = generate_token(user_id=user["id"], email=user["email"], name=user["name"])

        return jsonify({
            "status": "success",
            "message": "User registered successfully.",
            "token": token,
            "user": user
        }), 201

    except ValueError as val_err:
        return jsonify({"status": "error", "message": str(val_err)}), 400
    except Exception as exc:
        print(f"[AUTH ERROR /register]: {exc}")
        return jsonify({"status": "error", "message": "Registration failed due to an internal server error."}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required."}), 400

        # Find user
        user_doc = find_user_by_email(email)
        if not user_doc:
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        # Verify password
        if not check_password(password, user_doc.get("password", "")):
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        user = serialize_user(user_doc)
        token = generate_token(user_id=user["id"], email=user["email"], name=user["name"])

        return jsonify({
            "status": "success",
            "message": "Login successful.",
            "token": token,
            "user": user
        }), 200

    except Exception as exc:
        print(f"[AUTH ERROR /login]: {exc}")
        return jsonify({"status": "error", "message": "Login failed due to an internal server error."}), 500


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    return jsonify({
        "status": "success",
        "user": current_user
    }), 200
