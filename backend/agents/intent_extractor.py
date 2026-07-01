"""
Intent extractor — uses IBM Granite (or mock) to parse structured metadata
from a free-text startup idea description.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any, Dict

from agents.llm_client import generate_text

INTENT_PROMPT = """You are a startup analyst. Analyze the following startup idea and extract structured metadata.

Startup idea: {idea}

Return ONLY a valid JSON object with these exact keys:
{{
  "sector": "Primary industry sector (e.g. SaaS, Edtech, Fintech, Healthtech, D2C, Agritech, Logistics, Manufacturing, Other)",
  "sub_sector": "More specific sub-sector if identifiable",
  "business_type": "B2B or B2C or D2C or B2B2C",
  "target_market": "Brief description of the primary customer segment",
  "stage": "idea or validation or early or growth",
  "geography": "Primary geography (e.g. India, Global, Southeast Asia)",
  "problem_statement": "One sentence describing the core problem being solved",
  "unique_value_proposition": "One sentence describing the key differentiation",
  "revenue_model": "Primary revenue model (e.g. SaaS subscription, marketplace commission, product sales, freemium, advertising)",
  "team_assumption": "solo_founder or small_team or team"
}}

Return ONLY the JSON, no explanation, no markdown code fences."""


def extract_intent(idea: str) -> Dict[str, Any]:
    """Return structured intent dict from a raw idea string."""
    prompt = INTENT_PROMPT.format(idea=idea)
    raw = generate_text(prompt, max_tokens=512)
    # Strip markdown code fences if present
    raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Attempt to extract JSON substring
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        # Fallback: return minimal intent derived from the idea text
        return _fallback_intent(idea)


def _fallback_intent(idea: str) -> Dict[str, Any]:
    idea_lower = idea.lower()
    sector = "Technology"
    for s in ["saas", "edtech", "fintech", "healthtech", "agritech", "logistics", "d2c", "e-commerce", "manufacturing"]:
        if s in idea_lower:
            sector = s.capitalize()
            break
    return {
        "sector": sector,
        "sub_sector": "",
        "business_type": "B2C",
        "target_market": "General consumers",
        "stage": "idea",
        "geography": "India",
        "problem_statement": "Addressing a gap in the market",
        "unique_value_proposition": "Innovative solution",
        "revenue_model": "Subscription",
        "team_assumption": "solo_founder",
    }
