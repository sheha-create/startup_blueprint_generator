'use client';

import React, { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import BlueprintPanel from '@/components/BlueprintPanel';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Blueprint, ChatMessage } from '@/types/blueprint';
import { generateBlueprint, sendFollowUp, downloadExport } from '@/lib/api';
import { FileText, Download, Sparkles, ChevronRight } from 'lucide-react';

export default function Home() {
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [blueprint, setBlueprint]   = useState<Blueprint | null>(null);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [exportFmt, setExportFmt]   = useState<'pdf'|'docx'|null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState('intent');
  const [loadStep, setLoadStep]     = useState(0);

  const pushMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  }, []);

  const handleSendIdea = useCallback(async (idea: string) => {
    pushMessage('user', idea);
    setLoading(true);
    setLoadStep(0);
    setError(null);

    // Simulate progress steps
    const stepTimers = [
      setTimeout(() => setLoadStep(1), 800),
      setTimeout(() => setLoadStep(2), 2500),
      setTimeout(() => setLoadStep(3), 5000),
      setTimeout(() => setLoadStep(4), 9000),
    ];

    try {
      const data = await generateBlueprint(idea, sessionId ?? undefined);
      stepTimers.forEach(clearTimeout);
      setLoadStep(5);
      await new Promise(r => setTimeout(r, 600));

      setSessionId(data.session_id);
      setBlueprint(data.blueprint);
      setActiveTab('intent');

      pushMessage('assistant',
        `✦ Blueprint ready! Generated a complete 8-section plan:\n\n` +
        `Sector · ${data.blueprint.intent.sector}\n` +
        `Type · ${data.blueprint.intent.business_type}\n` +
        `Stage · ${data.blueprint.intent.stage}\n\n` +
        `Explore each section in the panel → Ask me anything below.`
      );
    } catch (err: any) {
      stepTimers.forEach(clearTimeout);
      const msg = err?.response?.data?.detail || err.message || 'Unknown error';
      setError(msg);
      pushMessage('assistant', `Failed to generate blueprint: ${msg}`);
    } finally {
      setLoading(false);
      setLoadStep(0);
    }
  }, [sessionId, pushMessage]);

  const handleSendFollowUp = useCallback(async (question: string) => {
    if (!sessionId) return;
    pushMessage('user', question);
    setLoading(true);
    try {
      const answer = await sendFollowUp(sessionId, question);
      pushMessage('assistant', answer);
    } catch (err: any) {
      pushMessage('assistant', `Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId, pushMessage]);

  const handleExport = useCallback(async (format: 'pdf' | 'docx') => {
    if (!sessionId) return;
    setExporting(true);
    setExportFmt(format);
    try {
      await downloadExport(sessionId, format);
    } catch (err: any) {
      setError(`Export failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setExporting(false);
      setExportFmt(null);
    }
  }, [sessionId]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">

      {/* ── Dark Sidebar ─────────────────────────────────── */}
      <Sidebar blueprint={blueprint} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat column */}
        <div className={`
          flex flex-col flex-shrink-0 border-r border-surface-200 bg-white
          transition-all duration-500 ease-spring
          ${blueprint ? 'w-[400px]' : 'flex-1 max-w-none'}
        `}>
          {/* Chat topbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {blueprint ? 'Follow-up Chat' : 'New Blueprint'}
              </span>
            </div>
            {blueprint && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600">Live</span>
              </div>
            )}
          </div>

          <ChatPanel
            messages={messages}
            onSendIdea={handleSendIdea}
            onSendFollowUp={handleSendFollowUp}
            loading={loading && loadStep === 0}
            hasBlueprint={!!blueprint}
          />
        </div>

        {/* Blueprint panel */}
        {blueprint ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
            {/* Blueprint topbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-slate-400 hidden sm:block">Blueprint</span>
                <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />
                <span className="text-sm font-semibold text-slate-800 truncate max-w-[300px]">
                  {blueprint.idea.length > 60 ? blueprint.idea.slice(0,60)+'…' : blueprint.idea}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleExport('docx')}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-surface-200 bg-white hover:bg-surface-50 hover:border-brand-300 text-slate-600 hover:text-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {exporting && exportFmt === 'docx' ? 'Generating…' : 'Word'}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="btn-gradient flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exporting && exportFmt === 'pdf' ? 'Generating…' : 'PDF'}
                </button>
              </div>
            </div>

            <BlueprintPanel
              blueprint={blueprint}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        ) : (
          /* Empty right-panel welcome */
          <div className="flex-1 flex items-center justify-center bg-surface-50 animate-fade-in">
            <div className="text-center max-w-sm px-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-brand-md animate-pulse-glow">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-800 mb-3">
                Your blueprint appears here
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Describe your startup idea in the chat on the left and we'll generate a complete 8-section business blueprint in seconds.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {[
                  { icon: '📊', label: 'Business Model Canvas' },
                  { icon: '💰', label: 'Budget Estimate' },
                  { icon: '🚀', label: 'GTM Strategy' },
                  { icon: '⚖️', label: 'Legal Checklist' },
                  { icon: '🏆', label: 'Competitor Analysis' },
                  { icon: '🏛️', label: 'Gov. Schemes' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-surface-200 text-xs text-slate-600 font-medium shadow-sm">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && loadStep > 0 && (
        <LoadingOverlay step={loadStep} idea={messages.find(m=>m.role==='user')?.content || ''} />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className="flex items-start gap-3 bg-white border border-rose-200 rounded-2xl px-4 py-3.5 shadow-elevated max-w-sm">
            <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-rose-500 text-xs font-bold">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Something went wrong</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none flex-shrink-0 mt-0.5">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
