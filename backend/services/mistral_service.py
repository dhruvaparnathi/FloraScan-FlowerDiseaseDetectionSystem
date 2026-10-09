"""
Mistral Generative AI Botanical Treatment Service
==================================================
Uses Mistral AI (Pixtral 12B Vision / Mistral Small) to analyze specimen
pathology and generate customized botanical care and treatment plans.
"""

import os
import json
import requests
import urllib3
from dotenv import load_dotenv

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "").strip()
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"


def generate_botanical_treatment_plan(species: str, health: str, confidence: float, image_url: str = None) -> dict:
    """
    Generates a personalized botanical care/treatment plan using Mistral AI.
    
    Returns:
      {
        "title": str,
        "summary": str,
        "tips": list of 3-4 strings,
        "ai_model": str
      }
    """
    default_plan = _get_fallback_plan(species, health)
    
    if not MISTRAL_API_KEY:
        print("[Mistral Warning] MISTRAL_API_KEY is not configured in .env")
        return default_plan

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = (
        "You are 'Flora Scan AI', an elite senior botanical pathologist and agricultural disease specialist. "
        "Your task is to analyze flower specimen classification data and generate a clear, highly actionable, and professional "
        "botanical treatment and care plan for gardeners and plant specialists. "
        "You MUST return valid JSON with exactly the following schema: "
        "{\n"
        '  "title": "A punchy, capitalized action title (e.g. PATHOGEN ALERT: FOLIAR FUNGAL PROTOCOL or OPTIMAL SOLAR & HYDRATION SCHEDULE)",\n'
        '  "summary": "A 1-2 sentence professional assessment of the specimen condition.",\n'
        '  "tips": [\n'
        '    "Actionable bullet 1 (debridement, watering technique, aeration, or solar azimuths)",\n'
        '    "Actionable bullet 2 (organic fungicides, systemic treatments, pruning, or soil pH balance)",\n'
        '    "Actionable bullet 3 (preventive isolation, humidity control, or structural support)"\n'
        "  ]\n"
        "}"
    )

    user_text_prompt = (
        f"Specimen Analysis Report:\n"
        f"- Identified Species: {species}\n"
        f"- Health Status: {health.upper()}\n"
        f"- Diagnosis Confidence: {confidence * 100:.1f}%\n\n"
        f"Please provide an accurate, science-backed botanical treatment or maintenance protocol for this {species} flower in {health.lower()} condition. "
        f"Output strictly valid JSON with keys: 'title', 'summary', and 'tips' (array of 3 strings)."
    )

    # Strategy 1: Multimodal Vision using Pixtral 12B if image_url is accessible
    if image_url:
        try:
            payload = {
                "model": "pixtral-12b-2409",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_text_prompt},
                            {"type": "image_url", "image_url": image_url}
                        ]
                    }
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
                "max_tokens": 500
            }

            response = requests.post(
                MISTRAL_API_URL,
                headers=headers,
                json=payload,
                verify=False,
                timeout=18
            )

            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return _normalize_plan(parsed, "Mistral Pixtral 12B Vision")
            else:
                print(f"[Mistral Pixtral Warning] HTTP {response.status_code}: {response.text}")
        except Exception as p_err:
            print(f"[Mistral Pixtral Exception]: {p_err}. Falling back to Mistral Small...")

    # Strategy 2: Fast text completion with Mistral Small
    try:
        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
            "max_tokens": 450
        }

        response = requests.post(
            MISTRAL_API_URL,
            headers=headers,
            json=payload,
            verify=False,
            timeout=12
        )

        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return _normalize_plan(parsed, "Mistral Small Latest")
        else:
            print(f"[Mistral Small Error] HTTP {response.status_code}: {response.text}")

    except Exception as s_err:
        print(f"[Mistral Small Exception]: {s_err}")

    return default_plan


def _normalize_plan(raw_json: dict, model_name: str) -> dict:
    """Safely extracts title, summary, and tips list from LLM output."""
    title = raw_json.get("title") or "BOTANICAL PATHOLOGY PROTOCOL"
    summary = raw_json.get("summary") or "AI generated botanical care protocol based on deep learning pathology analysis."
    
    tips = raw_json.get("tips")
    if not isinstance(tips, list) or len(tips) == 0:
        # Check if tips are nested or key names differed
        if "treatment_plan" in raw_json and isinstance(raw_json["treatment_plan"], dict):
            sub = raw_json["treatment_plan"]
            title = sub.get("title", title)
            raw_sub_tips = sub.get("tips", [])
            tips = [t if isinstance(t, str) else t.get("tip", str(t)) for t in raw_sub_tips]
        else:
            tips = ["Debride any visibly affected foliage to preserve plant vigor.",
                    "Ensure adequate air aeration and water only at the root base.",
                    "Maintain optimal soil drainage and monitor nutrient absorption."]
    else:
        # Convert any dict objects in tips array to plain strings
        clean_tips = []
        for t in tips:
            if isinstance(t, str):
                clean_tips.append(t)
            elif isinstance(t, dict):
                clean_tips.append(t.get("tip") or t.get("description") or str(t))
            else:
                clean_tips.append(str(t))
        tips = clean_tips

    return {
        "title": title.upper(),
        "summary": summary,
        "tips": tips,
        "ai_model": model_name
    }


def _get_fallback_plan(species: str, health: str) -> dict:
    """Local fallback in case AI service is unavailable."""
    sp = (species or "flower").lower()
    hl = (health or "healthy").lower()

    if hl == "healthy":
        return {
            "title": f"OPTIMAL {sp.upper()} VITALITY & HYDRATION REGIMEN",
            "summary": f"Specimen demonstrates robust cellular integrity and healthy pigmentation.",
            "tips": [
                f"Expose to 6–8 hours of raw solar azimuths daily to sustain vigorous photosynthetic activity.",
                "Irrigate deeply at the base to maintain soil moisture around 65%. Avoid overhead leaf wetting.",
                "Prune spent blooms regularly to stimulate structural biomass renewal and root development."
            ],
            "ai_model": "Botanical Rule Engine (Offline)"
        }
    else:
        return {
            "title": f"PATHOGEN PROTOCOL: {sp.upper()} FOLIAR REMEDIATION",
            "summary": f"Pathological indications detected on this {sp} specimen requiring targeted horticultural intervention.",
            "tips": [
                "Immediately debride and isolate infected leaves to prevent pathogenic micro-spore dissemination.",
                "Enhance airflow around the canopy and transition to drip irrigation to keep foliage strictly dry.",
                "Apply an organic copper-based fungicide or neem oil emulsion every 7–10 days until symptoms abate."
            ],
            "ai_model": "Botanical Rule Engine (Offline)"
        }
