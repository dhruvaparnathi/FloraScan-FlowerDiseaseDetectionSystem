"""
MongoDB Database Configuration & Connection
============================================
Handles connection to MongoDB Atlas using MONGO_URI in .env
"""

import os
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET", "flower_disease_detection_secret_jwt_key_2026")
PORT = int(os.getenv("PORT", 5000))

# Initialize MongoDB client
mongo_client = None
db = None
users_collection = None

def get_db():
    global mongo_client, db, users_collection
    if db is not None:
        return db

    if not MONGO_URI:
        print("[WARNING] MONGO_URI not found in environment variables.")
        return None

    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Access database (FlowerDetector)
        db = mongo_client["FlowerDetector"]
        users_collection = db["users"]
        
        # Ensure unique indexes
        users_collection.create_index([("email", ASCENDING)], unique=True)
        users_collection.create_index([("username", ASCENDING)], unique=True, sparse=True)
        
        print(f"[MongoDB] Connected successfully to database: '{db.name}'")
        return db
    except Exception as e:
        print(f"[MongoDB ERROR] Could not connect to MongoDB: {e}")
        return None

def get_users_collection():
    global users_collection
    if users_collection is None:
        get_db()
    return users_collection
