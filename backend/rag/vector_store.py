"""
In-memory FAISS vector store.
Documents are dicts with at least {"id": str, "text": str, "meta": dict}.
The index is built once at startup from the knowledge base and reused across requests.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

import faiss
import numpy as np

from rag.embedder import embed_texts

# ---------------------------------------------------------------------------
# Knowledge-base loader helpers
# ---------------------------------------------------------------------------
KB_DIR = Path(__file__).parent.parent / "knowledge_base"


def _load_schemes() -> List[Dict[str, Any]]:
    docs = []
    for item in json.loads((KB_DIR / "schemes.json").read_text(encoding="utf-8")):
        text = (
            f"Government Scheme: {item['name']}. "
            f"Provider: {item['provider']}. "
            f"Description: {item['description']}. "
            f"Eligibility: {'; '.join(item['eligibility'])}. "
            f"Sectors: {', '.join(item['sectors'])}. "
            f"Stage: {', '.join(item['stage'])}. "
            f"Funding: {item['funding_amount']}. "
            f"Region: {item['region']}."
        )
        docs.append({"id": item["id"], "text": text, "meta": item, "type": "scheme"})
    return docs


def _load_competitors() -> List[Dict[str, Any]]:
    docs = []
    for item in json.loads((KB_DIR / "competitors.json").read_text(encoding="utf-8")):
        text = (
            f"Competitor: {item['name']}. "
            f"Sector: {item['sector']}. "
            f"Description: {item['description']}. "
            f"Business model: {item['business_model']}. "
            f"Strengths: {'; '.join(item['strengths'])}. "
            f"Weaknesses: {'; '.join(item['weaknesses'])}."
        )
        docs.append({"id": item["id"], "text": text, "meta": item, "type": "competitor"})
    return docs


def _load_market_reports() -> List[Dict[str, Any]]:
    docs = []
    for item in json.loads((KB_DIR / "market_reports.json").read_text(encoding="utf-8")):
        text = (
            f"Market Report: {item['title']}. "
            f"Sector: {item['sector']}. "
            f"Summary: {item['summary']}. "
            f"Market size: {item['market_size']}. "
            f"Growth rate: {item['growth_rate']}. "
            f"Opportunities: {'; '.join(item['opportunities'])}."
        )
        docs.append({"id": item["id"], "text": text, "meta": item, "type": "market_report"})
    return docs


def _load_investors() -> List[Dict[str, Any]]:
    docs = []
    for item in json.loads((KB_DIR / "investors.json").read_text(encoding="utf-8")):
        text = (
            f"Investor/Incubator: {item['name']}. "
            f"Type: {item['type']}. "
            f"Focus sectors: {', '.join(item['focus_sectors'])}. "
            f"Stages: {', '.join(item['stages'])}. "
            f"Ticket size: {item['ticket_size']}. "
            f"Description: {item['description']}."
        )
        docs.append({"id": item["id"], "text": text, "meta": item, "type": "investor"})
    return docs


# ---------------------------------------------------------------------------
# Vector store class
# ---------------------------------------------------------------------------
class VectorStore:
    def __init__(self):
        self._docs: List[Dict[str, Any]] = []
        self._index: faiss.IndexFlatIP | None = None

    def build(self):
        """Load all knowledge-base documents and build the FAISS index."""
        all_docs = (
            _load_schemes()
            + _load_competitors()
            + _load_market_reports()
            + _load_investors()
        )
        self._docs = all_docs
        texts = [d["text"] for d in all_docs]
        vectors = embed_texts(texts)
        dim = vectors.shape[1]
        self._index = faiss.IndexFlatIP(dim)  # cosine similarity (vectors are normalised)
        # Normalise if not already (watsonx may not normalise)
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)
        vectors = vectors / norms
        self._index.add(vectors)
        print(f"[vector_store] Index built: {len(all_docs)} documents, dim={dim}")

    def search(
        self, query_vector: np.ndarray, top_k: int = 5, doc_type: str | None = None
    ) -> List[Dict[str, Any]]:
        """Return top_k most relevant docs. Optionally filter by doc_type."""
        if self._index is None:
            raise RuntimeError("VectorStore not built. Call build() first.")
        # Normalise query
        norm = np.linalg.norm(query_vector)
        if norm > 0:
            query_vector = query_vector / norm
        query_vector = query_vector.reshape(1, -1).astype(np.float32)

        # Retrieve more if filtering to ensure we have enough after filter
        fetch_k = top_k * 4 if doc_type else top_k
        scores, indices = self._index.search(query_vector, min(fetch_k, len(self._docs)))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            doc = self._docs[idx]
            if doc_type and doc["type"] != doc_type:
                continue
            results.append({**doc, "score": float(score)})
            if len(results) >= top_k:
                break
        return results

    def search_by_types(
        self, query_vector: np.ndarray, type_top_k: Dict[str, int]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Search for multiple doc types in one call. Returns {type: [docs]}."""
        results: Dict[str, List[Dict[str, Any]]] = {}
        for doc_type, top_k in type_top_k.items():
            results[doc_type] = self.search(query_vector, top_k=top_k, doc_type=doc_type)
        return results


# Singleton instance
_store: VectorStore | None = None


def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
        _store.build()
    return _store
