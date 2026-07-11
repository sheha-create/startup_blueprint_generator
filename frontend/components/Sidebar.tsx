'use client';

import React from 'react';
import { Blueprint } from '@/types/blueprint';
import {
  LayoutGrid, DollarSign, Rocket, Users, Building2,
  TrendingUp, Scale, BookOpen, Lightbulb, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'intent',      label: 'Overview',       icon: Lightbulb },
  { key: 'bmc',         label: 'Canvas',          icon: LayoutGrid },
  { key: 'budget',      label: 'Budget',          icon: DollarSign },
  { key: 'gtm',         label: 'GTM Strategy',    icon: Rocket },
  { key: 'competitors', label: 'Competitors',     icon: TrendingUp },
  { key: 'schemes',     label: 'Gov. Schemes',    icon: Building2 },
  { key: 'investors',   label: 'Investors',       icon: Users },
  { key: 'legal',       label: 'Legal',           icon: Scale },
  { key: 'sources',     label: 'Sources',         icon: BookOpen },
];

interface Props {
  blueprint: Blueprint | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ blueprint, activeTab, onTabChange }: Props) {
  return (
    <aside className="sidebar w-[220px] flex-shrink-0 flex flex-col dark-scroll overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-sm flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-base font-bold text-white tracking-tight">Blueprintr</span>
        </div>
        <p className="text-[10px] text-slate-500 ml-[42px]">AI-Powered Strategy</p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border mb-3" />

      {/* Nav label */}
      <p className="px-5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
        Blueprint Sections
      </p>

      {/* Nav items */}
      <nav className="px-3 space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          const isDisabled = !blueprint;
          return (
            <button
              key={key}
              onClick={() => blueprint && onTabChange(key)}
              disabled={isDisabled}
              className={`
                nav-item w-full text-left
                ${isActive ? 'active' : ''}
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-4 py-5 mt-auto flex-shrink-0">
        <div className="h-px bg-sidebar-border mb-4" />

        {blueprint ? (
          <div className="rounded-xl border border-sidebar-border bg-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Ready</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
              {blueprint.idea.length > 60 ? blueprint.idea.slice(0, 60) + '…' : blueprint.idea}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {blueprint.intent.sector && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/20">
                  {blueprint.intent.sector}
                </span>
              )}
              {blueprint.intent.stage && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  {blueprint.intent.stage}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-sidebar-border bg-white/5 p-3">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Generate a blueprint to unlock all sections.
            </p>
          </div>
        )}

        {/* IBM watsonx badge */}
        <div className="mt-3 rounded-xl border border-sidebar-border bg-white/5 px-3 py-2.5 flex items-center gap-2">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md bg-blue-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wide">IBM watsonx.ai</p>
            <p className="text-[9px] text-slate-500 truncate">RAG Embeddings</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 text-center mt-2">
          LLM · Groq Llama 3.3 70B
        </p>
      </div>
    </aside>
  );
}
