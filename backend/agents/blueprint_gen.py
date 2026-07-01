"""
Blueprint Generator — orchestrates intent extraction, RAG retrieval,
and section-by-section generation via IBM Granite.

Sections produced:
  1. Business Model Canvas (9 blocks)
  2. Budget Estimate
  3. Go-To-Market Strategy
  4. Competitor Analysis
  5. Government Schemes
  6. Investor / Incubator Matches
  7. Legal & Compliance Checklist
"""
from __future__ import annotations

import json
from typing import Any, Dict, List

from agents.intent_extractor import extract_intent
from agents.llm_client import generate_text
from rag.retriever import retrieve_for_blueprint

# ---------------------------------------------------------------------------
# Section prompts
# ---------------------------------------------------------------------------

BMC_PROMPT = """You are a startup strategy expert. Based on the startup idea and market research below, generate a complete Business Model Canvas with all 9 blocks.

Startup Idea: {idea}
Intent Analysis: {intent}
Market Research Context:
{context}

Generate a Business Model Canvas with these exact 9 sections. Be specific, concise, and grounded in the provided context.
Format as JSON:
{{
  "customer_segments": "Who are the customers? (2-3 specific segments)",
  "value_propositions": "What unique value is delivered? (2-3 key propositions)",
  "channels": "How do we reach customers? (list key channels)",
  "customer_relationships": "Type of relationship with each customer segment",
  "revenue_streams": "How does the business make money? (specific with estimates)",
  "key_resources": "Most important assets required (physical, intellectual, human, financial)",
  "key_activities": "Most important things the company must do",
  "key_partnerships": "Key partners and suppliers needed",
  "cost_structure": "Most significant costs (fixed and variable)"
}}
Return ONLY valid JSON."""

BUDGET_PROMPT = """You are a startup financial advisor. Based on the startup idea below, provide a realistic budget estimate broken into one-time setup costs and monthly recurring costs.

Startup Idea: {idea}
Intent Analysis: {intent}
Business Stage: {stage}
Market Data:
{context}

Generate a budget estimate. Use INR values since this is India-based. Provide ranges.
Format as JSON:
{{
  "currency": "INR",
  "disclaimer": "These are estimates based on typical market rates. Actual costs may vary.",
  "one_time_costs": [
    {{"item": "cost item name", "min": 10000, "max": 50000, "notes": "brief explanation"}}
  ],
  "monthly_recurring": [
    {{"item": "cost item name", "min": 5000, "max": 20000, "notes": "brief explanation"}}
  ],
  "total_setup_min": 0,
  "total_setup_max": 0,
  "monthly_burn_min": 0,
  "monthly_burn_max": 0,
  "runway_recommendation": "Recommended months of runway to raise before launch",
  "funding_needed_min": 0,
  "funding_needed_max": 0
}}
Return ONLY valid JSON. Compute the total fields by summing the line items."""

GTM_PROMPT = """You are a go-to-market strategy expert. Create a phased GTM strategy for the startup below.

Startup Idea: {idea}
Intent Analysis: {intent}
Market Context:
{context}

Generate a Go-To-Market strategy. Format as JSON:
{{
  "target_beachhead": "The smallest, most addressable segment to win first",
  "positioning_statement": "One-sentence positioning for the target customer",
  "key_metrics": ["metric 1", "metric 2", "metric 3"],
  "phases": [
    {{
      "phase": "Phase 1: Validation",
      "duration": "0-3 months",
      "goal": "specific goal",
      "channels": ["channel 1", "channel 2"],
      "tactics": ["tactic 1", "tactic 2", "tactic 3"],
      "success_criteria": "measurable success metric"
    }},
    {{
      "phase": "Phase 2: Launch",
      "duration": "3-6 months",
      "goal": "specific goal",
      "channels": ["channel 1", "channel 2"],
      "tactics": ["tactic 1", "tactic 2", "tactic 3"],
      "success_criteria": "measurable success metric"
    }},
    {{
      "phase": "Phase 3: Growth",
      "duration": "6-18 months",
      "goal": "specific goal",
      "channels": ["channel 1", "channel 2"],
      "tactics": ["tactic 1", "tactic 2", "tactic 3"],
      "success_criteria": "measurable success metric"
    }}
  ],
  "cac_estimate": "Estimated cost to acquire one customer (INR)",
  "ltv_estimate": "Estimated lifetime value per customer (INR)"
}}
Return ONLY valid JSON."""

