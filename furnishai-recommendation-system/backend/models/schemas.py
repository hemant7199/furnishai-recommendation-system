from pydantic import BaseModel
from typing import Optional, List

class Product(BaseModel):
    uniq_id: str = ""
    title: str = ""
    brand: Optional[str] = ""
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    categories: Optional[str] = ""
    leaf_category: Optional[str] = ""
    first_image: Optional[str] = ""
    manufacturer: Optional[str] = ""
    package_dimensions: Optional[str] = ""
    country_of_origin: Optional[str] = ""
    material: Optional[str] = ""
    color: Optional[str] = ""

class RecommendationRequest(BaseModel):
    query: str
    top_k: int = 6

class RecommendationResponse(BaseModel):
    product: Product
    score: float
    generated_description: str
    category_label: Optional[str] = ""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    top_k: int = 6

class ChatResponse(BaseModel):
    reply: str
    recommendations: Optional[List[RecommendationResponse]] = []
