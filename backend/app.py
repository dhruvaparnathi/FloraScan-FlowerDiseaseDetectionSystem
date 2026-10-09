"""
Flower Disease Detection - Modular Flask REST API
=================================================
Includes:
- Authentication Blueprint (/api/auth)
- Prediction & ML Blueprint (/image/upload, /health, /)
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# ── Load environment variables ────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Keras 3.x compat: strip legacy BatchNormalization renorm params ───────────
try:
    import keras
    import keras.layers
except ImportError:
    from tensorflow import keras
    import tensorflow.keras.layers as layers

_orig_bn_init = keras.layers.BatchNormalization.__init__

def _patched_bn_init(self, **kwargs):
    kwargs.pop("renorm",          None)
    kwargs.pop("renorm_clipping", None)
    kwargs.pop("renorm_momentum", None)
    _orig_bn_init(self, **kwargs)

keras.layers.BatchNormalization.__init__ = _patched_bn_init
try:
    import keras.src.layers.normalization.batch_normalization as _bn_src
    _bn_src.BatchNormalization.__init__ = _patched_bn_init
except Exception:
    pass

# ── Connect MongoDB ───────────────────────────────────────────────────────────
from config.db import get_db
get_db()

# ── Create Flask application ──────────────────────────────────────────────────
app = Flask(__name__)

# Configure CORS for React frontend (Vite & legacy React ports)
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"]
)

# ── Register Blueprints ───────────────────────────────────────────────────────
from routes.auth_routes import auth_bp
from routes.predict_routes import predict_bp
from routes.scan_routes import scan_bp

app.register_blueprint(auth_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(scan_bp)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"==================================================")
    print(f"  Flora Scan™ Flask Server running on port {port}")
    print(f"  - Health API: http://localhost:{port}/health")
    print(f"  - Auth API:   http://localhost:{port}/api/auth")
    print(f"  - Predict API: http://localhost:{port}/image/upload")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