LEGAL_PROMPT = """You are a startup legal advisor in India. Provide a compliance checklist for the following startup.

Startup Idea: {idea}
Intent Analysis: {intent}

Generate a legal and compliance checklist. Format as JSON:
{{
  "recommended_structure": "Recommended legal entity (e.g. Private Limited Company, LLP, OPC)",
  "reason": "Why this structure fits the startup",
  "registration_steps": [
    {{"step": "step name", "authority": "registering authority", "timeline": "typical time", "cost_approx": "approximate cost in INR", "priority": "mandatory or recommended"}}
  ],
  "compliance_checklist": [
    {{"item": "compliance item", "frequency": "one-time / monthly / annual", "authority": "authority name", "notes": "brief note"}}
  ],
  "ip_recommendations": ["IP recommendation 1", "IP recommendation 2"],
  "key_risks": ["Legal risk 1", "Legal risk 2", "Legal risk 3"]
}}
Return ONLY valid JSON."""

FOLLOWUP_PROMPT = """You are a startup advisor for the following startup blueprint.

Original Startup Idea: {idea}
Blueprint Summary: {blueprint_summary}
Retrieved Context: {context}

User's follow-up question: {question}

Provide a helpful, specific, and concise answer. Ground your answer in the provided context where possible. 
If citing a scheme, competitor, or statistic, mention the source.
Format your response as plain text suitable for a chat interface."""

# ---------------------------------------------------------------------------
# Section generators
# ---------------------------------------------------------------------------

def _safe_json_parse(raw: str, fallback: Any) -> Any:
    """Parse JSON from LLM output, stripping markdown fences."""
    import re
    raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return fallback


def _format_context(docs: List[Dict[str, Any]], max_docs: int = 4) -> str:
    parts = []
    for doc in docs[:max_docs]:
        parts.append(f"[Source: {doc['meta'].get('source', doc['id'])}]\n{doc['text']}")
    return "\n\n".join(parts) if parts else "No specific context available."


def _generate_bmc(idea: str, intent: Dict, context_docs: List[Dict]) -> Dict:
    if not context_docs:
        ctx = ""
    else:
        ctx = _format_context(context_docs)
    raw = generate_text(
        BMC_PROMPT.format(idea=idea, intent=json.dumps(intent, indent=2), context=ctx),
        max_tokens=1200,
    )
    if raw == "__MOCK_MODE__":
        return _mock_bmc(idea, intent)
    return _safe_json_parse(raw, _mock_bmc(idea, intent))


def _generate_budget(idea: str, intent: Dict, context_docs: List[Dict]) -> Dict:
    ctx = _format_context(context_docs)
    raw = generate_text(
        BUDGET_PROMPT.format(
            idea=idea, intent=json.dumps(intent, indent=2),
            stage=intent.get("stage", "idea"), context=ctx
        ),
        max_tokens=1200,
    )
    if raw == "__MOCK_MODE__":
        return _mock_budget(intent)
    result = _safe_json_parse(raw, _mock_budget(intent))
    # Ensure totals are computed
    result = _compute_budget_totals(result)
    return result


def _generate_gtm(idea: str, intent: Dict, context_docs: List[Dict]) -> Dict:
    ctx = _format_context(context_docs)
    raw = generate_text(
        GTM_PROMPT.format(idea=idea, intent=json.dumps(intent, indent=2), context=ctx),
        max_tokens=1200,
    )
    if raw == "__MOCK_MODE__":
        return _mock_gtm(intent)
    return _safe_json_parse(raw, _mock_gtm(intent))


