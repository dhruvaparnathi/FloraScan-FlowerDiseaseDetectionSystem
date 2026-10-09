import tensorflow as tf
import numpy as np
import os

# Test model loading
model_path = "models/multitask_finetuned.keras"
if not os.path.exists(model_path):
    model_path = "models/multitask_best.keras"

print(f"Attempting to load model from: {model_path}")

try:
    model = tf.keras.models.load_model(model_path)
    print("✓ Model loaded successfully!")
    
    # Print model summary
    print("\nModel Summary:")
    model.summary()
    
    # Test with dummy input
    print("\nTesting with dummy input...")
    dummy_input = np.random.random((1, 256, 256, 3)).astype(np.float32)
    
    predictions = model.predict(dummy_input, verbose=0)
    print(f"✓ Prediction successful!")
    print(f"Species prediction shape: {predictions['species'].shape}")
    print(f"Health prediction shape: {predictions['health'].shape}")
    
    # Species and health mappings
    species_names = ['lily', 'rose', 'sunflower']
    health_names = ['healthy', 'diseased']
    
    species_idx = np.argmax(predictions['species'][0])
    health_idx = np.argmax(predictions['health'][0])
    
    print(f"Predicted species: {species_names[species_idx]}")
    print(f"Predicted health: {health_names[health_idx]}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("Make sure TensorFlow is installed and the model file exists.")