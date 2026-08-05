'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  User,
  ShieldCheck,
  Search,
  Zap,
  BookOpen,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiAgentStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CleanAiAgentIcon } from '@/components/common/CleanAiAgentIcon';

export function GloAssistant() {
  const pathname = usePathname();
  const { isOpen, setOpen, messages, isThinking, sendMessage } = useAiAgentStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const quickActionItems = [
    { label: 'Search Subsidies', prompt: 'Show me available EV subsidies in my state', icon: Search },
    { label: 'Find Charging', prompt: 'Find fast charging stations near me', icon: Zap },
    { label: 'Explain Policy', prompt: 'Explain Delhi EV Policy 2026 benefits', icon: BookOpen },
    { label: 'Compare EVs', prompt: 'Compare Tata Curvv EV vs MG ZS EV', icon: Scale },
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <>
      {/* 1. CIRCULAR FLOATING TRIGGER BUTTON (Bottom-Right with Clean AI Spark Icon) */}
      {!isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            aria-label="Open Glo AI Assistant"
            className="group relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-300 shadow-xl shadow-emerald-600/35 flex items-center justify-center text-white cursor-pointer transition-all overflow-visible"
          >
            {/* Subtle Breathing Glow Pulse Ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-40 pointer-events-none" />

            {/* Clean Vector AI Spark Icon */}
            <div className="relative flex items-center justify-center text-white font-black drop-shadow-md">
              <CleanAiAgentIcon size={26} />
            </div>

            {/* Glo Name Tag Pill on Hover */}
            <span className="absolute right-16 px-3.5 py-1.5 rounded-full bg-slate-900 text-emerald-400 text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800">
              Glo AI Assistant
            </span>
          </motion.button>
        </div>
      )}

      {/* 2. ROUNDED BOTTOM SHEET CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center sm:justify-end p-2 sm:p-6">
            <motion.div
              initial={{ y: '100%', opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: '100%', opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="pointer-events-auto w-full sm:w-[420px] max-h-[85vh] sm:max-h-[640px] h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden text-slate-900 relative"
            >
              {/* Sheet Header in WhyEV Brand Theme */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                    <CleanAiAgentIcon size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      Glo AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      Personal EV & Subsidy Advisor
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5 max-w-[90%]',
                        isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold p-1',
                          isAgent
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white'
                        )}
                      >
                        {isAgent ? <CleanAiAgentIcon size={16} /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div
                          className={cn(
                            'p-3.5 rounded-2xl text-xs leading-relaxed',
                            isAgent
                              ? 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs'
                              : 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-md'
                          )}
                        >
                          {isAgent && msg.agentType && (
                            <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 mb-1 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center p-1 shrink-0 text-emerald-800">
                      <CleanAiAgentIcon size={16} />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-emerald-50/80 border border-emerald-200 text-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <span className="text-[11px] text-slate-600 font-medium ml-1">Glo is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Pills */}
              <div className="p-2.5 border-t border-slate-100 bg-slate-50/80 overflow-x-auto flex gap-2 no-scrollbar shrink-0">
                {quickActionItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(item.prompt)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 hover:border-emerald-300 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Icon className="w-3 h-3 text-emerald-600" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Glo about EVs, subsidies, or charging..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