def _generate_legal(idea: str, intent: Dict) -> Dict:
    raw = generate_text(
        LEGAL_PROMPT.format(idea=idea, intent=json.dumps(intent, indent=2)),
        max_tokens=1000,
    )
    if raw == "__MOCK_MODE__":
        return _mock_legal(intent)
    return _safe_json_parse(raw, _mock_legal(intent))


def _format_competitors(docs: List[Dict]) -> List[Dict]:
    results = []
    for doc in docs:
        m = doc["meta"]
        results.append({
            "name": m.get("name", ""),
            "sector": m.get("sector", ""),
            "description": m.get("description", ""),
            "business_model": m.get("business_model", ""),
            "strengths": m.get("strengths", []),
            "weaknesses": m.get("weaknesses", []),
            "positioning_gap": "Your startup can differentiate by addressing their weaknesses.",
            "source": m.get("url", ""),
        })
    return results


def _format_schemes(docs: List[Dict]) -> List[Dict]:
    results = []
    for doc in docs:
        m = doc["meta"]
        results.append({
            "name": m.get("name", ""),
            "provider": m.get("provider", ""),
            "description": m.get("description", ""),
            "eligibility": m.get("eligibility", []),
            "funding_amount": m.get("funding_amount", ""),
            "stage": m.get("stage", []),
            "source": m.get("source", ""),
            "last_updated": m.get("last_updated", ""),
        })
    return results


def _format_investors(docs: List[Dict]) -> List[Dict]:
    results = []
    for doc in docs:
        m = doc["meta"]
        results.append({
            "name": m.get("name", ""),
            "type": m.get("type", ""),
            "focus_sectors": m.get("focus_sectors", []),
            "stages": m.get("stages", []),
            "ticket_size": m.get("ticket_size", ""),
            "description": m.get("description", ""),
            "portfolio_examples": m.get("portfolio_examples", []),
            "application": m.get("application", ""),
        })
    return results


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

def generate_blueprint(idea: str) -> Dict[str, Any]:
    """
    Full pipeline: intent → retrieval → 7-section blueprint.
    Returns a structured dict ready to be serialised as JSON.
    """
    # Step 1: Extract intent
    intent = extract_intent(idea)

    # Step 2: Retrieve relevant docs for all sections
    retrieved = retrieve_for_blueprint(idea)

    # Step 3: Generate each section
    bmc = _generate_bmc(idea, intent, retrieved.get("market_report", []))
    budget = _generate_budget(idea, intent, retrieved.get("market_report", []))
    gtm = _generate_gtm(idea, intent, retrieved.get("market_report", []))
    legal = _generate_legal(idea, intent)
    competitors = _format_competitors(retrieved.get("competitor", [])[:5])
    schemes = _format_schemes(retrieved.get("scheme", [])[:5])
    investors = _format_investors(retrieved.get("investor", [])[:5])

    return {
        "idea": idea,
        "intent": intent,
        "business_model_canvas": bmc,
        "budget_estimate": budget,
        "gtm_strategy": gtm,
        "legal_compliance": legal,
        "competitors": competitors,
        "government_schemes": schemes,
        "investors": investors,
        "sources": _collect_sources(retrieved),
    }


def generate_followup_answer(
    question: str, idea: str, blueprint: Dict[str, Any]
) -> str:
    """Answer a follow-up question in the context of the existing blueprint."""
    from rag.retriever import retrieve_followup
    docs = retrieve_followup(question, idea)
    ctx = _format_context(docs, max_docs=5)

    # Summarise blueprint for context (keep short)
    summary = (
        f"Sector: {blueprint['intent'].get('sector')}. "
        f"Business type: {blueprint['intent'].get('business_type')}. "
        f"Stage: {blueprint['intent'].get('stage')}. "
        f"Revenue model: {blueprint['intent'].get('revenue_model')}."
    )

    raw = generate_text(
        FOLLOWUP_PROMPT.format(
            idea=idea,
            blueprint_summary=summary,
            context=ctx,
            question=question,
        ),
        max_tokens=600,
        temperature=0.4,
    )

    if raw == "__MOCK_MODE__":
        return (
            f"This is a demo response for your question: '{question}'. "
            "Please set your IBM Granite API key for real AI-powered answers. "
            "Based on the retrieved context, the relevant information would be surfaced here "
            "with proper source citations."
        )
    return raw


