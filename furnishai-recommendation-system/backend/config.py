from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PINECONE_API_KEY: str = "your-pinecone-api-key"
    PINECONE_ENV: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ikarus-furniture"
    OPENAI_API_KEY: str = "your-openai-api-key"
    HF_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    DATA_PATH: str = "backend/data/intern_data_ikarus.csv"
    IMAGE_MODEL_PATH: str = "backend/models/image_classifier.pth"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

@lru_cache()
def get_settings() -> Settings:
    return Settings()