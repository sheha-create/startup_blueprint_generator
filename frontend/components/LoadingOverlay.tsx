'use client';

import React, { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Analyzing your idea…',             icon: '🧠' },
  { label: 'Extracting sector & intent…',      icon: '🔍' },
  { label: 'Searching knowledge base…',        icon: '📚' },
  { label: 'Building Business Model Canvas…',  icon: '📊' },
  { label: 'Generating strategy & budget…',    icon: '💡' },
  { label: 'Finalizing blueprint…',            icon: '✨' },
];

interface Props {
  step: number;
  idea: string;
}

export default function LoadingOverlay({ step, idea }: Props) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  const progress = Math.min(Math.round((step / (STEPS.length - 1)) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-sidebar-DEFAULT rounded-3xl border border-sidebar-border overflow-hidden shadow-elevated">

          {/* Gradient top bar */}
          <div className="h-1 bg-brand-gradient" />

          <div className="p-8">
            {/* Animated icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl shadow-brand-md animate-pulse-glow">
                {STEPS[Math.min(step, STEPS.length - 1)].icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display text-xl font-bold text-white text-center mb-1">
              Building Blueprint{dots}
            </h3>
            <p className="text-sm text-slate-400 text-center mb-6 line-clamp-1">
              "{idea.length > 50 ? idea.slice(0, 50) + '…' : idea}"
            </p>

            {/* Progress bar */}
            <div className="progress-bar-track mb-3">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs text-slate-400">
                {STEPS[Math.min(step, STEPS.length - 1)].label}
              </span>
              <span className="text-xs font-semibold text-brand-400">{progress}%</span>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`step-dot transition-all duration-300 ${
                    i < step  ? 'done'   :
                    i === step ? 'active' : ''
                  } ${i === step ? 'w-6 rounded-full' : ''}`}
                />
              ))}
            </div>

            {/* Step list */}
            <div className="mt-6 space-y-2">
              {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    i < step ? 'bg-emerald-500' : 'bg-brand-500'
                  }`}>
                    {i < step ? (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs ${i < step ? 'text-slate-400 line-through' : 'text-white font-medium'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
