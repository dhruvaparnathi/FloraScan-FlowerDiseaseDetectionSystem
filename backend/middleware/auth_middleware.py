"""
Authentication Middleware
=========================
JWT token validation decorator for protected endpoints.
"""

from functools import wraps
from flask import request, jsonify
from utils.auth_utils import decode_token
from models.user_model import find_user_by_id, serialize_user


def token_required(f):
    """
    Decorator to protect routes with JWT Bearer authentication.
    Passes serialized current_user as the first parameter to the decorated function.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return jsonify({
                "status": "error",
                "message": "Authorization header missing. Token required."
            }), 401
        
        parts = auth_header.strip().split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "status": "error",
                "message": "Invalid Authorization header format. Expected 'Bearer <token>'."
            }), 401
        
        token = parts[1]
        
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return jsonify({"status": "error", "message": "Invalid token payload."}), 401
            
            user_doc = find_user_by_id(user_id)
            if not user_doc:
                return jsonify({"status": "error", "message": "User not found or deleted."}), 401
            
            current_user = serialize_user(user_doc)
            
        except ValueError as val_err:
            return jsonify({"status": "error", "message": str(val_err)}), 401
        except Exception as e:
            return jsonify({"status": "error", "message": f"Authentication failed: {str(e)}"}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated
