# 🌸 Flower Disease Detection & Botanical Intelligence System
## Complete Technical Documentation for Final Year Project Report

---

## 1. Project Title & Abstract
* **Title:** Automated Flower Species Identification and Plant Pathology Diagnosis using Deep Transfer Learning, Generative AI, and Cloud Infrastructure
* **Domain:** Computer Vision, Deep Learning, Generative AI (LLMs), Cloud Storage, Full-Stack Web Development
* **Abstract:**  
  Modern precision agriculture and botanical preservation require rapid, non-destructive identification of plant species and early pathology detection. This project implements an end-to-end, multi-model Computer Vision system leveraging **MobileNetV2 Transfer Learning** to simultaneously perform species classification (Lily, Rose, Sunflower) and health status diagnosis (Healthy vs. Diseased). The dual-model engine achieves **96.67% accuracy** on disease detection and **96.15% accuracy** on species identification across 3,900 images. Predictions are enriched with customized horticultural care and treatment protocols generated dynamically by **Mistral AI (Pixtral 12B / Mistral Small)**. Images are stored on **ImageKit Cloud CDN**, telemetry records are logged into **MongoDB Atlas**, and the application is exposed through a **Flask REST API** connected to a modern **React 19 + Vite + Tailwind CSS** interactive frontend.

---

## 2. Full Technology Stack Matrix

| Subsystem / Layer | Technology | Version / Specification | Role & Responsibility |
| :--- | :--- | :--- | :--- |
| **Deep Learning Framework** | TensorFlow / Keras | 2.20.0 / 3.13.2 | Neural network definition, transfer learning, checkpointing, inference |
| **Pre-trained Backbone** | MobileNetV2 | ImageNet Weights | Feature extraction layer (frozen backbone for fast CPU inference) |
| **Computer Vision** | OpenCV (`opencv-python`) | 4.11 | Image decoding from buffer, RGB conversion, 160×160 scaling |
| **Generative AI (LLM)** | Mistral AI API | Pixtral 12B Vision / Mistral Small | Dynamic botanical treatment plan & care protocol generation |
| **Cloud CDN Storage** | ImageKit SDK | REST API | Cloud image hosting, specimen CDN links, auto-thumbnails |
| **Backend REST API** | Flask / Flask-CORS | 3.1.0 | Modular REST API, Blueprint routing, JWT auth middleware |
| **Database System** | MongoDB Atlas | PyMongo 4.x | User authentication storage, scan telemetry, indexing |
| **Authentication & Security** | PyJWT, Passlib (Bcrypt) | JWT / Bcrypt | Secure user sign-up/sign-in, hashed credentials, protected routes |
| **Frontend Framework** | React 19 / Vite | 19.2.0 / 7.3.6 | Single Page Application (SPA), state management |
| **UI Styling & Animation** | Tailwind CSS v4, Framer Motion, Lenis Scroll, Lucide Icons | v4.3.2 / v12.42 | Modern dark/cream themed aesthetic, smooth scroll physics, animations |
| **Evaluation & Metrics** | Scikit-Learn | 1.x | Stratified train-test split (80/20), classification reports, confusion matrices |

---

## 3. Dataset & Data Preprocessing Specification

### A. Dataset Breakdown
* **Total Image Count:** 3,900 images
* **Classes Supported:**
  * **Species (3 Classes):** Lily, Rose, Sunflower
  * **Health (2 Classes):** Healthy, Diseased
* **Dataset Partitioning (80/20 Stratified Split):**
  * **Training Set:** 3,120 images (80%)
  * **Validation Set:** 780 images (20%)

### B. Preprocessing & Normalization Pipeline
1. **Color Space Transformation:** OpenCV reads image stream in BGR $\rightarrow$ converted to RGB.
2. **Spatial Rescaling:** All images resized to $160 \times 160$ pixels.
3. **Pixel Normalization:**
   $$x_{norm} = \frac{\text{Pixel}_{RGB}}{255.0} \in [0, 1]$$
4. **MobileNetV2 Layer Rescaling:**
   $$x_{rescaled} = (x_{norm} \times 2.0) - 1.0 \in [-1, 1]$$

