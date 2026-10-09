"""
ImageKit Cloud Storage Service
==============================
Handles uploading specimen images to ImageKit using IMAGEKIT_PRIVATE_KEY.
"""

import os
import uuid
import base64
import requests
import urllib3
from dotenv import load_dotenv

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "").strip()
IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload"


def upload_image_to_imagekit(file_bytes: bytes, file_name: str = None, folder: str = "/flower_specimens") -> dict:
    """
    Uploads image bytes to ImageKit cloud CDN.
    Returns dict:
      {
        "success": True/False,
        "url": str,
        "thumbnail_url": str,
        "file_id": str,
        "name": str
      }
    """
    if not IMAGEKIT_PRIVATE_KEY:
        print("[ImageKit Warning] IMAGEKIT_PRIVATE_KEY not set in .env")
        return {
            "success": False,
            "url": "",
            "thumbnail_url": "",
            "file_id": "",
            "name": file_name or "unknown.jpg",
            "error": "IMAGEKIT_PRIVATE_KEY missing"
        }

    if not file_name:
        file_name = f"specimen_{uuid.uuid4().hex[:10]}.jpg"

    try:
        auth_str = f"{IMAGEKIT_PRIVATE_KEY}:"
        auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        headers = {
            "Authorization": f"Basic {auth_b64}"
        }

        # Detect content type
        content_type = "image/png" if file_name.lower().endswith(".png") else "image/jpeg"

        files = {
            "file": (file_name, file_bytes, content_type)
        }
        data = {
            "fileName": file_name,
            "folder": folder,
            "useUniqueFileName": "true",
            "tags": "florascan,specimen,botany"
        }

        response = requests.post(
            IMAGEKIT_UPLOAD_URL,
            headers=headers,
            files=files,
            data=data,
            verify=False,
            timeout=15
        )

        if response.status_code in [200, 201]:
            res_data = response.json()
            return {
                "success": True,
                "url": res_data.get("url", ""),
                "thumbnail_url": res_data.get("thumbnailUrl", res_data.get("url", "")),
                "file_id": res_data.get("fileId", ""),
                "name": res_data.get("name", file_name)
            }
        else:
            print(f"[ImageKit Upload Failed]: HTTP {response.status_code} - {response.text}")
            return {
                "success": False,
                "url": "",
                "thumbnail_url": "",
                "file_id": "",
                "name": file_name,
                "error": response.text
            }

    except Exception as exc:
        print(f"[ImageKit Exception]: {exc}")
        return {
            "success": False,
            "url": "",
            "thumbnail_url": "",
            "file_id": "",
            "name": file_name,
            "error": str(exc)
        }
