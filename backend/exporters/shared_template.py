"""
Shared HTML template for both PDF and in-browser blueprint preview.
"""
from __future__ import annotations

from typing import Any, Dict

from jinja2 import Environment, BaseLoader

BLUEPRINT_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Startup Blueprint — {{ blueprint.idea[:60] }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; font-size: 14px; line-height: 1.7; color: #1f2328; background: #fff; }
  .container { max-width: 860px; margin: 0 auto; padding: 40px 32px; }
  .cover { text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid #e5e7eb; }
  .cover h1 { font-size: 28px; font-weight: 700; color: #0f439c; margin-bottom: 8px; }
  .cover .idea-text { font-size: 16px; color: #57606a; font-style: italic; }
  .cover .badge { display: inline-block; margin: 4px 4px 0; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  h2.section-title { font-size: 20px; font-weight: 700; color: #0f439c; margin: 36px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  h3 { font-size: 15px; font-weight: 600; color: #1e40af; margin: 16px 0 6px; }
  .card { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; }
  .card-title { font-weight: 700; font-size: 15px; color: #1f2328; margin-bottom: 8px; }
  .kv { display: flex; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .kv strong { min-width: 160px; color: #57606a; font-size: 13px; }
  .kv span { color: #1f2328; }
  ul.plain { list-style: disc; padding-left: 20px; }
  ul.plain li { margin-bottom: 4px; }
  .phase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 8px; }
  .phase-card { background: #fff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 16px; }
  .phase-card h4 { font-size: 13px; font-weight: 700; color: #1d4ed8; margin-bottom: 8px; }
  .bmc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .bmc-block { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
  .bmc-block h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #57606a; margin-bottom: 6px; }
  .bmc-block p { font-size: 13px; color: #1f2328; }
  .bmc-full { grid-column: 1 / -1; }
  .chip { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin: 2px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .chip.yellow { background: #fefce8; color: #854d0e; border-color: #fef08a; }
  .chip.blue { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
  .chip.red { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #92400e; margin-bottom: 12px; }
  .budget-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .budget-table th { background: #f7f8fa; text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #57606a; }
  .budget-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
  .budget-table tr:last-child td { border-bottom: none; }
  .total-row td { font-weight: 700; background: #eff6ff; border-top: 2px solid #bfdbfe; }
  .source-tag { font-size: 11px; color: #57606a; }
  .footer { text-align: center; margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { .container { padding: 20px; } h2.section-title { break-before: page; } }
</style>
</head>
<body>
<div class="container">

  <!-- Cover -->
  <div class="cover">
    <h1>Startup Blueprint</h1>
    <p class="idea-text">"{{ blueprint.idea }}"</p>
    <div style="margin-top:12px;">
      {% if blueprint.intent.sector %}<span class="badge">{{ blueprint.intent.sector }}</span>{% endif %}
      {% if blueprint.intent.business_type %}<span class="badge">{{ blueprint.intent.business_type }}</span>{% endif %}
      {% if blueprint.intent.stage %}<span class="badge">Stage: {{ blueprint.intent.stage }}</span>{% endif %}
      {% if blueprint.intent.geography %}<span class="badge">{{ blueprint.intent.geography }}</span>{% endif %}
    </div>
  </div>

  <!-- 1. Intent -->
  <h2 class="section-title">1. Startup Intent Analysis</h2>
  <div class="card">
    {% for k, v in [
      ("Problem Statement", blueprint.intent.problem_statement),
      ("Unique Value Proposition", blueprint.intent.unique_value_proposition),
      ("Target Market", blueprint.intent.target_market),
      ("Revenue Model", blueprint.intent.revenue_model),
      ("Business Type", blueprint.intent.business_type),
    ] %}
    {% if v %}
    <div class="kv"><strong>{{ k }}</strong><span>{{ v }}</span></div>
    {% endif %}
    {% endfor %}
  </div>

  <!-- 2. Business Model Canvas -->
  <h2 class="section-title">2. Business Model Canvas</h2>
  {% set bmc = blueprint.business_model_canvas %}
  <div class="bmc-grid">
    <div class="bmc-block bmc-full">
      <h4>Value Propositions</h4>
      <p>{{ bmc.value_propositions }}</p>
    </div>
    <div class="bmc-block">
      <h4>Customer Segments</h4>
      <p>{{ bmc.customer_segments }}</p>
    </div>
    <div class="bmc-block">
      <h4>Channels</h4>
      <p>{{ bmc.channels }}</p>
    </div>
    <div class="bmc-block">
      <h4>Customer Relationships</h4>
      <p>{{ bmc.customer_relationships }}</p>
    </div>
    <div class="bmc-block">
      <h4>Revenue Streams</h4>
      <p>{{ bmc.revenue_streams }}</p>
    </div>
    <div class="bmc-block">
      <h4>Key Resources</h4>
      <p>{{ bmc.key_resources }}</p>
    </div>
    <div class="bmc-block">
      <h4>Key Activities</h4>
      <p>{{ bmc.key_activities }}</p>
    </div>
    <div class="bmc-block">
      <h4>Key Partnerships</h4>
      <p>{{ bmc.key_partnerships }}</p>
    </div>
    <div class="bmc-block bmc-full">
      <h4>Cost Structure</h4>
      <p>{{ bmc.cost_structure }}</p>
    </div>
  </div>

  <!-- 3. Budget -->
  <h2 class="section-title">3. Budget Estimate</h2>
  {% set budget = blueprint.budget_estimate %}
  <div class="disclaimer">⚠ {{ budget.disclaimer }}</div>
  <h3>One-Time Setup Costs</h3>
  <table class="budget-table">
    <thead><tr><th>Item</th><th>Min (₹)</th><th>Max (₹)</th><th>Notes</th></tr></thead>
    <tbody>
    {% for item in budget.one_time_costs %}
    <tr><td>{{ item.item }}</td><td>{{ "{:,}".format(item.min) }}</td><td>{{ "{:,}".format(item.max) }}</td><td>{{ item.notes }}</td></tr>
    {% endfor %}
    <tr class="total-row"><td>TOTAL</td><td>{{ "{:,}".format(budget.total_setup_min) }}</td><td>{{ "{:,}".format(budget.total_setup_max) }}</td><td></td></tr>
    </tbody>
  </table>
  <h3 style="margin-top:16px;">Monthly Recurring Costs</h3>
  <table class="budget-table">
    <thead><tr><th>Item</th><th>Min/mo (₹)</th><th>Max/mo (₹)</th><th>Notes</th></tr></thead>
    <tbody>
    {% for item in budget.monthly_recurring %}
    <tr><td>{{ item.item }}</td><td>{{ "{:,}".format(item.min) }}</td><td>{{ "{:,}".format(item.max) }}</td><td>{{ item.notes }}</td></tr>
    {% endfor %}
    <tr class="total-row"><td>MONTHLY BURN</td><td>{{ "{:,}".format(budget.monthly_burn_min) }}</td><td>{{ "{:,}".format(budget.monthly_burn_max) }}</td><td></td></tr>
    </tbody>
  </table>
  <div class="card" style="margin-top:12px;">
    <div class="kv"><strong>Runway Recommendation</strong><span>{{ budget.runway_recommendation }}</span></div>
    <div class="kv"><strong>Estimated Funding Needed (12 months)</strong><span>₹{{ "{:,}".format(budget.funding_needed_min) }} – ₹{{ "{:,}".format(budget.funding_needed_max) }}</span></div>
  </div>

  <!-- 4. GTM -->
  <h2 class="section-title">4. Go-To-Market Strategy</h2>
  {% set gtm = blueprint.gtm_strategy %}
  <div class="card">
    <div class="kv"><strong>Beachhead Market</strong><span>{{ gtm.target_beachhead }}</span></div>
    <div class="kv"><strong>Positioning</strong><span>{{ gtm.positioning_statement }}</span></div>
    <div class="kv"><strong>CAC Estimate</strong><span>{{ gtm.cac_estimate }}</span></div>
    <div class="kv"><strong>LTV Estimate</strong><span>{{ gtm.ltv_estimate }}</span></div>
  </div>
  <div class="phase-grid">
  {% for phase in gtm.phases %}
    <div class="phase-card">
      <h4>{{ phase.phase }}</h4>
      <div class="kv"><strong>Duration</strong><span>{{ phase.duration }}</span></div>
      <div class="kv"><strong>Goal</strong><span>{{ phase.goal }}</span></div>
      <strong style="font-size:12px;color:#57606a;">Channels</strong>
      <ul class="plain" style="font-size:12px;margin-bottom:6px;">{% for c in phase.channels %}<li>{{ c }}</li>{% endfor %}</ul>
      <strong style="font-size:12px;color:#57606a;">Tactics</strong>
      <ul class="plain" style="font-size:12px;margin-bottom:6px;">{% for t in phase.tactics %}<li>{{ t }}</li>{% endfor %}</ul>
      <div style="font-size:12px;"><strong>✓ Success:</strong> {{ phase.success_criteria }}</div>
    </div>
  {% endfor %}
  </div>

  <!-- 5. Competitors -->
  <h2 class="section-title">5. Competitor Analysis</h2>
  {% for comp in blueprint.competitors %}
  <div class="card">
    <div class="card-title">{{ comp.name }} <span class="chip blue">{{ comp.sector }}</span></div>
    <p style="font-size:13px;color:#57606a;margin-bottom:8px;">{{ comp.description }}</p>
    <div class="kv"><strong>Business Model</strong><span>{{ comp.business_model }}</span></div>
    <div style="margin-top:8px;">
      <strong style="font-size:12px;color:#166534;">✓ Strengths</strong>
      <ul class="plain" style="font-size:12px;">{% for s in comp.strengths %}<li>{{ s }}</li>{% endfor %}</ul>
    </div>
    <div style="margin-top:6px;">
      <strong style="font-size:12px;color:#991b1b;">✗ Weaknesses</strong>
      <ul class="plain" style="font-size:12px;">{% for w in comp.weaknesses %}<li>{{ w }}</li>{% endfor %}</ul>
    </div>
    <div class="kv" style="margin-top:8px;"><strong>Differentiation Opportunity</strong><span>{{ comp.positioning_gap }}</span></div>
    {% if comp.source %}<div class="source-tag">Source: {{ comp.source }}</div>{% endif %}
  </div>
  {% endfor %}

  <!-- 6. Government Schemes -->
  <h2 class="section-title">6. Applicable Government Schemes</h2>
  {% for scheme in blueprint.government_schemes %}
  <div class="card">
    <div class="card-title">{{ scheme.name }}</div>
    <div class="kv"><strong>Provider</strong><span>{{ scheme.provider }}</span></div>
    <p style="font-size:13px;margin:6px 0 8px;">{{ scheme.description }}</p>
    <div class="kv"><strong>Funding</strong><span style="font-weight:600;color:#166534;">{{ scheme.funding_amount }}</span></div>
    <div class="kv"><strong>Stage</strong><span>{% for s in scheme.stage %}<span class="chip">{{ s }}</span>{% endfor %}</span></div>
    <strong style="font-size:12px;color:#57606a;">Eligibility:</strong>
    <ul class="plain" style="font-size:12px;margin-top:4px;">{% for e in scheme.eligibility %}<li>{{ e }}</li>{% endfor %}</ul>
    {% if scheme.source %}<div class="source-tag" style="margin-top:6px;">Source: {{ scheme.source }} {% if scheme.last_updated %}| Last updated: {{ scheme.last_updated }}{% endif %}</div>{% endif %}
  </div>
  {% endfor %}

  <!-- 7. Investors -->
  <h2 class="section-title">7. Investor & Incubator Matches</h2>
  {% for inv in blueprint.investors %}
  <div class="card">
    <div class="card-title">{{ inv.name }} <span class="chip yellow">{{ inv.type }}</span></div>
    <div class="kv"><strong>Ticket Size</strong><span style="font-weight:600;">{{ inv.ticket_size }}</span></div>
    <div class="kv"><strong>Stages</strong><span>{{ inv.stages | join(", ") }}</span></div>
    <div class="kv"><strong>Focus Sectors</strong><span>{{ inv.focus_sectors[:5] | join(", ") }}</span></div>
    <p style="font-size:13px;margin:6px 0;">{{ inv.description }}</p>
    {% if inv.application %}<div><a href="{{ inv.application }}" style="color:#3b82d4;font-size:12px;">Apply / Learn More →</a></div>{% endif %}
  </div>
  {% endfor %}

  <!-- 8. Legal & Compliance -->
  <h2 class="section-title">8. Legal & Compliance Checklist</h2>
  {% set legal = blueprint.legal_compliance %}
  <div class="card">
    <div class="kv"><strong>Recommended Structure</strong><span style="font-weight:700;">{{ legal.recommended_structure }}</span></div>
    <div class="kv"><strong>Why</strong><span>{{ legal.reason }}</span></div>
  </div>
  <h3>Registration Steps</h3>
  {% for step in legal.registration_steps %}
  <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f3f4f6;">
    <span class="chip {% if step.priority == 'mandatory' %}red{% else %}yellow{% endif %}">{{ step.priority }}</span>
    <div>
      <strong>{{ step.step }}</strong><br>
      <span style="font-size:12px;color:#57606a;">{{ step.authority }} | {{ step.timeline }} | {{ step.cost_approx }}</span>
    </div>
  </div>
  {% endfor %}
  <h3 style="margin-top:16px;">IP Recommendations</h3>
  <ul class="plain">{% for ip in legal.ip_recommendations %}<li>{{ ip }}</li>{% endfor %}</ul>
  <h3 style="margin-top:12px;">Key Legal Risks</h3>
  <ul class="plain">{% for r in legal.key_risks %}<li>⚠ {{ r }}</li>{% endfor %}</ul>

  <!-- Sources -->
  {% if blueprint.sources %}
  <h2 class="section-title">Sources & References</h2>
  <ul class="plain">
    {% for src in blueprint.sources %}
    <li><strong>{{ src.name }}</strong> ({{ src.type }}){% if src.url %} — <a href="{{ src.url }}" style="color:#3b82d4;">{{ src.url }}</a>{% endif %}</li>
    {% endfor %}
  </ul>
  {% endif %}

  <div class="footer">
    Generated by Startup Blueprint Generator &nbsp;|&nbsp; Powered by IBM Granite + IBM Watson x.ai &nbsp;|&nbsp; Data grounded in verified knowledge base
  </div>
</div>
</body>
</html>"""


def render_html(blueprint: Dict[str, Any]) -> str:
    env = Environment(loader=BaseLoader())
    tmpl = env.from_string(BLUEPRINT_HTML)
    return tmpl.render(blueprint=_DotDict(blueprint))


class _DotDict:
    """Recursively wraps a dict so Jinja2 dot-access works."""
    def __init__(self, data):
        self._data = data

    def __getattr__(self, key):
        val = self._data.get(key, "")
        if isinstance(val, dict):
            return _DotDict(val)
        if isinstance(val, list):
            return [_DotDict(i) if isinstance(i, dict) else i for i in val]
        return val

    def __iter__(self):
        return iter(self._data)

    def __getitem__(self, key):
        return self._data[key]

    def get(self, key, default=None):
        return self._data.get(key, default)

    def __bool__(self):
        return bool(self._data)
