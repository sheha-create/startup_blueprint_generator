"""
Quick smoke test — runs without Granite API key, tests the full pipeline
using local sentence-transformers and mock LLM output.
"""
import sys
import os

# Ensure backend is on path
sys.path.insert(0, os.path.dirname(__file__))

def test_intent_extraction():
    from agents.intent_extractor import extract_intent
    intent = extract_intent("An AI-powered app for Indian street food vendors to manage orders")
    assert isinstance(intent, dict), "Intent must be a dict"
    assert "sector" in intent
    assert "business_type" in intent
    print(f"  [PASS] Intent extraction: sector={intent['sector']}, type={intent['business_type']}")


def test_vector_store():
    from rag.vector_store import get_store
    store = get_store()
    from rag.embedder import embed_query
    vec = embed_query("SaaS startup for Indian small businesses")
    results = store.search(vec, top_k=3)
    assert len(results) > 0, "Search returned no results"
    assert "type" in results[0]
    assert "meta" in results[0]
    print(f"  [PASS] Vector store search returned {len(results)} results, top type={results[0]['type']}")


def test_retriever():
    from rag.retriever import retrieve_for_blueprint
    results = retrieve_for_blueprint("A fintech app for MSME lending in India")
    assert "scheme" in results
    assert "competitor" in results
    assert "investor" in results
    print(f"  [PASS] Retriever: schemes={len(results['scheme'])}, competitors={len(results['competitor'])}, investors={len(results['investor'])}")


def test_blueprint_generation():
    from agents.blueprint_gen import generate_blueprint
    blueprint = generate_blueprint("An edtech platform for JEE and NEET preparation targeting tier-2 cities in India")
    assert "intent" in blueprint
    assert "business_model_canvas" in blueprint
    assert "budget_estimate" in blueprint
    assert "gtm_strategy" in blueprint
    assert "competitors" in blueprint
    assert "government_schemes" in blueprint
    assert "investors" in blueprint
    assert "legal_compliance" in blueprint
    assert "sources" in blueprint

    # Verify budget totals are computed
    budget = blueprint["budget_estimate"]
    assert budget["total_setup_max"] > 0, "Budget totals not computed"
    assert budget["funding_needed_min"] > 0, "Funding needed not computed"

    print(f"  [PASS] Blueprint generation complete")
    print(f"         Sector: {blueprint['intent']['sector']}")
    print(f"         Competitors: {len(blueprint['competitors'])}")
    print(f"         Schemes: {len(blueprint['government_schemes'])}")
    print(f"         Investors: {len(blueprint['investors'])}")
    print(f"         Budget total (max): INR {blueprint['budget_estimate']['funding_needed_max']:,}")


def test_docx_export():
    from agents.blueprint_gen import generate_blueprint
    from exporters.docx_exporter import export_docx
    blueprint = generate_blueprint("A D2C skincare brand targeting millennial women in India")
    docx_bytes = export_docx(blueprint)
    assert len(docx_bytes) > 1000, "DOCX output too small"
    print(f"  [PASS] DOCX export: {len(docx_bytes):,} bytes")


def test_followup():
    from agents.blueprint_gen import generate_blueprint, generate_followup_answer
    blueprint = generate_blueprint("A logistics tech startup for last-mile delivery in rural India")
    answer = generate_followup_answer(
        question="Which government scheme is most relevant for my stage?",
        idea="A logistics tech startup for last-mile delivery in rural India",
        blueprint=blueprint,
    )
    assert isinstance(answer, str)
    assert len(answer) > 20
    print(f"  [PASS] Follow-up answer: {answer[:120]}...")


if __name__ == "__main__":
    print("\n=== Startup Blueprint Generator — Smoke Test ===\n")
    tests = [
        ("Intent Extraction", test_intent_extraction),
        ("Vector Store", test_vector_store),
        ("Retriever", test_retriever),
        ("Blueprint Generation", test_blueprint_generation),
        ("DOCX Export", test_docx_export),
        ("Follow-up Q&A", test_followup),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        print(f"Testing {name}...")
        try:
            fn()
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print(f"\n=== Results: {passed}/{len(tests)} passed, {failed} failed ===\n")
    sys.exit(0 if failed == 0 else 1)
