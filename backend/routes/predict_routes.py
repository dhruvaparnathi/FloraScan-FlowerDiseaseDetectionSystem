"""
Flower Disease Prediction & Health Blueprint
=============================================
Endpoints:
- POST /image/upload (Protected by JWT - Uploads to ImageKit + Mistral Gen-AI + MongoDB)
- GET  /health
- GET  /
"""

import os
import uuid
import traceback
import json
import io
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
try:
    import keras
except ImportError:
    from tensorflow import keras
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from services.storage_service import upload_image_to_imagekit
from services.mistral_service import generate_botanical_treatment_plan
from models.scan_model import create_scan

predict_bp = Blueprint("predict", __name__)

BASE_DIR     = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR    = os.path.join(BASE_DIR, "models")

FLOWER_DISEASE_PATH = os.path.join(MODEL_DIR, "flower_disease.keras")
HEALTH_PRIMARY_PATH = os.path.join(MODEL_DIR, "health_model.keras")
FLOWER_CLASS_PATH   = os.path.join(MODEL_DIR, "flower_classification.keras")

if os.path.exists(FLOWER_DISEASE_PATH):
    HEALTH_PATH = FLOWER_DISEASE_PATH
elif os.path.exists(HEALTH_PRIMARY_PATH):
    HEALTH_PATH = HEALTH_PRIMARY_PATH
else:
    HEALTH_PATH = FLOWER_CLASS_PATH

SPECIES_PATH = os.path.join(MODEL_DIR, "species_model.keras")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.json")

# ── Load class mappings & model configuration ────────────────────────────────
try:
    with open(CLASSES_PATH) as f:
        _cls = json.load(f)

    _smap = _cls.get("species_map", {})
    species_names = [None] * len(_smap)
    for name, idx in _smap.items():
        species_names[idx] = name

    _hmap = _cls.get("health_map", {})
    health_names = [None] * len(_hmap)
    for name, idx in _hmap.items():
        health_names[idx] = name

    DEFAULT_HEALTH_THRESHOLD = float(_cls.get("health_threshold", 0.5))
    print(f"[ML] Config loaded - Species: {species_names} | Health: {health_names} | Threshold: {DEFAULT_HEALTH_THRESHOLD}")
except Exception as exc:
    print(f"[ML Warning] classes.json config issue ({exc}), using defaults.")
    species_names = ["lily", "rose", "sunflower"]
    health_names  = ["healthy", "diseased"]
    DEFAULT_HEALTH_THRESHOLD = 0.5

# ── Load trained Keras models ─────────────────────────────────────────────────
health_model  = None
species_model = None

try:
    if os.path.exists(HEALTH_PATH):
        health_model = keras.models.load_model(HEALTH_PATH, compile=False)
        print(f"[ML] Health model loaded from {os.path.basename(HEALTH_PATH)} | input: {health_model.input_shape}")
    else:
        print(f"[ML WARNING] {HEALTH_PATH} not found.")

    if os.path.exists(SPECIES_PATH):
        species_model = keras.models.load_model(SPECIES_PATH, compile=False)
        print(f"[ML] Species model loaded from {os.path.basename(SPECIES_PATH)} | input: {species_model.input_shape}")
    else:
        print(f"[ML WARNING] {SPECIES_PATH} not found.")

except Exception:
    tb = traceback.format_exc()
    print("[ML ERROR] loading models:\n" + tb)
    health_model  = None
    species_model = None


def preprocess_image(raw_bytes: bytes, target_hw: tuple) -> np.ndarray:
    """
    Load image with PIL (exact match with Keras/Streamlit pipeline),
    convert to RGB, resize to target (W, H), normalize to [0,1].
    Returns ndarray of shape (1, H, W, 3) float32.
    """
    h, w = target_hw
    img  = Image.open(io.BytesIO(raw_bytes)).convert("RGB").resize((w, h))
    arr  = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


@predict_bp.route("/")
def root():
    return jsonify({
        "message":      "Flora Scan™ Flower Disease Detection API",
        "status":       "running",
        "model_loaded": health_model is not None and species_model is not None,
        "endpoints": {
            "health": "/health",
            "upload": "/image/upload (auth required)",
            "auth":   "/api/auth",
            "scans":  "/api/scans"
        },
    })


@predict_bp.route("/health")
def health_check():
    return jsonify({
        "status":             "healthy",
        "model_loaded":       health_model is not None and species_model is not None,
        "tensorflow_version": tf.__version__,
    })


