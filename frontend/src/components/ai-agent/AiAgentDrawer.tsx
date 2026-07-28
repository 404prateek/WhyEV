'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShieldCheck, User } from 'lucide-react';
import { useAiAgentStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function AiAgentDrawer() {
  const { isOpen, setOpen, messages, isThinking, sendMessage } = useAiAgentStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

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
    'Which dealers in Delhi offer Wallbox installation?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-emerald-900/40 shadow-2xl flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-900/50">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              WhyEV AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            </h3>
            <p className="text-[10px] text-emerald-400 font-medium">Policy 2026 & Recommendation Engine</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
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
                    'p-3 rounded-2xl text-xs leading-relaxed',
                    isAgent
                      ? 'bg-slate-900 border border-emerald-900/40 text-slate-200 rounded-tl-none shadow-md'
                      : 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none shadow-lg'
                  )}
                >
                  {isAgent && msg.agentType && (
                    <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {msg.agentType} Agent
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-slate-900 border border-emerald-900/40 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analyzing empanelled vehicle database & policy rules...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 hover:bg-emerald-950 hover:text-emerald-300 text-slate-400 border border-slate-800 hover:border-emerald-500/40 whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-emerald-900/30 bg-slate-900/80 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about EV models, subsidies, or dealers..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
