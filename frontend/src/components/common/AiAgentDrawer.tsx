'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShieldCheck, User, Minimize2 } from 'lucide-react';
import { useAiAgentStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function AiAgentDrawer() {
  const { isOpen, setOpen, messages, isThinking, sendMessage } = useAiAgentStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const quickPrompts = [
    'Am I eligible for Delhi EV Policy 2026?',
    'What is the 30-day RC deadline rule?',
    'Calculate fuel savings for 40 km daily commute',
    'Which dealers offer Wallbox installation?',
  ];

  return (
    <>
      {/* ── Floating Action Button (FAB) ── */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] h-14 px-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-emerald-300/30 cursor-pointer animate-in fade-in"
          aria-label="Open Voltu AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">Ask Voltu AI</span>
        </button>
      )}

      {/* ── Expanded Chat Panel ── */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-[9999] bg-slate-950/95 backdrop-blur-2xl border border-emerald-900/50 shadow-2xl flex flex-col transition-all duration-300 text-slate-100 overflow-hidden',
            // Mobile (<768px): Full screen takeover
            'inset-0 w-full h-full rounded-none',
            // Desktop (>=768px): Floating docked card bottom-right
            'md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[640px] md:max-w-[calc(100vw-3rem)] md:max-h-[calc(100vh-5rem)] md:rounded-3xl'
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-emerald-900/40 flex items-center justify-between bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-950">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                  Voltu — WhyEV AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold">Policy 2026 & Recommendation Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Minimize Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              const displayAgentName = !msg.agentType || msg.agentType === 'Orchestrator' ? 'Voltu AI' : `${msg.agentType} Agent`;

              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-2.5 max-w-[90%]', isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse')}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                      isAgent ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-200'
                    )}
                  >
                    {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div
                      className={cn(
                        'p-3.5 rounded-2xl text-xs leading-relaxed',
                        isAgent
                          ? 'bg-slate-900 border border-emerald-900/40 text-slate-200 rounded-tl-none shadow-md'
                          : 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-lg'
                      )}
                    >
                      {isAgent && (
                        <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {displayAgentName}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text || (isThinking ? 'Voltu is thinking…' : '')}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block px-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-900/40 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Voltu is synthesizing response…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-emerald-900/20 bg-slate-900/40 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  disabled={isThinking}
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-900/40 text-slate-300 hover:border-emerald-500 hover:text-white text-[11px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-emerald-900/40 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Voltu AI about subsidies, models, or dealers…"
              disabled={isThinking}
              className="flex-1 bg-slate-950 border border-emerald-900/50 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
