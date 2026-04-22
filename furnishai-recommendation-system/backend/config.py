from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ikarus-furniture"
    OPENAI_API_KEY: str = ""

    DATA_PATH: str = "backend/data/intern_data_ikarus.csv"
    IMAGE_MODEL_PATH: str = "backend/models/image_classifier.pth"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()