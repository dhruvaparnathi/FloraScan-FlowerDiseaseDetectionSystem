"""
Mock Flask Backend for Flower Disease Detection
This is a temporary version that doesn't require TensorFlow/GPU dependencies
Perfect for testing the frontend while resolving backend dependencies
"""
from flask import Flask, request, jsonify
import os
from hashlib import sha512
import uuid
from PIL import Image
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

# Mock species and health mappings
species_names = ['lily', 'rose', 'sunflower']
health_names = ['healthy', 'diseased']

print("=" * 50)
print("🌸 Flower Disease Detection - Mock Backend")
print("=" * 50)
print("⚠️  Running in MOCK mode (TensorFlow not available)")
print("=" * 50)

@app.route("/")
def home():
    return jsonify({
        'message': 'Flower Disease Detection API (MOCK)',
        'status': 'running',
        'model_loaded': True,
        'endpoints': {
            'health': '/health',
            'upload': '/image/upload'
        }
    })

@app.route("/health")
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'backend_mode': 'MOCK (TensorFlow unavailable on Python 3.14)'
    })

@app.route("/image/upload", methods=["GET", "POST"])
def image_upload():
    if request.method == "POST":
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file uploaded'}), 400
                
            file = request.files["file"]
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
                
            # Create images directory if it doesn't exist
            os.makedirs("images", exist_ok=True)
            
            file_extension = os.path.splitext(file.filename)[1]
            file_name = str(file.filename) + uuid.uuid4().hex
            file_name = file_name.encode("utf-8")
            hash_filename = sha512(file_name).hexdigest() + str(file_extension)
            
            file_path = os.path.join("images", hash_filename)
            file.save(file_path)
            
            # Validate image using PIL (no OpenCV)
            # We'll open the image with PIL below; remove any OpenCV usage

            try:
                # Load image to validate it's real using PIL
                img = Image.open(file_path)
                width, height = img.size
                img_format = img.format
                img.close()

                # Clean up uploaded file
                os.remove(file_path)
                
                # Generate mock predictions (in real deployment, use actual model)
                species_idx = random.randint(0, 2)
                health_idx = random.randint(0, 1)
                
                result = {
                    'species': species_names[species_idx].title(),
                    'health': health_names[health_idx].title(),
                    'species_confidence': round(random.uniform(0.7, 0.99), 4),
                    'health_confidence': round(random.uniform(0.7, 0.99), 4),
                    'image_info': {
                        'width': int(width),
                        'height': int(height),
                        'format': img_format,
                        'processed': True
                    },
                    'note': 'Mock predictions - Deploy with TensorFlow for real predictions'
                }
                
                print(f"Mock Prediction: {result['species']} - {result['health']}")
                return jsonify(result)
                
            except Exception as e:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({'error': 'Invalid image file: ' + str(e)}), 400
            
        except Exception as e:
            print(f"Error in prediction: {e}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'message': 'Upload an image for prediction'})

if __name__ == '__main__':
    print("\n🚀 Starting Flask server on http://localhost:5000")
    print("📱 Frontend running on http://localhost:3000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