### C. On-the-Fly Data Augmentation
To prevent overfitting and handle class imbalance, a Keras `Sequential` augmentation pipeline is applied during training:
* `RandomFlip("horizontal_and_vertical")`
* `RandomRotation(0.15)` ($\pm 15^\circ$)
* `RandomZoom(0.10)` ($\pm 10\%$)

---

## 4. Deep Learning Model Architectures & Formulations

Both models utilize a shared feature extractor design built on top of **MobileNetV2**:

```
Input (160 x 160 x 3)
       │
Data Augmentation (Flip, Rotation, Zoom)
       │
Rescaling Layer [-1, 1]
       │
MobileNetV2 Backbone (ImageNet Pre-trained, Frozen)
       │
Global Average Pooling 2D (GAP)
       │
Dense Layer (256 units, ReLU) -> Dropout (0.4)
       │
Dense Layer (128 units, ReLU) -> Dropout (0.3)
       │
  ┌────┴──────────────────────────┐
  ▼                               ▼
Health Head (1 unit)       Species Head (3 units)
Activation: Sigmoid        Activation: Softmax
Loss: Binary Crossentropy  Loss: Sparse Categorical Crossentropy
```

### Mathematical Equations

1. **Sigmoid Activation (Health Model Output):**
   $$\sigma(z) = \frac{1}{1 + e^{-z}}$$
   * Decision threshold: If $\sigma(z) > 0.5 \implies \text{Diseased}$, else $\text{Healthy}$.

2. **Binary Cross-Entropy Loss (Health Model):**
   $$\mathcal{L}_{\text{health}} = - \frac{1}{N} \sum_{i=1}^{N} \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$

3. **Softmax Output Function (Species Model):**
   $$\sigma(\mathbf{z})_i = \frac{e^{z_i}}{\sum_{j=1}^{C} e^{z_j}} \quad \text{for } c = 1, 2, 3$$

4. **Sparse Categorical Cross-Entropy Loss (Species Model):**
   $$\mathcal{L}_{\text{species}} = - \frac{1}{N} \sum_{i=1}^{N} \sum_{c=1}^{C} y_{i,c} \log(\hat{y}_{i,c})$$

---

## 5. Model Performance & Evaluation Metrics (Validation Set: 780 Images)

### A. Health Model (`health_model.keras`)
* **Validation Accuracy:** **96.67%**
* **Confusion Matrix:**
  $$C_{\text{health}} = \begin{pmatrix} 402 & 3 \\ 23 & 352 \end{pmatrix}$$
  *(Rows = Actual [Healthy, Diseased], Columns = Predicted [Healthy, Diseased])*

* **Classification Report:**
  * **Healthy Class:** Precision: `0.95`, Recall: `0.99`, F1-Score: `0.97` (Support: 405)
  * **Diseased Class:** Precision: `0.99`, Recall: `0.94`, F1-Score: `0.96` (Support: 375)

### B. Species Model (`species_model.keras`)
* **Validation Accuracy:** **96.15%**
* **Confusion Matrix:**
  $$C_{\text{species}} = \begin{pmatrix} 250 & 14 & 10 \\ 2 & 265 & 2 \\ 2 & 0 & 235 \end{pmatrix}$$
  *(Rows = Actual [Lily, Rose, Sunflower], Columns = Predicted [Lily, Rose, Sunflower])*

* **Classification Report:**
  * **Lily Class:** Precision: `0.98`, Recall: `0.91`, F1-Score: `0.95` (Support: 274)
  * **Rose Class:** Precision: `0.95`, Recall: `0.99`, F1-Score: `0.97` (Support: 269)
  * **Sunflower Class:** Precision: `0.95`, Recall: `0.99`, F1-Score: `0.97` (Support: 237)

---

## 6. Generative AI & Cloud Integration Architecture

