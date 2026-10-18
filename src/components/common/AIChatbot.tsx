'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  X,
  Send,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronRight,
  Lightbulb,
  ExternalLink,
  BookOpen,
  ShoppingBag,
  Building2,
  BarChart3,
  Trash2,
  Boxes,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Explain ERP Flow',
  'How to create a Recipe?',
  'How does BOM auto-deduction work?',
  'How does POS billing work?',
  'How to book a Room?',
  'Where to check food waste?',
  'How to view sales reports?',
];

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `### 👑 Welcome to Diwan AI Assistant
I am your operational guide for the **Shahi Diwan Hotel & Restaurant ERP**.

I can answer questions regarding:
- 🍳 **BOM Recipe Engine** & automatic ingredient deduction
- 🛒 **POS Billing** (Dine-in, Takeaway, Room Delivery)
- 🏨 **Hotel PMS** & unified dining folio checkout
- 📦 **Inventory Receiving** & supplier stock ledger
- 🗑️ **Food Waste** & financial loss tracking

Click any suggested question below or type your query!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    'Explain ERP Flow',
    'How does BOM auto-deduction work?',
    'How to create a Recipe?',
    'How does POS billing work?',
  ],
};

export const AIChatbot: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          data.response ||
          'I was unable to retrieve an answer at this moment. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || DEFAULT_SUGGESTIONS.slice(0, 3),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Network connection interrupted. Please ensure your local server is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Explain ERP Flow', 'How to create a Recipe?'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Helper to render markdown bold, headings, and lists cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-extrabold text-amber-300 text-sm mt-2 mb-1 flex items-center gap-1.5">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={idx} className="font-bold text-amber-200 text-xs mt-1.5 mb-0.5">
                {trimmed.replace('#### ', '')}
              </h5>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="my-1.5 p-2 rounded-lg bg-amber-500/10 border-l-2 border-amber-400 text-amber-200 text-[11px] italic">
                {trimmed.replace('> ', '')}
              </div>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-slate-300">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{renderInlineBoldAndCode(content)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const numberMatch = trimmed.match(/^(\d+\.)\s/);
            const prefix = numberMatch ? numberMatch[1] : '';
            const content = trimmed.replace(/^\d+\.\s/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-slate-300">
                <span className="text-amber-400 font-mono font-bold shrink-0 text-[11px]">{prefix}</span>
                <span>{renderInlineBoldAndCode(content)}</span>
              </div>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="text-slate-200">{renderInlineBoldAndCode(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInlineBoldAndCode = (str: string) => {
    // Regex for inline bold `**text**` and inline code `` `code` ``
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-mono border border-slate-700/60">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Quick navigation shortcuts based on context
  const getContextualLinks = (content: string) => {
    const links: { label: string; path: string; icon: React.ReactNode }[] = [];
    const lower = content.toLowerCase();

    if (lower.includes('recipe') || lower.includes('bom')) {
      links.push({ label: 'Open Dish Recipes', path: '/dashboard/recipes', icon: <BookOpen className="w-3 h-3" /> });
    }
    if (lower.includes('pos') || lower.includes('billing') || lower.includes('order')) {
      links.push({ label: 'Open Order Billing', path: '/dashboard/pos', icon: <ShoppingBag className="w-3 h-3" /> });
    }
    if (lower.includes('room') || lower.includes('hotel') || lower.includes('folio')) {
      links.push({ label: 'Open Room Booking', path: '/dashboard/hotel', icon: <Building2 className="w-3 h-3" /> });
    }
    if (lower.includes('waste') || lower.includes('loss')) {
      links.push({ label: 'Open Food Waste', path: '/dashboard/stock-out', icon: <Trash2 className="w-3 h-3" /> });
    }
    if (lower.includes('inventory') || lower.includes('stock in') || lower.includes('raw material')) {
      links.push({ label: 'Open Inventory', path: '/dashboard/raw-materials', icon: <Boxes className="w-3 h-3" /> });
    }
    if (lower.includes('report') || lower.includes('revenue') || lower.includes('cogs')) {
      links.push({ label: 'Open Reports', path: '/dashboard/reports', icon: <BarChart3 className="w-3 h-3" /> });
    }

    return links.slice(0, 2);
  };

  return (
    <>
      {/* Floating Toggle Icon (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-300/40"
            title="Ask Diwan AI Assistant"
          >
            {/* Pulsing Aura Badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-slate-900" />
            </span>

            <div className="p-1 rounded-full bg-slate-950/20 text-slate-950">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-royal font-extrabold tracking-wider hidden sm:inline text-slate-950">
              Diwan AI
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 transition-all duration-300 ease-out no-print flex flex-col shadow-2xl shadow-black/80 rounded-3xl border border-amber-500/30 overflow-hidden bg-[#0c1220]/95 backdrop-blur-2xl ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[calc(100vw-2rem)] sm:w-[430px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0f172a] via-[#162038] to-[#0f172a] border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1.5px] shadow-lg shadow-amber-500/30">
                  <div className="w-full h-full bg-[#0b101d] rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f172a]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold font-royal text-white tracking-wide">
                    Diwan AI Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ERP Copilot
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Hotel & Dining Knowledge Engine</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition"
                title="Restart Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const contextualLinks = !isUser ? getContextualLinks(msg.content) : [];

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-3.5 shadow-md ${
                          isUser
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-tr-none shadow-amber-500/20 text-xs'
                            : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderFormattedText(msg.content)
                        )}

                        {/* Direct Contextual Navigation Links */}
                        {contextualLinks.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                            {contextualLinks.map((link, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  router.push(link.path);
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition hover:scale-102 cursor-pointer"
                              >
                                {link.icon}
                                <span>{link.label}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] text-slate-500 px-1">
                        {msg.timestamp}
                      </span>

                      {/* Follow-up suggestions */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSend(suggestion)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700/60 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all text-left flex items-center gap-1 cursor-pointer"
                            >
                              <Lightbulb className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span>{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-slate-400 font-mono ml-1">Analyzing ERP models...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Horizontal Carousel */}
              <div className="px-3 py-2 bg-[#090e18] border-t border-slate-800/70 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3" /> Quick:
                </span>
                {DEFAULT_SUGGESTIONS.slice(0, 4).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 shrink-0 transition whitespace-nowrap cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-[#0a0f1c] border-t border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about Shahi Diwan ERP..."
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 shadow-md shadow-amber-500/25 cursor-pointer shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
