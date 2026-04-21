"""
ingest_data.py - Run once to upload all 312 products to Pinecone.
Usage: cd backend && python utils/ingest_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_utils import load_and_clean
from services.vector_db import VectorDBService
from config import get_settings

def main():
    settings = get_settings()
    print(f"Loading: {settings.DATA_PATH}")
    df = load_and_clean(settings.DATA_PATH)
    print(f"Loaded {len(df)} products")
    db = VectorDBService()
    print("Uploading to Pinecone...")
    db.upsert_products(df)
    print("Done!")

if __name__ == "__main__":
    main()
