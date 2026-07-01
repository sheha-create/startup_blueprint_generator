"""
Embeddings — uses sentence-transformers (all-MiniLM-L6-v2) locally.
No external API needed; model is ~90 MB and cached after first download.
"""
from __future__ import annotations

import numpy as np
from typing import List

_sentence_model = None


def _get_model():
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _sentence_model


def embed_texts(texts: List[str]) -> np.ndarray:
    """Return a 2-D float32 numpy array of shape (len(texts), dim)."""
    model = _get_model()
    vectors = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return np.array(vectors, dtype=np.float32)


def embed_query(text: str) -> np.ndarray:
    """Return a 1-D float32 vector for a single query string."""
    return embed_texts([text])[0]
