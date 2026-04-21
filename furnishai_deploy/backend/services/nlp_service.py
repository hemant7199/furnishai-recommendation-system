"""
nlp_service.py
TF-IDF + KMeans clustering — NO spacy dependency.
Uses sklearn's built-in English stop words and simple regex preprocessing.
Works on any Python version including 3.14.
"""
import re
import pandas as pd
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity


def _preprocess(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    text = re.sub(r"[^a-z0-9\s]", " ", str(text).lower())
    return re.sub(r"\s+", " ", text).strip()


class NLPService:
    def __init__(self, n_clusters: int = 12):
        self.n_clusters = n_clusters
        # stop_words="english" uses sklearn's built-in list — no spacy needed
        self.vectorizer = TfidfVectorizer(
            max_features=3000,
            stop_words="english",
            ngram_range=(1, 2),
            preprocessor=_preprocess,
        )
        self.kmeans = None
        self.tfidf_matrix = None
        self.df = None

    def fit(self, df: pd.DataFrame) -> pd.DataFrame:
        self.df = df.copy()
        # leaf_category doubled to increase its TF-IDF weight
        corpus = (
            df["title"].fillna("") + " " +
            df["description"].fillna("") + " " +
            df["leaf_category"].fillna("") + " " +
            df["leaf_category"].fillna("")
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.df["cluster"] = self.kmeans.fit_predict(self.tfidf_matrix)
        return self.df

    def find_similar(self, query: str, top_n: int = 6) -> pd.DataFrame:
        if self.tfidf_matrix is None or self.df is None:
            return pd.DataFrame()
        qvec = self.vectorizer.transform([_preprocess(query)])
        sims = cosine_similarity(qvec, self.tfidf_matrix).flatten()
        idxs = sims.argsort()[::-1][:top_n]
        result = self.df.iloc[idxs].copy()
        result["nlp_score"] = sims[idxs]
        return result

    def extract_keywords(self, text: str, top_n: int = 5) -> List[str]:
        if self.tfidf_matrix is None:
            return []
        vec = self.vectorizer.transform([_preprocess(text)])
        names = self.vectorizer.get_feature_names_out()
        scores = vec.toarray()[0]
        idxs = scores.argsort()[::-1][:top_n]
        return [names[i] for i in idxs if scores[i] > 0]