### A. Mistral AI Treatment Plan Generation
When a scan completes, the prediction data is fed to **Mistral AI**:
* **Primary Strategy:** Multimodal Vision via `pixtral-12b-2409` (analyzes both image URL and diagnostic metadata).
* **Secondary Strategy:** Fast completion via `mistral-small-latest` with `response_format={"type": "json_object"}`.
* **Offline Fallback:** Local rule engine providing domain-specific botanical care protocols if cloud network is unreachable.
* **Returned JSON Structure:**
  ```json
  {
    "title": "PATHOGEN ALERT: FOLIAR FUNGAL PROTOCOL",
    "summary": "Pathological indications detected on this rose specimen requiring targeted horticultural intervention.",
    "tips": [
      "Debride and isolate infected leaves to prevent pathogenic micro-spore dissemination.",
      "Enhance airflow around the canopy and transition to drip irrigation.",
      "Apply an organic copper-based fungicide every 7-10 days."
    ],
    "ai_model": "Mistral Pixtral 12B Vision"
  }
  ```

### B. ImageKit Cloud Storage
* Uploads image binary stream directly to folder `/flower_specimens`.
* Generates CDN URL, thumbnail URL, and `file_id` for cloud management.

---

## 7. Database Schemas (MongoDB Atlas - `FlowerDetector`)

### Collection 1: `users`
```json
{
  "_id": "ObjectId",
  "name": "Operator Name",
  "email": "user@example.com",
  "password": "$2b$12$hashed_password...",
  "role": "operator",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```
* **Indexes:** `email` (Unique, ASC), `username` (Unique, Sparse)

### Collection 2: `scans`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId(user_ref)",
  "image_url": "https://ik.imagekit.io/...",
  "thumbnail_url": "https://ik.imagekit.io/...",
  "file_id": "file_id_string",
  "species": "Rose",
  "health": "Diseased",
  "species_confidence": 0.9985,
  "health_confidence": 0.9421,
  "treatment_plan": {
    "title": "...",
    "summary": "...",
    "tips": ["..."],
    "ai_model": "..."
  },
  "created_at": "ISODate"
}
```
* **Indexes:** `(user_id: 1, created_at: -1)`

---

## 8. Backend REST API Endpoint Architecture

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | No | API status, model loading state, active endpoints |
| `GET` | `/health` | No | System health check, TensorFlow version |
| `POST` | `/api/auth/register` | No | User sign-up, Bcrypt password hash, JWT return |
| `POST` | `/api/auth/login` | No | User login, password verification, JWT return |
| `GET` | `/api/auth/me` | Yes (JWT) | Get current authenticated user profile |
| `POST` | `/image/upload` | Yes (JWT) | Image upload $\rightarrow$ Dual Model Inference $\rightarrow$ ImageKit CDN $\rightarrow$ Mistral AI $\rightarrow$ MongoDB log |
| `GET` | `/api/scans/history` | Yes (JWT) | Retrieve current user's past botanical scan history |

---

## 9. Frontend Architecture & User Interface

* **Framework:** React 19 + Vite 7.3 SPA
* **Styling:** Tailwind CSS v4, custom theme toggles (`cream`, `onyx`, `crimson`)
* **Key Components:**
  * `Navbar.jsx`: Brand logo, theme selector, navigation controls.
  * `SpecimenTester.jsx`: Interactive upload zone (drag & drop or sample selection), live terminal execution log simulator (`INITIALIZING TENSORENGINES...`), scan speed adjustments, zoom/grid overlay controls, diagnosis reveal with confidence gauges, Generative AI treatment protocol card, confetti animation trigger for healthy specimens.
  * `Gallery.jsx`: Curated sample specimen cards with preset injection directly into the testing scanner.
  * `InteractiveGlyphs.jsx` & `Marquee.jsx`: Dynamic botanical iconography and kinetic marquee.
  * `CustomCursor.jsx`: Context-aware custom pointer.

---

## 10. Summary of Key Achievements
1. **Dual Task Inference:** Combined species identification & health assessment into a single fast workflow.
2. **High Validation Accuracy:** Achieved **96.67%** health diagnosis and **96.15%** species classification.
3. **Generative AI Treatment Guidance:** Integrated Mistral AI to go beyond prediction and deliver actionable plant care instructions.
4. **Cloud & Database Integration:** Connected ImageKit CDN & MongoDB Atlas for scalable storage and scan history tracking.
5. **Production Ready Web App:** Delivered a complete React 19 + Flask 3.1 web interface.
