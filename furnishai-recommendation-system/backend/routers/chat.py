from fastapi import APIRouter, HTTPException
from backend.models.schemas import ChatRequest, ChatResponse, RecommendationResponse, Product
from backend.utils.data_utils import load_and_clean
from backend.config import get_settings
from backend.services.cv_service import ImageClassifierService

router = APIRouter()

settings = get_settings()
_cv = ImageClassifierService()


@router.post("/message", response_model=ChatResponse)
def chat_message(req: ChatRequest):
    user_msgs = [m for m in req.messages if m.role == "user"]
    if not user_msgs:
        raise HTTPException(status_code=400, detail="No user message found.")

    query = user_msgs[-1].content

    try:
        df = load_and_clean(settings.DATA_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset error: {e}")

    # 🔥 simple search
    df_filtered = df[df["title"].str.contains(query, case=False, na=False)]

    if df_filtered.empty:
        df_filtered = df.head(req.top_k)
    else:
        df_filtered = df_filtered.head(req.top_k)

    results = df_filtered.to_dict(orient="records")

    recommendations = []

    for row in results:
        product = Product(
            uniq_id=str(row.get("uniq_id", "")),
            title=row.get("title", ""),
            brand=row.get("brand", ""),
            description=row.get("description", ""),
            price=float(row.get("price", 0) or 0),
            categories=row.get("categories", ""),
            leaf_category=row.get("leaf_category", ""),
            first_image=row.get("first_image", ""),
            manufacturer=row.get("manufacturer", ""),
            package_dimensions=row.get("package_dimensions", ""),
            country_of_origin=row.get("country_of_origin", ""),
            material=row.get("material", ""),
            color=row.get("color", ""),
        )

        label = _cv.classify(
            row.get("first_image", ""),
            fallback_category=row.get("leaf_category", "")
        )

        recommendations.append(
            RecommendationResponse(
                product=product,
                score=1.0,
                generated_description=row.get("description", ""),
                category_label=label
            )
        )

    # simple reply (no OpenAI)
    reply = f"I found {len(recommendations)} products matching '{query}'."

    return ChatResponse(reply=reply, recommendations=recommendations)