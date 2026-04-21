from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import RecommendationRequest, RecommendationResponse, Product
from services.vector_db import VectorDBService
from services.genai_service import GenAIService
from services.cv_service import ImageClassifierService, FURNITURE_CATEGORIES

router = APIRouter()
_vdb = _genai = _cv = None

def get_services():
    global _vdb, _genai, _cv
    if _vdb is None:
        _vdb   = VectorDBService()
        _genai = GenAIService()
        _cv    = ImageClassifierService()
    return _vdb, _genai, _cv

def _meta_to_product(uid, meta):
    return Product(
        uniq_id=uid, title=meta.get("title", ""),
        brand=meta.get("brand", ""), description=meta.get("description", ""),
        price=float(meta.get("price", 0) or 0),
        categories=meta.get("categories", ""), leaf_category=meta.get("leaf_category", ""),
        first_image=meta.get("first_image", ""), manufacturer=meta.get("manufacturer", ""),
        package_dimensions=meta.get("package_dimensions", ""),
        country_of_origin=meta.get("country_of_origin", ""),
        material=meta.get("material", ""), color=meta.get("color", ""),
    )

@router.post("/search", response_model=List[RecommendationResponse])
def search_products(req: RecommendationRequest):
    vdb, genai, cv = get_services()
    try:
        results = vdb.search(req.query, top_k=req.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {e}")
    out = []
    for match in results:
        meta = match["metadata"]
        product = _meta_to_product(match["id"], meta)
        label = cv.classify(meta.get("first_image", ""), fallback_category=meta.get("leaf_category", ""))
        desc  = genai.generate_description(meta)
        out.append(RecommendationResponse(product=product, score=match["score"],
                                          generated_description=desc, category_label=label))
    return out

@router.get("/categories")
def list_categories():
    return {"categories": FURNITURE_CATEGORIES}