@predict_bp.route("/image/upload", methods=["POST"])
@token_required
def image_upload(current_user):
    try:
        if health_model is None or species_model is None:
            return jsonify({"error": "Models not loaded. Run train_models.py first."}), 503

        if "file" not in request.files:
            return jsonify({"error": "No 'file' field in the request."}), 400

        uploaded = request.files["file"]
        if uploaded.filename == "":
            return jsonify({"error": "Empty filename."}), 400

        # Read binary file bytes for both OpenCV and ImageKit
        raw_bytes = uploaded.read()
        if not raw_bytes:
            return jsonify({"error": "Uploaded file is empty."}), 400

        # Verify valid image bytes
        try:
            test_img = Image.open(io.BytesIO(raw_bytes))
            test_img.verify()
        except Exception:
            return jsonify({"error": "Could not decode image. Upload a valid JPEG/PNG/WEBP."}), 400

        # Preprocess according to model shapes with PIL
        h_shape = health_model.input_shape[1:3]
        s_shape = species_model.input_shape[1:3]

        h_input = preprocess_image(raw_bytes, h_shape)
        s_input = preprocess_image(raw_bytes, s_shape)

        # Run inference
        health_raw  = float(health_model.predict(h_input, verbose=0)[0][0])
        species_raw = species_model.predict(s_input, verbose=0)[0]

        # Health prediction logic matching Keras & Streamlit binary sigmoid:
        # sigmoid >= 0.5: HEALTHY | < 0.5: DISEASED
        threshold_arg = request.args.get("threshold") or request.form.get("threshold")
        if threshold_arg is not None:
            health_threshold = float(threshold_arg)
        elif "HEALTH_THRESHOLD" in os.environ:
            health_threshold = float(os.environ["HEALTH_THRESHOLD"])
        else:
            health_threshold = DEFAULT_HEALTH_THRESHOLD

        if health_raw >= health_threshold:
            health_status     = "Healthy"
            health_confidence = health_raw
        else:
            health_status     = "Diseased"
            health_confidence = 1.0 - health_raw

        healthy_prob  = health_raw
        diseased_prob = 1.0 - health_raw

        # Species
        species_idx        = int(np.argmax(species_raw))
        species_confidence = float(species_raw[species_idx])
        species_name       = species_names[species_idx].title()

        # ── Upload to ImageKit Cloud Storage ──────────────────────────────────
        imagekit_res = upload_image_to_imagekit(
            file_bytes=raw_bytes,
            file_name=uploaded.filename,
            folder="/flower_specimens"
        )
        image_url     = imagekit_res.get("url", "")
        thumbnail_url = imagekit_res.get("thumbnail_url", image_url)
        file_id       = imagekit_res.get("file_id", "")

        # ── Generate Treatment Plan with Mistral AI ───────────────────────────
        treatment_plan = generate_botanical_treatment_plan(
            species=species_name,
            health=health_status,
            confidence=health_confidence,
            image_url=image_url
        )

        # ── Persist Scan Record to MongoDB ────────────────────────────────────
        scan_id = ""
        try:
            scan_rec = create_scan(
                user_id=current_user.get("id"),
                image_url=image_url,
                file_id=file_id,
                species=species_name,
                health=health_status,
                species_confidence=species_confidence,
                health_confidence=health_confidence,
                thumbnail_url=thumbnail_url,
                treatment_plan=treatment_plan
            )
            scan_id = scan_rec.get("id", "")
        except Exception as db_err:
            print(f"[Scan Save Warning]: {db_err}")

        healthy_prob  = health_raw
        diseased_prob = 1.0 - health_raw

        result = {
            "species":            species_name,
            "health":             health_status,
            "species_confidence": round(species_confidence, 4),
            "health_confidence":  round(health_confidence,  4),
            "healthy_prob":       round(healthy_prob,       4),
            "diseased_prob":      round(diseased_prob,      4),
            "raw_health_score":   round(health_raw,         6),
            "treatment_plan":     treatment_plan,
            "image_url":          image_url,
            "thumbnail_url":      thumbnail_url,
            "scan_id":            scan_id,
            "operator":           current_user.get("name")
        }

        print(f"[ML + Mistral Gen-AI + Cloud Saved] -> {species_name} / {health_status} (AI: {treatment_plan.get('ai_model')})")
        return jsonify(result), 200

    except Exception:
        tb = traceback.format_exc()
        print("[ML Prediction error]:\n" + tb)
        return jsonify({"error": "Prediction failed. Check server logs."}), 500
