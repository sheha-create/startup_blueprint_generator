"""
LLM client — Groq API (Llama 3.1 70B).
Falls back to a structured mock when GROQ_API_KEY is not set.
"""
from __future__ import annotations

import os

_groq_client = None


def _get_client():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    return _groq_client


def _use_groq() -> bool:
    return bool(os.getenv("GROQ_API_KEY", "").strip())


def generate_text(prompt: str, max_tokens: int = 1024, temperature: float = 0.3) -> str:
    """Generate text from Groq Llama 3.1 70B or fall back to mock."""
    if _use_groq():
        try:
            client = _get_client()
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:
            print(f"[llm_client] Groq generation failed ({exc}), using mock")

    return _mock_generate(prompt)


def _mock_generate(prompt: str) -> str:
    """
    Deterministic mock that returns structured placeholder text.
    Used when GROQ_API_KEY is not set (demo / CI mode).
    """
    if 'Return ONLY a valid JSON object with these exact keys' in prompt and '"sector"' in prompt:
        # Intent extraction prompt
        return """{
  "sector": "Technology",
  "sub_sector": "SaaS",
  "business_type": "B2C",
  "target_market": "Individual consumers and small businesses",
  "stage": "idea",
  "geography": "India",
  "problem_statement": "Users need an efficient solution to solve their core problem.",
  "unique_value_proposition": "AI-powered platform with superior user experience and grounded insights.",
  "revenue_model": "Freemium SaaS subscription",
  "team_assumption": "solo_founder"
}"""
    # For all other generation prompts return a signal that mock is active
    return "__MOCK_MODE__"
