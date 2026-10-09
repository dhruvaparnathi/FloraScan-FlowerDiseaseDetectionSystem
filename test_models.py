import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

print("TensorFlow Version:", tf.__version__)

IMG_SIZE = (128, 128)
MODELS_DIR = "models"
HEALTH_MODEL_PATH = os.path.join(MODELS_DIR, "health_model.keras")
SPECIES_MODEL_PATH = os.path.join(MODELS_DIR, "species_model.keras")

# Test Models Loading
print("\n--- Testing Model Loading ---")
try:
    health_model = load_model(HEALTH_MODEL_PATH)
    print("Health model loaded successfully!")
    print(f"Health model size: {os.path.getsize(HEALTH_MODEL_PATH) / (1024*1024):.2f} MB")
except Exception as e:
    print(f"Failed to load Health model: {e}")

try:
    species_model = load_model(SPECIES_MODEL_PATH)
    print("Species model loaded successfully!")
    print(f"Species model size: {os.path.getsize(SPECIES_MODEL_PATH) / (1024*1024):.2f} MB")
except Exception as e:
    print(f"Failed to load Species model: {e}")


print("\n--- Testing Model Inference ---")
# Create a dummy image
dummy_img = np.random.randint(0, 255, (128, 128, 3), dtype=np.uint8)
dummy_img = cv2.cvtColor(dummy_img, cv2.COLOR_BGR2RGB)
dummy_img = dummy_img.astype(np.float32) / 255.0
dummy_input = np.expand_dims(dummy_img, axis=0) # shape (1, 128, 128, 3)

try:
    health_pred = health_model.predict(dummy_input, verbose=0)
    health_val = health_pred[0][0]
    health_class = "Diseased" if health_val > 0.5 else "Healthy"
    print(f"Health prediction successful! Value: {health_val:.4f} -> Class: {health_class}")
except Exception as e:
    print(f"Health prediction failed: {e}")
    
try:
    species_pred = species_model.predict(dummy_input, verbose=0)
    species_idx = np.argmax(species_pred[0])
    species_map_rev = {0: "Lily", 1: "Rose", 2: "Sunflower"}
    print(f"Species prediction successful! Probabilities: {species_pred[0]} -> Class: {species_map_rev.get(species_idx, 'Unknown')}")
except Exception as e:
    print(f"Species prediction failed: {e}")

print("\nTesting complete.")
