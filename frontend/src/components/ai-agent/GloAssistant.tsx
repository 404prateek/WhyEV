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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

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
      {/* 1. CIRCULAR FLOATING TRIGGER / TOGGLE BUTTON (Bottom-Right) */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50">
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen(!isOpen)}
          aria-label={isOpen ? "Close Glo AI Assistant" : "Open Glo AI Assistant"}
          className={cn(
            "group relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer transition-all border-2 overflow-visible",
            isOpen
              ? "bg-slate-900 hover:bg-slate-950 border-slate-700 shadow-slate-900/40"
              : "bg-emerald-600 hover:bg-emerald-700 border-emerald-300 shadow-emerald-600/35"
          )}
        >
          {/* Subtle Breathing Glow Pulse Ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-40 pointer-events-none" />
          )}

          {/* Toggle Icon: Close X when open, Clean Vector AI Spark when closed */}
          <div className="relative flex items-center justify-center text-white font-black drop-shadow-md overflow-hidden rounded-full w-full h-full p-1">
            {isOpen ? <X size={24} /> : <CleanAiAgentIcon size={36} className="w-full h-full object-cover rounded-full" />}
          </div>

          {/* Glo Name Tag Pill on Hover */}
          <span className="absolute right-16 px-3.5 py-1.5 rounded-full bg-slate-900 text-emerald-400 text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800">
            {isOpen ? "Close Assistant" : "Glo AI Assistant"}
          </span>
        </motion.button>
      </div>

      {/* 2. RESPONSIVE CHAT WINDOW WITH CLICK-OUTSIDE BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-end sm:items-end justify-center sm:justify-end p-2 sm:p-6 pb-24 lg:pb-24 pointer-events-none">
            {/* Click-outside backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
            />

            {/* Chat Card Window */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="pointer-events-auto w-full sm:w-[410px] h-[calc(100vh-7rem)] max-h-[540px] sm:max-h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden text-slate-900 relative z-10"
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white flex items-center justify-between shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0 overflow-hidden p-0.5">
                    <CleanAiAgentIcon size={36} className="w-full h-full object-cover rounded-xl" />
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

                {/* Prominent Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close Assistant"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>Close</span>
                  <X className="w-4 h-4 text-slate-700" />
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
