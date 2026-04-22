"""
data_utils.py - Shared CSV cleaning helpers for intern_data_ikarus.csv
- price: '$24.99' -> 24.99
- categories: "['Home & Kitchen', 'Furniture', 'Chairs']" -> leaf = 'Chairs'
- images: list string -> first URL
"""
import ast
import re
import pandas as pd

def clean_price(val) -> float:
    try:
        return float(str(val).replace("$", "").replace(",", "").strip())
    except Exception:
        return 0.0

def parse_categories(val) -> list:
    try:
        result = ast.literal_eval(str(val))
        if isinstance(result, list):
            return [str(x).strip() for x in result]
    except Exception:
        pass
    return [x.strip().strip("'\"[] ") for x in str(val).split(",")]

def leaf_category(val) -> str:
    cats = parse_categories(val)
    return cats[-1] if cats else "Other"

def parse_images(val) -> list:
    try:
        result = ast.literal_eval(str(val))
        if isinstance(result, list):
            return [str(u).strip() for u in result if str(u).strip()]
    except Exception:
        pass
    return re.findall(r'https?://[^\s\'">,\]]+', str(val))

def first_image(val) -> str:
    imgs = parse_images(val)
    return imgs[0] if imgs else ""

def load_and_clean(data_path: str) -> pd.DataFrame:
    df = pd.read_csv(data_path, encoding="utf-8")

    # 🔥 IMPORTANT FIX
    df = df.fillna("")

    # Clean price safely
    df["price"] = df["price"].apply(clean_price)
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0)

    # Derived fields
    df["leaf_category"] = df["categories"].apply(leaf_category)
    df["first_image"] = df["images"].apply(first_image)

    # Clean all string columns
    str_cols = ["title", "brand", "description", "material",
                "color", "country_of_origin", "manufacturer",
                "package_dimensions", "uniq_id", "categories"]

    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str).str.strip()

    return df