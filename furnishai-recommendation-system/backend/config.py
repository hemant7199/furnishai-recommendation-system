from pydantic import BaseSettings
from functools import lru_cache
import os


# 🔥 Get backend folder path (robust for Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Settings(BaseSettings):
    # 🔑 API KEYS
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ikarus-furniture"
    OPENAI_API_KEY: str = ""

    # 📁 FILE PATHS (FIXED)
    DATA_PATH: str = os.path.join(BASE_DIR, "data", "intern_data_ikarus.csv")
    IMAGE_MODEL_PATH: str = os.path.join(BASE_DIR, "models", "image_classifier.pth")

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()