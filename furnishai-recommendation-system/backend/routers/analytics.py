from fastapi import APIRouter, HTTPException
import numpy as np
from backend.utils.data_utils import load_and_clean
from backend.config import get_settings

router   = APIRouter()
settings = get_settings()
_df_cache = None

def _get_df():
    global _df_cache
    if _df_cache is None:
        try:
            _df_cache = load_and_clean(settings.DATA_PATH)
        except FileNotFoundError:
            raise HTTPException(status_code=404,
                detail=f"Dataset not found at {settings.DATA_PATH}")
    return _df_cache

def _top_counts(df, col, n=10):
    series = df[col].replace("", None).dropna()
    vc = series.value_counts().head(n)
    return [{"name": k, "count": int(v)} for k, v in vc.items()]

@router.get("/summary")
def get_summary():
    df = _get_df()
    price_s = df["price"].replace(0.0, None).dropna()
    if not price_s.empty:
        hist, edges = np.histogram(price_s, bins=10)
        price_dist = {f"${int(edges[i])}-${int(edges[i+1])}": int(hist[i]) for i in range(len(hist))}
    else:
        price_dist = {}
    return {
        "total_products":     int(len(df)),
        "unique_brands":      int(df["brand"].replace("", None).nunique()),
        "avg_price":          round(float(price_s.mean()), 2) if not price_s.empty else 0,
        "price_distribution": price_dist,
        "top_categories":     _top_counts(df, "leaf_category"),
        "brand_counts":       _top_counts(df, "brand"),
        "color_counts":       _top_counts(df, "color"),
        "origin_counts":      _top_counts(df, "country_of_origin"),
        "material_counts":    _top_counts(df, "material"),
        "price_range": {
            "min": round(float(price_s.min()), 2) if not price_s.empty else 0,
            "max": round(float(price_s.max()), 2) if not price_s.empty else 0,
        },
    }

@router.get("/products")
def list_products(page: int = 1, page_size: int = 20, search: str = ""):
    df = _get_df()
    if search:
        df = df[df["title"].str.contains(search, case=False, na=False)]
    total   = len(df)
    start   = (page - 1) * page_size
    page_df = df.iloc[start: start + page_size].fillna("").copy()
    page_df["price"] = page_df["price"].apply(lambda x: round(float(x), 2))
    return {"total": total, "page": page, "page_size": page_size,
            "products": page_df.to_dict(orient="records")}
