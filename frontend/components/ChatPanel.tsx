'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/blueprint';

const EXAMPLES = [
  { emoji: '🌾', text: 'An app for Indian farmers to sell produce directly to urban consumers' },
  { emoji: '📋', text: 'A SaaS tool for small CA firms to automate GST compliance filing' },
  { emoji: '📚', text: 'An AI tutoring platform for JEE and NEET competitive exam preparation' },
  { emoji: '🚚', text: 'Last-mile logistics platform for e-commerce deliveries in tier-2 cities' },
];

interface Props {
  messages: ChatMessage[];
  onSendIdea: (idea: string) => void;
  onSendFollowUp: (question: string) => void;
  loading: boolean;
  hasBlueprint: boolean;
}

export default function ChatPanel({ messages, onSendIdea, onSendFollowUp, loading, hasBlueprint }: Props) {
  const [input, setInput] = useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    hasBlueprint ? onSendFollowUp(text) : onSendIdea(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 && (
          <EmptyState
            examples={EXAMPLES}
            onExample={(text) => { setInput(text); textareaRef.current?.focus(); }}
          />
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.timestamp} msg={msg} index={i} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 border-t border-surface-200 bg-white">
        <div className="p-3">
          {hasBlueprint && (
            <div className="flex items-center gap-1.5 px-1 pb-2">
              <Zap className="w-3 h-3 text-brand-500" />
              <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest">
                Follow-up mode
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  hasBlueprint
                    ? 'Ask anything about your blueprint…'
                    : 'Describe your startup idea in plain English…'
                }
                rows={1}
                className="w-full resize-none rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 input-ring transition-all leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '140px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
                input.trim() && !loading
                  ? 'btn-gradient shadow-brand-sm hover:shadow-brand-md'
                  : 'bg-surface-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-1.5 px-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ examples, onExample }: {
  examples: { emoji: string; text: string }[];
  onExample: (t: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] text-center px-4 animate-fade-in">
      {/* Hero icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand-md">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">AI</span>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold text-slate-800 mb-2">
        What's your startup idea?
      </h2>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-8">
        Describe it in plain English — no jargon needed. We'll build a complete business blueprint in seconds.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-8">
        {['BMC', 'Budget', 'GTM', 'Competitors', 'Gov. Schemes', 'Legal'].map(f => (
          <span key={f} className="chip chip-brand text-[10px]">{f}</span>
        ))}
      </div>

      {/* Example prompts */}
      <div className="w-full space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Try an example
        </p>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onExample(ex.text)}
            className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 transition-all group"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{ex.emoji}</span>
            <span className="text-xs text-slate-600 group-hover:text-brand-700 leading-relaxed">{ex.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Message bubble ──────────────────────────────────────────────────────── */
function MessageBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={cn('flex gap-3 animate-slide-up', isUser ? 'justify-end' : 'justify-start')}
      style={{ animationDelay: `${index * 0.03}s`, opacity: 0 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-brand-sm mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'chat-bubble-user text-white font-medium'
          : 'chat-bubble-assistant text-slate-700'
      )}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>
            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
            {i < msg.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
          U
        </div>
      )}
    </div>
  );
}

/* ─── Typing indicator ─────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-brand-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="chat-bubble-assistant px-4 py-3.5 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
