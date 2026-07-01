"""
High-level retriever — wraps VectorStore with named query helpers.
"""
from __future__ import annotations

from typing import Any, Dict, List

from rag.embedder import embed_query
from rag.vector_store import get_store


def retrieve_for_blueprint(idea_text: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Run retrieval for all blueprint sections in a single pass.
    Returns a dict keyed by section type with ranked docs.
    """
    store = get_store()
    query_vec = embed_query(idea_text)
    return store.search_by_types(
        query_vec,
        {
            "scheme": 5,
            "competitor": 5,
            "market_report": 3,
            "investor": 5,
        },
    )


def retrieve_followup(question: str, context_idea: str) -> List[Dict[str, Any]]:
    """Retrieve relevant docs for a follow-up question."""
    store = get_store()
    combined = f"{context_idea} {question}"
    query_vec = embed_query(combined)
    return store.search(query_vec, top_k=6)
