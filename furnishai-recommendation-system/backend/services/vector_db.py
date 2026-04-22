from typing import List, Optional
from pinecone import Pinecone, ServerlessSpec
from backend.config import get_settings

settings = get_settings()


class VectorDBService:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self._get_or_create_index()

    def _get_or_create_index(self):
        existing = [idx.name for idx in self.pc.list_indexes()]
        if settings.PINECONE_INDEX_NAME not in existing:
            self.pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region=settings.PINECONE_ENV
                ),
            )
        return self.pc.Index(settings.PINECONE_INDEX_NAME)

    # ✅ dummy embedding (required for Render free)
    def embed_text(self, text: str) -> List[float]:
        return [0.0] * 384

    # ✅ search
    def search(
        self,
        query: str,
        top_k: int = 6,
        filter_dict: Optional[dict] = None,
    ) -> List[dict]:

        vec = self.embed_text(query)

        kwargs = {
            "vector": vec,
            "top_k": top_k,
            "include_metadata": True,
        }

        if filter_dict:
            kwargs["filter"] = filter_dict

        results = self.index.query(**kwargs)

        return [
            {
                "id": m["id"],
                "score": float(m["score"]),
                "metadata": m.get("metadata", {}),
            }
            for m in results.get("matches", [])
        ]