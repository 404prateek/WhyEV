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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 max-h-screen bg-white/95 backdrop-blur-2xl border-l border-slate-200/90 shadow-2xl flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              WhyEV AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            </h3>
            <p className="text-[10px] text-emerald-700 font-semibold">Policy 2026 & Recommendation Engine</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
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
                  isAgent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white'
                )}
              >
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs leading-relaxed',
                    isAgent
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                      : 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-md'
                  )}
                >
                  {isAgent && msg.agentType && (
                    <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {msg.agentType} Agent
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-emerald-50/80 border border-emerald-200/90 text-slate-800 text-xs space-y-1.5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-spin" />
                <span>Computing Live Delhi 2026 Policy Data...</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="text-[11px] text-slate-600 font-medium ml-1">Analyzing database...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 hover:border-emerald-300 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about EV models, subsidies, or dealers..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
