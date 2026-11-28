import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Bot, ExternalLink, ArrowRight, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AgentActionButton, AgentTurnResponse } from '../lib/ai-agent-types';

interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  buttons?: AgentActionButton[];
}

const INITIAL_MESSAGE: ChatBubble = {
  id: 'welcome_1',
  role: 'assistant',
  text: 'Salam! I’m AV Assist. Ask in English, Urdu, or Roman Urdu for live PKR prices, boardrooms, or event setups.',
  buttons: [
    { type: 'reply', title: '10-Person Boardroom', payload: '10-person boardroom recommendation' },
    { type: 'reply', title: 'Poly X50 Price?', payload: 'Poly Studio X50 ki price kya hai?' },
    { type: 'cta_url', title: 'Browse Catalog', url: 'https://avlive.com.pk/shop' },
  ],
};

function toInternalOrExternalPath(url: string): { isInternal: boolean; target: string } {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'avlive.com.pk' || parsed.hostname === 'www.avlive.com.pk') {
      return { isInternal: true, target: `${parsed.pathname}${parsed.search}${parsed.hash}` };
    }
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return { isInternal: false, target: parsed.toString() };
    }
  } catch {
    if (url.startsWith('/')) {
      return { isInternal: true, target: url };
    }
  }
  return { isInternal: true, target: '/shop' };
}

export function AIAssist() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessageText = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    const userBubble: ChatBubble = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...messages, userBubble];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      const historyPayload = nextMessages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'customer' : 'agent',
        text: m.text,
      }));

      const res = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload.slice(0, -1),
          channel: 'web_chat',
          allowWebSearch: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as AgentTurnResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.replyText,
          buttons: data.buttons || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_err_${Date.now()}`,
          role: 'assistant',
          text: 'Our live assistant had a brief connection hiccup. You can browse hardware directly or call our Lahore engineers.',
          buttons: [
            { type: 'cta_url', title: 'Browse Hardware', url: 'https://avlive.com.pk/shop' },
            { type: 'cta_url', title: 'Request Quote', url: 'https://avlive.com.pk/programs/quote' },
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionButton = (btn: AgentActionButton) => {
    if (btn.type === 'cta_url' && btn.url) {
      const resolved = toInternalOrExternalPath(btn.url);
      if (resolved.isInternal) {
        setIsOpen(false);
        navigate(resolved.target);
      } else {
        window.location.href = resolved.target;
      }
      return;
    }
    sendMessageText(btn.payload || btn.title);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AV Assist chat"
        className={`fixed bottom-[132px] right-3 lg:bottom-6 lg:right-6 min-w-[48px] min-h-[48px] w-12 h-12 lg:w-15 lg:h-15 bg-[#00B4D8] text-[#1A2B4C] rounded-full flex items-center justify-center shadow-xl hover:bg-[#1A2B4C] hover:text-white transition-all z-50 ${isOpen ? 'scale-0 pointer-events-none' : 'scale-100'}`}
      >
        <Bot size={24} className="lg:w-7 lg:h-7" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed inset-x-3 bottom-[132px] sm:inset-x-auto sm:right-6 sm:w-[390px] lg:bottom-6 h-[68vh] max-h-[520px] lg:h-[560px] lg:max-h-none bg-white rounded-2xl shadow-2xl z-[110] flex flex-col border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1A2B4C] text-white px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#00B4D8] text-[#1A2B4C] rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={19} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">AV Assist</h3>
                  <p className="text-[11px] text-slate-300">English · اردو · Roman Urdu</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="tel:+923214256263"
                  aria-label="Call AV Live Sales"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Phone size={17} />
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AV Assist chat"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    dir="auto"
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1A2B4C] text-white rounded-tr-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'assistant' && msg.buttons && msg.buttons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                      {msg.buttons.map((btn, bIdx) => (
                        <button
                          key={`${msg.id}_btn_${bIdx}`}
                          type="button"
                          onClick={() => handleActionButton(btn)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            btn.type === 'cta_url'
                              ? 'bg-[#00B4D8] text-white hover:bg-[#0096B4]'
                              : 'bg-white text-[#1A2B4C] border border-slate-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
                          }`}
                        >
                          <span>{btn.title}</span>
                          {btn.type === 'cta_url' ? <ExternalLink size={12} /> : <ArrowRight size={12} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessageText(input);
              }}
              className="p-3 bg-white border-t border-slate-200"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="auto"
                  aria-label="Ask about products, prices, or quotes"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type in English, Urdu, or Roman Urdu..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim() || isTyping}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-[#1A2B4C] text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#00B4D8] transition-colors cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
