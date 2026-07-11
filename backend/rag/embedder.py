"""
RAG Embeddings — Hybrid IBM watsonx.ai + local sentence-transformers.

Priority:
  1. IBM watsonx.ai  ibm/slate-125m-english-rtrvr  (if WATSONX_API_KEY is set)
  2. Local sentence-transformers  all-MiniLM-L6-v2  (automatic fallback)

IBM watsonx.ai is the official embedding engine for this project.
The local model is the zero-config fallback for demo / development.
"""
from __future__ import annotations

import os
import numpy as np
from typing import List

# Singletons
_watsonx_client = None
_sentence_model  = None


# ─── IBM watsonx.ai ────────────────────────────────────────────────────────────

def _use_watsonx() -> bool:
    """Return True when a valid IBM API key is present in the environment."""
    return bool(os.getenv("WATSONX_API_KEY", "").strip())


def _get_watsonx_client():
    """Lazy-init the IBM APIClient singleton."""
    global _watsonx_client
    if _watsonx_client is None:
        from ibm_watsonx_ai import APIClient, Credentials
        creds = Credentials(
            url=os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
            api_key=os.getenv("WATSONX_API_KEY", ""),
        )
        _watsonx_client = APIClient(creds)
        print("[embedder] IBM watsonx.ai client initialised")
    return _watsonx_client


def _embed_watsonx(texts: List[str]) -> np.ndarray:
    """
    Call ibm/slate-125m-english-rtrvr via the watsonx.ai Embeddings API.
    Returns a (len(texts), 768) float32 array.
    """
    client     = _get_watsonx_client()
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    result = client.text.embeddings.create(
        inputs=texts,
        model_id="ibm/slate-125m-english-rtrvr",
        project_id=project_id,
    )
    vectors = [r["embedding"] for r in result["results"]]
    arr = np.array(vectors, dtype=np.float32)
    # Normalise to unit-length for cosine similarity with FAISS IndexFlatIP
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms


# ─── Local sentence-transformers fallback ─────────────────────────────────────

def _get_sentence_model():
    """Lazy-init the local sentence-transformer singleton."""
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        print("[embedder] Loading local all-MiniLM-L6-v2 …")
        _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[embedder] Local embedding model ready")
    return _sentence_model


def _embed_local(texts: List[str]) -> np.ndarray:
    """Embed with local model; vectors are already unit-normalised."""
    model = _get_sentence_model()
    vectors = model.encode(
        texts,
        show_progress_bar=False,
        normalize_embeddings=True,
        batch_size=32,
    )
    return np.array(vectors, dtype=np.float32)


# ─── Public API ───────────────────────────────────────────────────────────────

def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Embed a list of strings and return a (N, dim) float32 numpy array.

    Uses IBM watsonx.ai when WATSONX_API_KEY is set, otherwise falls
    back to the local all-MiniLM-L6-v2 model automatically.
    """
    if _use_watsonx():
        try:
            arr = _embed_watsonx(texts)
            print(f"[embedder] IBM watsonx embedded {len(texts)} text(s), dim={arr.shape[1]}")
            return arr
        except Exception as exc:
            print(f"[embedder] IBM watsonx embedding failed ({exc}) — falling back to local model")

    return _embed_local(texts)


def embed_query(text: str) -> np.ndarray:
    """
    Embed a single query string and return a 1-D float32 vector.
    Used at inference time for every user query.
    """
    return embed_texts([text])[0]


def get_embedding_provider() -> str:
    """Return a human-readable label for the active embedding provider."""
    return "IBM watsonx.ai (slate-125m)" if _use_watsonx() else "Local (all-MiniLM-L6-v2)"
