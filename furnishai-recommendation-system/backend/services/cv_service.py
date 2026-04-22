"""
cv_service.py
Image classification using metadata fallback (no torch/torchvision).
Returns leaf_category from Pinecone metadata.
Full torch-based ResNet18 classification is available when running locally
after training via model_training.ipynb.
"""

FURNITURE_CATEGORIES = [
    "Doormats", "End Tables", "Ottomans", "Wall-Mounted Mirrors",
    "Barstools", "Chairs", "Towel Bars", "Home Office Desk Chairs",
    "Home Office Desks", "Bean Bags", "Sofas", "Storage", "Other",
]


class ImageClassifierService:
    def __init__(self):
        print("[CV] Running in metadata-fallback mode (torch not installed on server).")

    def classify(self, image_url: str, fallback_category: str = "") -> str:
        """
        Returns the leaf_category from product metadata.
        Full image classification requires torch — available locally via notebook.
        """
        return fallback_category.strip() or "Other"
