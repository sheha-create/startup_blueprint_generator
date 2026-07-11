'use client';

import React from 'react';
import { ExternalLink, TrendingUp, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Blueprint, BMC, Budget, GTM, Competitor, GovernmentScheme, Investor, Legal } from '@/types/blueprint';
import { inr } from '@/lib/utils';

interface Props {
  blueprint: Blueprint;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BlueprintPanel({ blueprint, activeTab, onTabChange }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {activeTab === 'intent'      && <IntentSection blueprint={blueprint} />}
        {activeTab === 'bmc'         && <BMCSection bmc={blueprint.business_model_canvas} />}
        {activeTab === 'budget'      && <BudgetSection budget={blueprint.budget_estimate} />}
        {activeTab === 'gtm'         && <GTMSection gtm={blueprint.gtm_strategy} />}
        {activeTab === 'competitors' && <CompetitorsSection competitors={blueprint.competitors} />}
        {activeTab === 'schemes'     && <SchemesSection schemes={blueprint.government_schemes} />}
        {activeTab === 'investors'   && <InvestorsSection investors={blueprint.investors} />}
        {activeTab === 'legal'       && <LegalSection legal={blueprint.legal_compliance} />}
        {activeTab === 'sources'     && <SourcesSection blueprint={blueprint} />}
      </div>
    </div>
  );
}

/* ─── Shared primitives ────────────────────────────────────────────────────── */

function PageHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-6 animate-slide-up" style={{ opacity: 0 }}>
      <div className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl flex-shrink-0 shadow-brand-sm">
        {icon}
      </div>
      <div>
        <h1 className="font-display text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`section-card animate-slide-up stagger ${className}`} style={{ opacity: 0 }}>{children}</div>;
}

