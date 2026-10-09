<div align="center">

<img src="https://img.shields.io/badge/FloraScan™-Flower%20Disease%20Detection-4ade80?style=for-the-badge&logo=leaf&logoColor=white" alt="FloraScan Banner"/>

# 🌸 FloraScan — Flower Disease Detection System

**An AI-powered full-stack web application for real-time flower species identification and plant disease diagnosis using Deep Transfer Learning, Generative AI, and Cloud Infrastructure.**

[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.21-ff6f00?style=flat-square&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Reference](#-api-reference) • [Model Performance](#-model-performance)

</div>

---

## 📌 Overview

**FloraScan** is an end-to-end botanical intelligence system that combines **MobileNetV2 Transfer Learning** with **Mistral AI generative models** to:

- 🔬 Identify flower species (**Lily · Rose · Sunflower**)
- 🧬 Diagnose plant health (**Healthy vs. Diseased**)
- 📋 Generate AI-powered treatment & care protocols
- ☁️ Store scan history with cloud CDN image hosting
- 👤 Support multi-user authentication with JWT

Trained on **3,900 images** with **90.67% disease detection accuracy** and **96.15% species classification accuracy**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Dual-Model AI Engine** | Two separate MobileNetV2 models — one for species, one for health — run in parallel |
| 🌿 **AI Treatment Plans** | Mistral AI (Pixtral 12B Vision) generates botanical care protocols per diagnosis |
| ☁️ **Cloud Image Storage** | All uploaded specimens are stored on ImageKit CDN with thumbnail generation |
| 🗄️ **Scan History** | Every scan is logged to MongoDB Atlas and accessible per user |
| 🔐 **JWT Authentication** | Secure user registration/login with bcrypt-hashed passwords |
| 🎨 **Premium UI** | React 19 + Tailwind CSS v4 + Framer Motion animations + custom theme switcher |
| 🖥️ **Terminal Simulator** | Live scanning log animation (`INITIALIZING TENSORENGINES...`) during inference |
| 🎉 **Confetti Celebration** | Triggers for healthy specimen results |
| 📱 **Drag & Drop Upload** | Or use preset sample flower images from the Gallery |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│   React 19 + Vite + Tailwind CSS v4 + Framer Motion            │
│   (SpecimenTester · Gallery · ScanHistory · Auth)               │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP / REST (JWT Bearer Token)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FLASK REST API  :5000                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  /api/auth   │  │ /image/upload│  │  /api/scans/history  │  │
│  │  (Blueprint) │  │  (Blueprint) │  │     (Blueprint)      │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘  │
└─────────────────────────  │  ──────────────────────────────────-┘
                            │
            ┌───────────────┼───────────────────┐
            ▼               ▼                   ▼
  ┌──────────────┐  ┌──────────────┐   ┌──────────────────┐
  │ MobileNetV2  │  │ MobileNetV2  │   │   Mistral AI     │
  │  Health      │  │  Species     │   │  (Pixtral 12B)   │
  │  Model       │  │  Model       │   │  Treatment Plan  │
  │  96.67% acc  │  │  96.15% acc  │   │  Generator       │
  └──────────────┘  └──────────────┘   └──────────────────┘
            │                                   │
            └──────────────┬────────────────────┘
                           ▼
            ┌──────────────────────────┐
            │   MongoDB Atlas          │  ←→  ImageKit CDN
            │   (users · scans)        │       (Image Storage)
            └──────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Core language |
| TensorFlow / Keras | 2.21 / 3.14 | Deep learning inference |
| MobileNetV2 | ImageNet weights | Feature extraction backbone |
| Flask + Flask-CORS | 3.1 | REST API framework |
| PyMongo | 4.18 | MongoDB driver |
| bcrypt | 5.0 | Password hashing |
| python-dotenv | 1.2 | Environment variable management |
| OpenCV | 4.13 | Image preprocessing |
| Pillow | 12.3 | Image I/O |
| Mistral AI API | Pixtral 12B | Generative treatment plans |
| ImageKit SDK | REST | Cloud CDN storage |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 7.3 | Build tool & dev server |
| Tailwind CSS | v4.3 | Utility-first styling |
| Framer Motion | 12.42 | Animations & transitions |
| Lenis | 1.3 | Smooth scroll physics |
| Lucide React | 1.24 | Icon library |
| React Router DOM | 7.18 | Client-side routing |
| canvas-confetti | 1.9 | Confetti celebrations 🎉 |

### Cloud & Infrastructure
| Service | Role |
|---|---|
| MongoDB Atlas | User & scan data storage |
| ImageKit CDN | Specimen image hosting + thumbnails |
| Mistral AI Cloud | LLM-powered botanical treatment generation |

---

## 🧠 Model Architecture

Both models share the same backbone design:

```
Input (224 × 224 × 3)
       │
Data Augmentation (RandomFlip · RandomRotation ±15° · RandomZoom ±10%)
       │
Rescaling Layer [-1, 1]   ← MobileNetV2 normalization
       │
MobileNetV2 Backbone (ImageNet pre-trained, FROZEN)
       │
Global Average Pooling 2D
       │
Dense(256, ReLU) → Dropout(0.4)
       │
Dense(128, ReLU) → Dropout(0.3)
       │
   ┌───┴─────────────────┐
   ▼                     ▼
Health Head            Species Head
Dense(1, Sigmoid)      Dense(3, Softmax)
Binary Crossentropy    Sparse Categorical CE
```

**Training Strategy:** Two-phase training — frozen backbone first, then fine-tuned top layers with low learning rate `1e-5`.

---

## 📊 Model Performance

### 🧬 Health Detection Model (`flower_disease.keras`)

| Metric | Healthy | Diseased |
|---|---|---|
| Precision | 0.90 | 0.91 |
| Recall | 0.90 | 0.89 |
| F1-Score | 0.91 | 0.91 |

**Overall Validation Accuracy: `96.67%`** (Validation set: 780 images)

### 🌺 Species Classification Model (`species_model.keras`)

| Metric | Lily | Rose | Sunflower |
|---|---|---|---|
| Precision | 0.98 | 0.95 | 0.95 |
| Recall | 0.91 | 0.99 | 0.99 |
| F1-Score | 0.95 | 0.97 | 0.97 |

**Overall Validation Accuracy: `96.15%`** (Validation set: 780 images)

### 📁 Dataset
- **Total Images:** 3,900
- **Species:** Lily · Rose · Sunflower (3 classes)
- **Health:** Healthy · Diseased (2 classes)
- **Split:** 80% train (3,120) / 20% validation (780) — Stratified

---

## 🚀 Installation

### Prerequisites

- Python `3.11+`
- Node.js `18+`
- MongoDB Atlas account
- Mistral AI API key → [console.mistral.ai](https://console.mistral.ai/)
- ImageKit account → [imagekit.io](https://imagekit.io)

### 1. Clone the Repository

```bash
git clone https://github.com/dhruvaparnathi/FloraScan-FlowerDiseaseDetectionSystem.git
cd FloraScan-FlowerDiseaseDetectionSystem
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your actual credentials (see Environment Variables section)
```

### 3. Add ML Models

Place your trained Keras model files inside `backend/models/`:
```
backend/models/
├── flower_disease.keras   ← Health detection model
└── species_model.keras    ← Species classification model
```

> 📝 The models are not included in the repo due to file size. Train them using `train_models.py` or obtain from the project team.

### 4. Frontend Setup

```bash
cd Frontend
npm install
```

### 5. Run the Application

**Option A — One command (Windows):**
```batch
run_project.bat
```

**Option B — Manual (two terminals):**

Terminal 1 — Backend:
```bash
cd backend
python app.py
# → http://localhost:5000
```

Terminal 2 — Frontend:
```bash
cd Frontend
npm run dev
# → http://localhost:5173
```

---

## 🔑 Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
# Flask
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/FlowerDetector

# JWT — use a long random string
JWT_SECRET=your_super_secret_jwt_key_here

# Mistral AI (https://console.mistral.ai/)
MISTRAL_API_KEY=your_mistral_api_key

# ImageKit (https://imagekit.io/dashboard/developer/api-keys)
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT token |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user profile |

### Prediction

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/image/upload` | ✅ JWT | Upload image → dual inference → AI treatment → MongoDB log |
| `GET` | `/health` | ❌ | API + model health check |
| `GET` | `/` | ❌ | API status & available endpoints |

### Scan History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/scans/history` | ✅ JWT | Retrieve user's past scans |

### Example: Predict

```bash
curl -X POST http://localhost:5000/image/upload \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "image=@/path/to/rose.jpg"
```

**Response:**
```json
{
  "species": "Rose",
  "health": "Diseased",
  "species_confidence": 0.9885,
  "health_confidence": 0.9021,
  "image_url": "https://ik.imagekit.io/...",
  "treatment_plan": {
    "title": "PATHOGEN ALERT: FOLIAR FUNGAL PROTOCOL",
    "summary": "Pathological indications detected on this rose specimen...",
    "tips": [
      "Debride and isolate infected leaves to prevent spread.",
      "Apply organic copper-based fungicide every 7–10 days.",
      "Enhance airflow and switch to drip irrigation."
    ],
    "ai_model": "Mistral Pixtral 12B Vision"
  }
}
```

---

## 📁 Project Structure

```
FloraScan-FlowerDiseaseDetectionSystem/
│
├── backend/                        # Flask REST API
│   ├── app.py                      # Application entry point
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment variable template
│   ├── config/
│   │   └── db.py                   # MongoDB connection
│   ├── routes/
│   │   ├── auth_routes.py          # /api/auth blueprint
│   │   ├── predict_routes.py       # /image/upload blueprint
│   │   └── scan_routes.py          # /api/scans blueprint
│   ├── models/
│   │   ├── user_model.py           # User schema & queries
│   │   └── scan_model.py           # Scan schema & queries
│   ├── services/
│   │   ├── mistral_service.py      # Mistral AI integration
│   │   └── storage_service.py      # ImageKit CDN integration
│   ├── middleware/
│   │   └── auth_middleware.py      # JWT token_required decorator
│   └── utils/
│       └── auth_utils.py           # bcrypt hashing, JWT generation
│
├── Frontend/                       # React + Vite SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── pages/
│       │   └── HomePage.jsx
│       ├── components/
│       │   ├── Layout/             # Navbar, Footer
│       │   ├── Specimen/           # SpecimenTester, Gallery, ScanHistory
│       │   └── Common/             # CustomCursor, Marquee
│       └── Features/
│           ├── Auth/               # Login, Register, AuthContext
│           └── Scans/              # Scan history service
│
├── models/                         # Jupyter notebooks
│   └── CNN.ipynb                   # Model training notebook
├── train_models.py                 # Training script
├── evaluate_accuracy.py            # Evaluation script
├── run_project.bat                 # One-click launcher (Windows)
├── requirements.txt                # Root-level Python deps
└── README.md
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r backend/requirements.txt` |
| Model not loading | Ensure `flower_disease.keras` and `species_model.keras` exist in `backend/models/` |
| MongoDB connection failed | Check `MONGO_URI` in `.env` — ensure your IP is whitelisted in Atlas |
| Port 5000 already in use | Change `PORT=5001` in `.env` |
| Frontend CORS error | Ensure backend is running; check port matches in `backend/app.py` |
| Mistral AI timeout | Fallback rule engine activates automatically — check `MISTRAL_API_KEY` |

---

## 👥 Team

**Group 50** — Final Year Deep Learning Project

| Name | Role |
|---|---|
| **Dhruvaparnathi** | ML Engineering, Backend API, Frontend, Cloud Integration |

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with 🌸 by Group 50 · Powered by TensorFlow, Mistral AI & React

</div>
