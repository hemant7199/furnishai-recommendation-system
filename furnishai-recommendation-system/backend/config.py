from pydantic import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ikarus-furniture"
    OPENAI_API_KEY: str = ""

    # 🔥 HARDCODE FULL ABSOLUTE PATH (NO CONFUSION)
    DATA_PATH: str = "/opt/render/project/src/backend/data/intern_data_ikarus.csv"
    IMAGE_MODEL_PATH: str = "/opt/render/project/src/backend/models/image_classifier.pth"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()