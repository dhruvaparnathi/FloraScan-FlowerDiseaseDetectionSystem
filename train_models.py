"""
Flower Disease Detection - Model Training Script
=================================================
Trains two MobileNetV2-based CNN models:
  1. health_model.keras  - binary: Healthy vs Diseased  (sigmoid output)
  2. species_model.keras - 3-class: Lily / Rose / Sunflower (softmax output)

Stack:
  - OpenCV     : image loading and preprocessing
  - TensorFlow : model definition and training
  - MobileNetV2: pretrained ImageNet backbone (frozen for fast CPU training)
  - Data aug   : RandomFlip, RandomRotation, RandomZoom

Output: models/health_model.keras  models/species_model.keras  models/classes.json
"""

import os
import cv2
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import (
    Dense, GlobalAveragePooling2D, Dropout,
    RandomFlip, RandomRotation, RandomZoom,
)
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.model_selection import train_test_split

# ── Config ────────────────────────────────────────────────────────────────────
IMG_SIZE     = (160, 160)
DATA_DIR     = "data"
MODELS_DIR   = "models"
RANDOM_STATE = 42
TEST_SPLIT   = 0.20
BATCH_SIZE   = 32
EPOCHS       = 15

os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 65)
print("  Flower Disease Detection - Model Training")
print("=" * 65)
print(f"TensorFlow : {tf.__version__}")
print(f"Image size : {IMG_SIZE[0]}x{IMG_SIZE[1]}")

# ── Discover species from data/ folder ────────────────────────────────────────
all_species = sorted([
    f for f in os.listdir(DATA_DIR)
    if os.path.isdir(os.path.join(DATA_DIR, f))
])
health_labels_map = {"healthy": 0, "diseased": 1}
species_map       = {name: idx for idx, name in enumerate(all_species)}

print(f"Species    : {all_species}")
print(f"Health     : {list(health_labels_map.keys())}")

with open(os.path.join(MODELS_DIR, "classes.json"), "w") as f:
    json.dump({"species_map": species_map, "health_map": health_labels_map}, f, indent=2)
print(f"Saved classes.json to {MODELS_DIR}/")

# ── Load dataset using OpenCV ─────────────────────────────────────────────────
print("\nLoading dataset ...")
images, health_labels, species_labels = [], [], []

for species_name in all_species:
    species_path = os.path.join(DATA_DIR, species_name)
    for health_name in ["healthy", "diseased"]:
        health_path = os.path.join(species_path, health_name)
        if not os.path.isdir(health_path):
            continue
        files = [
            fname for fname in os.listdir(health_path)
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp"))
        ]
        print(f"  {species_name:12s} / {health_name:8s} -- {len(files):4d} images")
        for fname in files:
            img = cv2.imread(os.path.join(health_path, fname))
            if img is None:
                continue
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, IMG_SIZE)
            images.append(img)
            health_labels.append(health_labels_map[health_name])
            species_labels.append(species_map[species_name])

X         = np.array(images,        dtype=np.float32) / 255.0
y_health  = np.array(health_labels, dtype=np.int32)
y_species = np.array(species_labels, dtype=np.int32)
print(f"\nTotal images : {len(X)}")
del images

# ── Train / Validation split ──────────────────────────────────────────────────
X_train, X_val, yh_train, yh_val, ys_train, ys_val = train_test_split(
    X, y_health, y_species,
    test_size=TEST_SPLIT, random_state=RANDOM_STATE, stratify=y_health
)
print(f"Train : {len(X_train)}   Val : {len(X_val)}")
del X

# ── Augmentation pipeline ─────────────────────────────────────────────────────
augmentation = Sequential([
    RandomFlip("horizontal_and_vertical"),
    RandomRotation(0.15),
    RandomZoom(0.10),
], name="augmentation")

# ── Model factory ─────────────────────────────────────────────────────────────
def build_model(num_classes, output_activation):
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = augmentation(inputs)
    x = x * 2.0 - 1.0                                  # rescale [0,1] -> [-1,1]

    base = MobileNetV2(input_tensor=x, include_top=False, weights="imagenet")
    base.trainable = False

    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.4)(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.3)(x)
    out = Dense(num_classes, activation=output_activation)(x)
    return Model(inputs=inputs, outputs=out)

# ── HEALTH MODEL ──────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("  Training HEALTH MODEL (Healthy vs Diseased)")
print("=" * 65)

health_model = build_model(1, "sigmoid")
health_model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss="binary_crossentropy",
    metrics=["accuracy"],
)

health_model.fit(
    X_train, yh_train,
    validation_data=(X_val, yh_val),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[
        ModelCheckpoint(
            os.path.join(MODELS_DIR, "health_model.keras"),
            save_best_only=True, monitor="val_accuracy", verbose=1,
        ),
        EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6, verbose=1),
    ],
    verbose=1,
)

# ── SPECIES MODEL ─────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print(f"  Training SPECIES MODEL ({len(all_species)} classes: {all_species})")
print("=" * 65)

species_model = build_model(len(all_species), "softmax")
species_model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

species_model.fit(
    X_train, ys_train,
    validation_data=(X_val, ys_val),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[
        ModelCheckpoint(
            os.path.join(MODELS_DIR, "species_model.keras"),
            save_best_only=True, monitor="val_accuracy", verbose=1,
        ),
        EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6, verbose=1),
    ],
    verbose=1,
)

# ── Done ──────────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("  TRAINING COMPLETE")
print("=" * 65)
for fname in ["health_model.keras", "species_model.keras", "classes.json"]:
    p = os.path.join(MODELS_DIR, fname)
    if os.path.exists(p):
        mb = os.path.getsize(p) / (1024 * 1024)
        print(f"  {fname:<30s}  {mb:6.1f} MB")
print("=" * 65)