def _collect_sources(retrieved: Dict[str, List[Dict]]) -> List[Dict[str, str]]:
    sources = []
    seen = set()
    for docs in retrieved.values():
        for doc in docs:
            src = doc["meta"].get("source") or doc["meta"].get("url", "")
            name = doc["meta"].get("name") or doc["meta"].get("title", doc["id"])
            if src and src not in seen:
                sources.append({"name": name, "url": src, "type": doc["type"]})
                seen.add(src)
    return sources


# ---------------------------------------------------------------------------
# Mock fallbacks (used in demo mode without Granite)
# ---------------------------------------------------------------------------

def _mock_bmc(idea: str, intent: Dict) -> Dict:
    sector = intent.get("sector", "Technology")
    btype = intent.get("business_type", "B2C")
    return {
        "customer_segments": f"Primary: {intent.get('target_market', 'Individual users and small businesses')}. Secondary: Enterprise clients in the {sector} space.",
        "value_propositions": f"1. AI-powered {sector} solution that saves time and reduces costs. 2. Simple, jargon-free interface accessible to first-time users. 3. Grounded, source-backed insights (not guesswork).",
        "channels": "1. Direct website/app. 2. Content marketing and SEO. 3. Social media (LinkedIn, Instagram). 4. Referral program. 5. Partnerships with incubators.",
        "customer_relationships": f"{'Self-service SaaS with in-app onboarding' if btype == 'B2C' else 'Dedicated account management + self-service portal'}. Community forum. Email support.",
        "revenue_streams": f"{'Monthly/annual subscriptions (₹499–₹2,999/month). Freemium tier to drive adoption.' if btype == 'B2C' else 'Annual contracts (₹50,000–₹5,00,000/year). Implementation fees.'}",
        "key_resources": "1. AI/ML models and RAG pipeline. 2. Curated knowledge base. 3. Engineering team. 4. Cloud infrastructure (IBM Cloud Lite). 5. Brand and community.",
        "key_activities": "1. Continuous knowledge base curation. 2. Model fine-tuning and RAG optimization. 3. User onboarding and support. 4. Partnership development.",
        "key_partnerships": "1. IBM Cloud (infrastructure). 2. DPIIT / Startup India (scheme data). 3. Incubators and accelerators. 4. Data providers for market intelligence.",
        "cost_structure": "Fixed: Engineering salaries, cloud infrastructure, SaaS tools. Variable: API usage costs, customer support, marketing spend.",
    }


def _mock_budget(intent: Dict) -> Dict:
    stage = intent.get("stage", "idea")
    btype = intent.get("business_type", "B2C")
    is_saas = "saas" in intent.get("sector", "").lower() or "technology" in intent.get("sector", "").lower()

    one_time = [
        {"item": "Company Registration (Pvt Ltd / LLP)", "min": 8000, "max": 20000, "notes": "MCA + professional fees"},
        {"item": "Brand Identity (Logo, Design System)", "min": 10000, "max": 50000, "notes": "Freelancer or design agency"},
        {"item": "Website/MVP Development", "min": 50000, "max": 300000, "notes": "Freelancer team or no-code + custom dev"},
        {"item": "Legal (TOS, Privacy Policy, IP filing)", "min": 15000, "max": 40000, "notes": "Legal professional fees"},
        {"item": "Initial Cloud Setup & DevOps", "min": 5000, "max": 20000, "notes": "IBM Cloud Lite + domain + SSL"},
    ]
    monthly = [
        {"item": "Cloud Infrastructure", "min": 0, "max": 10000, "notes": "IBM Cloud Lite free tier; scales with usage"},
        {"item": "SaaS Tooling (CRM, Analytics, Email)", "min": 3000, "max": 15000, "notes": "HubSpot, Mixpanel, Mailchimp etc."},
        {"item": "Marketing & Paid Acquisition", "min": 10000, "max": 80000, "notes": "Meta/Google Ads; starts low, scales"},
        {"item": "Content & SEO", "min": 5000, "max": 20000, "notes": "Freelance writers, tools"},
        {"item": "Founder/Team Stipend (early stage)", "min": 30000, "max": 150000, "notes": "Minimal salary during pre-revenue"},
    ]
    result = {
        "currency": "INR",
        "disclaimer": "These are indicative estimates for an early-stage startup in India. Actual costs depend on team size, location, and scope. Consult a CA for financial planning.",
        "one_time_costs": one_time,
        "monthly_recurring": monthly,
        "runway_recommendation": "12–18 months",
        "total_setup_min": 0,
        "total_setup_max": 0,
        "monthly_burn_min": 0,
        "monthly_burn_max": 0,
        "funding_needed_min": 0,
        "funding_needed_max": 0,
    }
    return _compute_budget_totals(result)