function KVRow({ label, value, accent = false }: { label: string; value?: string; accent?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-2.5 border-b border-surface-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide min-w-[140px] pt-0.5 flex-shrink-0">{label}</span>
      <span className={`text-sm flex-1 ${accent ? 'font-semibold text-brand-600' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

function Chip({ children, variant = 'brand' }: { children: React.ReactNode; variant?: string }) {
  return <span className={`chip chip-${variant}`}>{children}</span>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ─── 1. Intent / Overview ────────────────────────────────────────────────── */
function IntentSection({ blueprint }: { blueprint: Blueprint }) {
  const { intent } = blueprint;
  const stats = [
    { label: 'Sector',        value: intent.sector,        color: 'bg-brand-50 border-brand-200 text-brand-700' },
    { label: 'Business Type', value: intent.business_type, color: 'bg-violet-50 border-violet-200 text-violet-700' },
    { label: 'Stage',         value: intent.stage,         color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Geography',     value: intent.geography,     color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  ];

  return (
    <div className="stagger">
      <PageHeader icon="💡" title="Startup Overview" subtitle="AI-extracted intent and positioning from your idea" />

      {/* Idea banner */}
      <div className="animate-slide-up mb-5 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-violet-50 p-5" style={{ opacity: 0 }}>
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2">Your Idea</p>
        <p className="text-base font-semibold text-slate-800 leading-relaxed italic">"{blueprint.idea}"</p>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(s => s.value && (
          <div key={s.label} className={`rounded-2xl border px-4 py-3.5 text-center animate-slide-up ${s.color}`} style={{ opacity: 0 }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
            <p className="text-sm font-bold capitalize">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Details card */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Extracted Intent</h3>
        <KVRow label="Problem Statement"       value={intent.problem_statement} />
        <KVRow label="Value Proposition"       value={intent.unique_value_proposition} accent />
        <KVRow label="Target Market"           value={intent.target_market} />
        <KVRow label="Revenue Model"           value={intent.revenue_model} />
        <KVRow label="Sub-Sector"              value={intent.sub_sector} />
      </SCard>

      {/* What's in your blueprint */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
        {[
          { icon: '📊', title: 'Business Model Canvas',  desc: '9 Osterwalder blocks' },
          { icon: '💰', title: 'Budget Estimate',        desc: 'Setup + monthly burn' },
          { icon: '🚀', title: 'Go-To-Market',           desc: '3-phase phased rollout' },
          { icon: '🏆', title: 'Competitor Analysis',    desc: '5 matched competitors' },
          { icon: '🏛️', title: 'Gov. Schemes',           desc: 'India grants & funds' },
          { icon: '⚖️', title: 'Legal Checklist',        desc: 'Registration & IP' },
        ].map(item => (
          <div key={item.title} className="section-card !p-4 animate-slide-up" style={{ opacity: 0 }}>
            <div className="text-xl mb-2">{item.icon}</div>
            <p className="text-xs font-bold text-slate-700 mb-0.5">{item.title}</p>
            <p className="text-[11px] text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. Business Model Canvas ────────────────────────────────────────────── */
function BMCSection({ bmc }: { bmc: BMC }) {
  const cells: { key: keyof BMC; label: string; span?: string; accent?: string }[] = [
    { key: 'value_propositions', label: 'Value Propositions', span: 'col-span-2', accent: 'from-brand-500 to-violet-500' },
    { key: 'customer_segments',  label: 'Customer Segments' },
    { key: 'channels',           label: 'Channels' },
    { key: 'customer_relationships', label: 'Customer Relationships' },
    { key: 'revenue_streams',    label: 'Revenue Streams', accent: 'from-emerald-500 to-cyan-500' },
    { key: 'key_resources',      label: 'Key Resources' },
    { key: 'key_activities',     label: 'Key Activities' },
    { key: 'key_partnerships',   label: 'Key Partnerships' },
    { key: 'cost_structure',     label: 'Cost Structure', span: 'col-span-2', accent: 'from-rose-400 to-amber-500' },
  ];

  return (
    <div>
      <PageHeader icon="📊" title="Business Model Canvas" subtitle="The 9-block Osterwalder framework grounded in market data" />
      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        {cells.map(({ key, label, span, accent }) => (
          <div key={key} className={`bmc-cell ${span || ''}`}>
            <div className="flex items-center gap-2 mb-2">
              {accent && (
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${accent} flex-shrink-0`} />
              )}
              <h4>{label}</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{bmc[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 3. Budget Estimate ─────────────────────────────────────────────────── */
function BudgetSection({ budget }: { budget: Budget }) {
  return (
    <div className="stagger">
      <PageHeader icon="💰" title="Budget Estimate" subtitle="One-time setup costs + monthly recurring spend for your startup stage" />

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Setup',   min: budget.total_setup_min,   max: budget.total_setup_max,   color: 'brand' },
          { label: 'Monthly Burn',  min: budget.monthly_burn_min,  max: budget.monthly_burn_max,  color: 'violet' },
          { label: '12-mo Funding', min: budget.funding_needed_min,max: budget.funding_needed_max,color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="stat-card animate-slide-up text-center" style={{ opacity: 0 }}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-sm font-bold text-${s.color}-600`}>{inr(s.min)}</p>
            <p className="text-[10px] text-slate-400">to {inr(s.max)}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 text-xs text-amber-700 animate-slide-up" style={{ opacity: 0 }}>
        ⚠ {budget.disclaimer}
      </div>

      {/* Setup costs */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">One-Time Setup Costs</h3>
        <div className="rounded-xl overflow-hidden border border-surface-200">
          <table className="w-full budget-table text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Item</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Min</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Max</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {budget.one_time_costs.map((item, i) => (
                <tr key={i} className="border-b border-surface-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800 font-medium">{item.item}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{inr(item.min)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{inr(item.max)}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{item.notes}</td>
                </tr>
              ))}
              <tr className="budget-total">
                <td className="px-4 py-2.5 font-bold">Total Setup</td>
                <td className="px-4 py-2.5 text-right font-bold">{inr(budget.total_setup_min)}</td>
                <td className="px-4 py-2.5 text-right font-bold">{inr(budget.total_setup_max)}</td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tbody>
          </table>
        </div>
      </SCard>

      {/* Monthly costs */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Monthly Recurring Costs</h3>
        <div className="rounded-xl overflow-hidden border border-surface-200">
          <table className="w-full budget-table text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Item</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Min/mo</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Max/mo</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {budget.monthly_recurring.map((item, i) => (
                <tr key={i} className="border-b border-surface-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800 font-medium">{item.item}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{inr(item.min)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{inr(item.max)}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{item.notes}</td>
                </tr>
              ))}
              <tr className="budget-total">
                <td className="px-4 py-2.5 font-bold">Monthly Burn</td>
                <td className="px-4 py-2.5 text-right font-bold">{inr(budget.monthly_burn_min)}</td>
                <td className="px-4 py-2.5 text-right font-bold">{inr(budget.monthly_burn_max)}</td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-slate-500">Recommended runway:</span>
          <span className="font-semibold text-sm text-brand-600">{budget.runway_recommendation}</span>
        </div>
      </SCard>
    </div>
  );
}

/* ─── 4. GTM Strategy ────────────────────────────────────────────────────── */
function GTMSection({ gtm }: { gtm: GTM }) {
  const phaseColors = [
    { border: 'border-l-brand-500',   bg: 'bg-brand-50',   text: 'text-brand-700',   dot: 'bg-brand-500' },
    { border: 'border-l-violet-500',  bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500' },
    { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="stagger">
      <PageHeader icon="🚀" title="Go-To-Market Strategy" subtitle="Phased rollout plan grounded in sector market data" />

      {/* Positioning card */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Positioning & Economics</h3>
        <KVRow label="Beachhead Market"    value={gtm.target_beachhead} />
        <KVRow label="Positioning"         value={gtm.positioning_statement} accent />
        <KVRow label="CAC Estimate"        value={gtm.cac_estimate} />
        <KVRow label="LTV Estimate"        value={gtm.ltv_estimate} />
      </SCard>

      {/* Metrics */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Success Metrics</h3>
        <div className="flex flex-wrap gap-2">
          {gtm.key_metrics?.map((m, i) => (
            <span key={i} className="chip chip-brand"><TrendingUp className="w-3 h-3" />{m}</span>
          ))}
        </div>
      </SCard>

      {/* Phases */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">Phased Rollout</h3>
      <div className="space-y-3">
        {gtm.phases?.map((phase, i) => {
          const c = phaseColors[i] || phaseColors[0];
          return (
            <div key={i} className={`phase-card border-l-4 ${c.border} animate-slide-up`} style={{ opacity: 0, animationDelay: `${i * 0.1}s` }} data-phase={`Phase ${i+1}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 text-sm">{phase.phase}</h4>
                <span className={`chip ${c.bg} ${c.text} border-0 text-[10px]`}>{phase.duration}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3"><span className="font-semibold text-slate-700">Goal:</span> {phase.goal}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wide mb-2">Channels</p>
                  <ul className="space-y-1">
                    {phase.channels?.map((ch, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />{ch}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wide mb-2">Tactics</p>
                  <ul className="space-y-1">
                    {phase.tactics?.map((t, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={`mt-3 px-3 py-2 ${c.bg} rounded-xl text-xs ${c.text} font-medium flex items-center gap-2`}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                {phase.success_criteria}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 5. Competitors ─────────────────────────────────────────────────────── */
function CompetitorsSection({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="stagger">
      <PageHeader icon="🏆" title="Competitor Analysis" subtitle="Retrieved and semantically matched from the knowledge base" />
      {competitors.map((comp, i) => (
        <SCard key={i}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">{comp.name}</h3>
              <Chip variant="brand">{comp.sector}</Chip>
            </div>
            {comp.source && (
              <a href={comp.source} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500 transition-colors p-1">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">{comp.description}</p>
          <KVRow label="Business Model" value={comp.business_model} />
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2">✓ Strengths</p>
              <ul className="space-y-1">
                {comp.strengths?.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2">✗ Weaknesses</p>
              <ul className="space-y-1">
                {comp.weaknesses?.map((w, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0 font-bold">×</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 px-3 py-2 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-700 flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span><strong>Your opportunity:</strong> {comp.positioning_gap}</span>
          </div>
        </SCard>
      ))}
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

/* ─── 6. Government Schemes ──────────────────────────────────────────────── */
function SchemesSection({ schemes }: { schemes: GovernmentScheme[] }) {
  return (
    <div className="stagger">
      <PageHeader icon="🏛️" title="Government Schemes & Grants" subtitle="Applicable Indian schemes matched to your sector and stage" />
      {schemes.map((s, i) => (
        <SCard key={i}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-slate-800 text-sm pr-3 leading-tight">{s.name}</h3>
            {s.source && (
              <a href={s.source} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500 transition-colors flex-shrink-0 p-1">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mb-2">{s.provider}</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{s.description}</p>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center gap-1.5 chip chip-emerald text-[11px] font-bold">
              💰 {s.funding_amount}
            </span>
            {s.stage?.map((st, j) => <Chip key={j} variant="amber">{st}</Chip>)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Eligibility</p>
            <BulletList items={s.eligibility || []} />
          </div>
          {s.last_updated && (
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Data last updated: {s.last_updated}
            </p>
          )}
        </SCard>
      ))}
    </div>
  );
}

/* ─── 7. Investors ───────────────────────────────────────────────────────── */
function InvestorsSection({ investors }: { investors: Investor[] }) {
  return (
    <div className="stagger">
      <PageHeader icon="💼" title="Investor & Incubator Matches" subtitle="Matched to your sector and stage — suggested targets, not warm intros" />
      {investors.map((inv, i) => (
        <SCard key={i}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">{inv.name}</h3>
              <Chip variant="violet">{inv.type}</Chip>
            </div>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex-shrink-0 ml-2 text-[12px]">
              {inv.ticket_size}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-2 mb-3">{inv.description}</p>
          <KVRow label="Stages"  value={inv.stages?.join(', ')} />
          <KVRow label="Focus"   value={inv.focus_sectors?.slice(0, 4).join(', ')} />
          {inv.portfolio_examples?.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              <span className="font-semibold">Portfolio: </span>
              {inv.portfolio_examples.slice(0, 4).join(', ')}
            </p>
          )}
          {inv.application && (
            <a
              href={inv.application}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              Apply / Learn More <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </SCard>
      ))}
    </div>
  );
}

/* ─── 8. Legal ───────────────────────────────────────────────────────────── */
function LegalSection({ legal }: { legal: Legal }) {
  return (
    <div className="stagger">
      <PageHeader icon="⚖️" title="Legal & Compliance" subtitle="Registration steps, compliance calendar, and IP guidance" />

      <SCard>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-lg flex-shrink-0">🏢</div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{legal.recommended_structure}</h3>
            <p className="text-sm text-slate-600 mt-1">{legal.reason}</p>
          </div>
        </div>
      </SCard>

      {/* Registration steps */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Registration Steps</h3>
        <div className="space-y-3">
          {legal.registration_steps?.map((step, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-surface-100 last:border-0">
              <div className={`flex-shrink-0 mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                step.priority === 'mandatory'
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {step.priority}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{step.step}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step.authority} · {step.timeline} · {step.cost_approx}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SCard>

      {/* IP */}
      <SCard>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">IP Recommendations</h3>
        <BulletList items={legal.ip_recommendations || []} />
      </SCard>

      {/* Risks */}
      <SCard>
        <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Key Legal Risks
        </h3>
        <div className="space-y-2">
          {legal.key_risks?.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-700">{r}</p>
            </div>
          ))}
        </div>
      </SCard>
    </div>
  );
}

/* ─── 9. Sources ─────────────────────────────────────────────────────────── */
function SourcesSection({ blueprint }: { blueprint: Blueprint }) {
  const typeLabel: Record<string, string> = {
    scheme: 'Gov. Scheme', competitor: 'Competitor',
    market_report: 'Market Report', investor: 'Investor',
  };
  const typeChip: Record<string, string> = {
    scheme: 'emerald', competitor: 'brand',
    market_report: 'cyan', investor: 'violet',
  };
  return (
    <div className="stagger">
      <PageHeader icon="📖" title="Sources & References" subtitle="All facts grounded in the curated knowledge base — no fabricated data" />
      <SCard>
        <p className="text-xs text-slate-500 mb-4">
          Every claim in this blueprint is traceable to one of the following verified sources. Scheme and policy data should be confirmed directly with the respective government portals before taking action.
        </p>
        <div className="space-y-2.5">
          {blueprint.sources?.map((src, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-surface-100 last:border-0">
              <Chip variant={typeChip[src.type] || 'slate'}>{typeLabel[src.type] || src.type}</Chip>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{src.name}</p>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:underline truncate block mt-0.5">
                    {src.url}
                  </a>
                )}
              </div>
              {src.url && (
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500 flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </SCard>
      <div className="text-center py-4">
        <p className="text-xs text-slate-400">
          Knowledge base last curated: Jan–Mar 2024
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Embeddings: <span className="font-semibold text-blue-500">IBM watsonx.ai</span> (slate-125m-english-rtrvr) ·
          Vector DB: FAISS · LLM: Groq Llama 3.3 70B
        </p>
      </div>
    </div>
  );
}
