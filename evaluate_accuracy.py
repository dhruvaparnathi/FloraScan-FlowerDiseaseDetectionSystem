"""
Model Accuracy Evaluation - with BatchNormalization monkey-patch for Keras 3.x compat
"""
import os, cv2, json, numpy as np, tensorflow as tf
import keras, keras.layers
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# -- Monkey-patch BatchNormalization to strip legacy renorm kwargs -------------
_orig_bn_init = keras.layers.BatchNormalization.__init__
def _patched_bn_init(self, **kwargs):
    kwargs.pop("renorm",          None)
    kwargs.pop("renorm_clipping", None)
    kwargs.pop("renorm_momentum", None)
    _orig_bn_init(self, **kwargs)
keras.layers.BatchNormalization.__init__ = _patched_bn_init
# Also patch via src path since Keras 3 may resolve that way
try:
    import keras.src.layers.normalization.batch_normalization as _bn_mod
    _bn_mod.BatchNormalization.__init__ = _patched_bn_init
except Exception:
    pass

IMG_SIZE     = (160, 160)
DATA_DIR     = "data"
MODELS_DIR   = "models"
RANDOM_STATE = 42

with open(os.path.join(MODELS_DIR, "classes.json")) as f:
    meta = json.load(f)

species_map   = meta["species_map"]
health_map    = meta["health_map"]
species_names = [k for k, v in sorted(species_map.items(), key=lambda x: x[1])]
health_names  = [k for k, v in sorted(health_map.items(),  key=lambda x: x[1])]

print("=" * 60)
print("  Flower Disease Detection -- Model Accuracy Evaluation")
print("=" * 60)
print(f"TensorFlow : {tf.__version__}")
print(f"Keras      : {keras.__version__}")
print(f"Species    : {species_names}")
print(f"Health     : {health_names}")
print()

print("Loading dataset ...")
images, health_labels, species_labels = [], [], []
for species_folder in os.listdir(DATA_DIR):
    species_path = os.path.join(DATA_DIR, species_folder)
    if not os.path.isdir(species_path) or species_folder not in species_map:
        continue
    for health_folder in os.listdir(species_path):
        health_path = os.path.join(species_path, health_folder)
        if not os.path.isdir(health_path) or health_folder not in health_map:
            continue
        for img_name in os.listdir(health_path):
            img_path = os.path.join(health_path, img_name)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, IMG_SIZE)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                images.append(img)
                species_labels.append(species_map[species_folder])
                health_labels.append(health_map[health_folder])

X         = np.array(images,         dtype=np.float32) / 255.0
y_health  = np.array(health_labels,  dtype=np.int32)
y_species = np.array(species_labels, dtype=np.int32)
print(f"Total images loaded : {len(X)}")

_, X_val, _, y_h_val, _, y_s_val = train_test_split(
    X, y_health, y_species, test_size=0.2, random_state=RANDOM_STATE
)
print(f"Validation set size : {len(X_val)}")
print()

print("Loading saved models ...")
health_model  = keras.models.load_model(os.path.join(MODELS_DIR, "health_model.keras"),  compile=False)
species_model = keras.models.load_model(os.path.join(MODELS_DIR, "species_model.keras"), compile=False)
print("Models loaded successfully.\n")

# -- Health Model -------------------------------------------------------------
print("=" * 60)
print("  HEALTH MODEL  (Healthy vs Diseased)")
print("=" * 60)
health_preds_raw = health_model.predict(X_val, batch_size=32, verbose=1)
health_preds     = (health_preds_raw[:, 0] > 0.5).astype(int)
h_acc = accuracy_score(y_h_val, health_preds)
print(f"\nValidation Accuracy : {h_acc * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_h_val, health_preds, target_names=health_names))
print("Confusion Matrix (rows=actual, cols=predicted):")
print(f"  Labels : {health_names}")
print(confusion_matrix(y_h_val, health_preds))

# -- Species Model -------------------------------------------------------------
print()
print("=" * 60)
print("  SPECIES MODEL  (Lily / Rose / Sunflower)")
print("=" * 60)
species_preds_raw = species_model.predict(X_val, batch_size=32, verbose=1)
species_preds     = np.argmax(species_preds_raw, axis=1)
s_acc = accuracy_score(y_s_val, species_preds)
print(f"\nValidation Accuracy : {s_acc * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_s_val, species_preds, target_names=species_names))
print("Confusion Matrix (rows=actual, cols=predicted):")
print(f"  Labels : {species_names}")
print(confusion_matrix(y_s_val, species_preds))

print()
print("=" * 60)
print("  SUMMARY")
print("=" * 60)
print(f"  Health  model accuracy : {h_acc * 100:.2f}%")
print(f"  Species model accuracy : {s_acc * 100:.2f}%")
print("=" * 60)