def _compute_budget_totals(budget: Dict) -> Dict:
    """Calculate totals from line items."""
    ot_min = sum(i.get("min", 0) for i in budget.get("one_time_costs", []))
    ot_max = sum(i.get("max", 0) for i in budget.get("one_time_costs", []))
    mr_min = sum(i.get("min", 0) for i in budget.get("monthly_recurring", []))
    mr_max = sum(i.get("max", 0) for i in budget.get("monthly_recurring", []))
    months = 12  # default runway
    budget["total_setup_min"] = ot_min
    budget["total_setup_max"] = ot_max
    budget["monthly_burn_min"] = mr_min
    budget["monthly_burn_max"] = mr_max
    budget["funding_needed_min"] = ot_min + mr_min * months
    budget["funding_needed_max"] = ot_max + mr_max * months
    return budget


def _mock_gtm(intent: Dict) -> Dict:
    return {
        "target_beachhead": f"Early-adopter {intent.get('target_market', 'users')} in Tier-1 Indian cities (Bengaluru, Mumbai, Delhi NCR) who are already solving this problem manually.",
        "positioning_statement": f"For {intent.get('target_market', 'modern professionals')} who need {intent.get('problem_statement', 'a better solution')}, our platform delivers {intent.get('unique_value_proposition', 'unmatched efficiency')} — unlike alternatives that lack India-specific grounding.",
        "key_metrics": ["Customer Acquisition Cost (CAC)", "Monthly Active Users (MAU)", "Month-over-Month Revenue Growth", "Net Promoter Score (NPS)", "Churn Rate"],
        "phases": [
            {
                "phase": "Phase 1: Validation",
                "duration": "0–3 months",
                "goal": "Validate product-market fit with 50–100 paying users",
                "channels": ["Personal network", "LinkedIn organic", "Startup communities (YourStory, IndiaHacks)"],
                "tactics": ["Offer free beta to 20 design partners", "Weekly user interviews", "Build in public on LinkedIn/Twitter", "Join relevant WhatsApp/Slack communities"],
                "success_criteria": "10 paying users and NPS > 40 within 90 days",
            },
            {
                "phase": "Phase 2: Launch",
                "duration": "3–6 months",
                "goal": "Reach INR 1L MRR and 200 active users",
                "channels": ["SEO/content marketing", "ProductHunt launch", "Performance marketing (Meta/Google)", "Partnerships with incubators"],
                "tactics": ["Launch on ProductHunt", "Publish 2 SEO articles/week targeting founder keywords", "Set up retargeting campaigns", "Partner with 2–3 incubators for free access deals"],
                "success_criteria": "INR 1,00,000 MRR, CAC < INR 2,000",
            },
            {
                "phase": "Phase 3: Growth",
                "duration": "6–18 months",
                "goal": "Reach INR 10L MRR and explore Series A readiness",
                "channels": ["Inbound SEO (20+ articles indexed)", "Referral program", "Enterprise sales (outbound)", "Ecosystem partnerships"],
                "tactics": ["Launch referral program (1 month free for both parties)", "Build enterprise pipeline via LinkedIn Sales Navigator", "Attend/sponsor startup events", "Apply for government recognition (DPIIT)"],
                "success_criteria": "INR 10,00,000 MRR, LTV:CAC > 3x, < 5% monthly churn",
            },
        ],
        "cac_estimate": "INR 800 – INR 3,000 (B2C SaaS)",
        "ltv_estimate": "INR 8,000 – INR 36,000 (based on 12–18 month avg. retention)",
    }


