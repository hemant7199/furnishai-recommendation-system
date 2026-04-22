from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, RecommendationResponse, Product
from services.vector_db import VectorDBService
from services.genai_service import GenAIService
from services.cv_service import ImageClassifierService

router = APIRouter()
_vdb = _genai = _cv = None

def get_services():
    global _vdb, _genai, _cv
    if _vdb is None:
        _vdb   = VectorDBService()
        _genai = GenAIService()
        _cv    = ImageClassifierService()
    return _vdb, _genai, _cv

@router.post("/message", response_model=ChatResponse)
def chat_message(req: ChatRequest):
    user_msgs = [m for m in req.messages if m.role == "user"]
    if not user_msgs:
        raise HTTPException(status_code=400, detail="No user message found.")
    query = user_msgs[-1].content
    vdb, genai, cv = get_services()
    try:
        results = vdb.search(query, top_k=req.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {e}")
    recommendations, raw = [], []
    for match in results:
        meta = match["metadata"]
        raw.append(meta)
        product = Product(
            uniq_id=match["id"], title=meta.get("title", ""),
            brand=meta.get("brand", ""), description=meta.get("description", ""),
            price=float(meta.get("price", 0) or 0),
            categories=meta.get("categories", ""), leaf_category=meta.get("leaf_category", ""),
            first_image=meta.get("first_image", ""), manufacturer=meta.get("manufacturer", ""),
            package_dimensions=meta.get("package_dimensions", ""),
            country_of_origin=meta.get("country_of_origin", ""),
            material=meta.get("material", ""), color=meta.get("color", ""),
        )
        label = cv.classify(meta.get("first_image", ""), fallback_category=meta.get("leaf_category", ""))
        desc  = genai.generate_description(meta)
        recommendations.append(RecommendationResponse(
            product=product, score=match["score"],
            generated_description=desc, category_label=label))
    msgs_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
    reply = genai.generate_chat_reply(msgs_dicts, raw)
    return ChatResponse(reply=reply, recommendations=recommendations)
