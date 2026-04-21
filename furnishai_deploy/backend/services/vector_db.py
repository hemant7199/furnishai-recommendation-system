"""
vector_db.py - Pinecone v3 + SentenceTransformer embeddings
"""
import pandas as pd
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from config import get_settings

settings = get_settings()


class VectorDBService:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.model = SentenceTransformer(settings.HF_MODEL_NAME)
        self.index = self._get_or_create_index()

    def _get_or_create_index(self):
        existing = [idx.name for idx in self.pc.list_indexes()]
        if settings.PINECONE_INDEX_NAME not in existing:
            self.pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region=settings.PINECONE_ENV),
            )
        return self.pc.Index(settings.PINECONE_INDEX_NAME)

    def _build_text(self, row: pd.Series) -> str:
        parts = [
            str(row.get("title", "")),
            str(row.get("brand", "")),
            str(row.get("description", "")),
            str(row.get("leaf_category", "")),
            str(row.get("material", "")),
            str(row.get("color", "")),
        ]
        return " | ".join(p for p in parts if p and p != "nan")

    def embed_text(self, text: str) -> List[float]:
        return self.model.encode(text).tolist()

    # ✅ FIXED FUNCTION
    def upsert_products(self, df: pd.DataFrame):
        # 🔥 CLEAN DATA
        df = df.fillna("")
        df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0)

        texts = [self._build_text(row) for _, row in df.iterrows()]
        embeddings = self.model.encode(
            texts, batch_size=32, show_progress_bar=True
        ).tolist()

        vectors = []

        for i, (_, row) in enumerate(df.iterrows()):
            try:
                price_val = float(row.get("price", 0))
            except:
                price_val = 0.0

            meta = {
                "title": str(row.get("title", ""))[:250],
                "brand": str(row.get("brand", "")),
                "price": price_val,
                "categories": str(row.get("categories", "")),
                "leaf_category": str(row.get("leaf_category", "")),
                "first_image": str(row.get("first_image", "")),
                "url": str(row.get("product_url", "")),  # ✅ product link
                "description": str(row.get("description", ""))[:500],
                "material": str(row.get("material", "")),
                "color": str(row.get("color", "")),
                "country_of_origin": str(row.get("country_of_origin", "")),
                "manufacturer": str(row.get("manufacturer", "")),
                "package_dimensions": str(row.get("package_dimensions", "")),
            }

            vectors.append((str(row["uniq_id"]), embeddings[i], meta))

        # Upload in batches
        for i in range(0, len(vectors), 100):
            self.index.upsert(vectors=vectors[i : i + 100])

        print(f"Upserted {len(vectors)} products.")

    # ✅ SEARCH FUNCTION
    def search(
        self,
        query: str,
        top_k: int = 6,
        filter_dict: Optional[dict] = None,
    ) -> List[dict]:
        vec = self.embed_text(query)
        kwargs = dict(vector=vec, top_k=top_k, include_metadata=True)

        if filter_dict:
            kwargs["filter"] = filter_dict

        results = self.index.query(**kwargs)

        return [
            {
                "id": m["id"],
                "score": round(float(m["score"]), 4),
                "metadata": m.get("metadata", {}),
            }
            for m in results.get("matches", [])
        ]