def _mock_legal(intent: Dict) -> Dict:
    return {
        "recommended_structure": "Private Limited Company (Pvt Ltd)",
        "reason": "Best for raising institutional funding, provides limited liability, enables ESOP issuance, and is required for DPIIT recognition under Startup India.",
        "registration_steps": [
            {"step": "Obtain DSC (Digital Signature Certificate)", "authority": "MCA-certified agencies", "timeline": "1–2 days", "cost_approx": "₹1,500–₹2,000", "priority": "mandatory"},
            {"step": "Apply for DIN (Director Identification Number)", "authority": "Ministry of Corporate Affairs (MCA21)", "timeline": "1–3 days", "cost_approx": "₹500", "priority": "mandatory"},
            {"step": "Company Name Reservation (RUN / SPICe+)", "authority": "MCA21 Portal", "timeline": "2–5 days", "cost_approx": "₹1,000", "priority": "mandatory"},
            {"step": "Incorporation via SPICe+ Form", "authority": "MCA21 Portal", "timeline": "5–10 days", "cost_approx": "₹5,000–₹15,000 (govt + professional fees)", "priority": "mandatory"},
            {"step": "PAN & TAN Application", "authority": "NSDL / Income Tax Dept", "timeline": "5–7 days", "cost_approx": "₹200", "priority": "mandatory"},
            {"step": "GST Registration", "authority": "GST Portal", "timeline": "5–7 days", "cost_approx": "Free", "priority": "mandatory if turnover > ₹20L or selling online"},
            {"step": "DPIIT Startup Recognition", "authority": "Startup India Portal", "timeline": "3–7 days", "cost_approx": "Free", "priority": "strongly recommended"},
            {"step": "MSME / Udyam Registration", "authority": "Udyam Portal", "timeline": "1 day", "cost_approx": "Free", "priority": "recommended"},
        ],
        "compliance_checklist": [
            {"item": "File Annual ROC Returns (AOC-4, MGT-7)", "frequency": "annual", "authority": "MCA", "notes": "Within 60 days of AGM"},
            {"item": "File Income Tax Return (ITR-6)", "frequency": "annual", "authority": "Income Tax Dept", "notes": "Due September 30"},
            {"item": "Advance Tax Payment", "frequency": "quarterly", "authority": "Income Tax Dept", "notes": "If tax liability > ₹10,000/year"},
            {"item": "GST Returns (GSTR-1, GSTR-3B)", "frequency": "monthly/quarterly", "authority": "GST Portal", "notes": "Monthly for turnover > ₹5 crore; else quarterly"},
            {"item": "TDS Deduction & Filing", "frequency": "monthly + quarterly", "authority": "Income Tax Dept", "notes": "Applicable if paying salaries, rent, contractor fees > threshold"},
            {"item": "PF & ESIC (if >10 employees)", "frequency": "monthly", "authority": "EPFO / ESIC", "notes": "Mandatory once employee count threshold is crossed"},
        ],
        "ip_recommendations": [
            "Trademark your brand name and logo on the IP India portal (₹4,500 per class for startups)",
            "File a provisional patent if your technology is novel (cost: ₹1,750 for natural persons + attorney fees)",
            "Use strong confidentiality agreements (NDA) with early employees, contractors, and design partners",
        ],
        "key_risks": [
            "Operating without GST registration when liable can attract penalties of 10–100% of tax due",
            "Delayed ROC filings attract per-day late fees; directors can be disqualified for persistent defaults",
            "Not securing IP early can result in loss of rights if a co-founder or employee claims ownership later",
        ],
    }
