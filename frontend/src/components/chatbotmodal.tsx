import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldAlert,
  Building2,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, Scheme } from '../types';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewScheme: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  onViewScheme,
  onFindHospitals,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      content:
        "Namaste! 🙏 I am your **AI Healthcare Scheme Assistant**.\n\nAsk me about Indian government healthcare programs, eligibility criteria, required documents, or where to find cashless treatment near you.",
      suggested_followups: [
        'What documents are required for PM-JAY?',
        'Which schemes cover heart surgery or hospitalization?',
        'What schemes exist for pregnant women in Maharashtra?',
        'How do I find empanelled hospitals in Kolhapur?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = { sender: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.chat.send(text, sessionUuid || undefined);
      if (res.session_uuid) {
        setSessionUuid(res.session_uuid);
      }

      const asstMsg: ChatMessage = {
        sender: 'assistant',
        content: res.message,
        relevant_schemes: res.relevant_schemes,
        suggested_followups: res.suggested_followups,
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content:
            "I apologize, but I encountered a temporary connection issue. Please verify your query or explore the Scheme Directory.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[680px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  ArogyaNav AI Assistant
                </h3>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Verified Indian Healthcare Schemes & Eligibility Guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/70 flex items-center gap-2 text-[11px] text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Informational guidance only. Not medical diagnosis or official government benefit approval.
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Relevant Schemes Cards attached to message */}
                  {!isUser && msg.relevant_schemes && msg.relevant_schemes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Referenced Government Schemes:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.relevant_schemes.map((s) => (
                          <div
                            key={s.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition-colors"
                          >
                            <span className="font-bold text-xs text-slate-900 block truncate">
                              {s.name}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                              {s.coverage_amount}
                            </span>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  onViewScheme(s.slug);
                                  onClose();
                                }}
                                className="text-[11px] text-slate-700 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                onClick={() => {
                                  onFindHospitals(s.slug);
                                  onClose();
                                }}
                                className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>Hospitals</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up chips */}
                  {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggested_followups.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-medium px-3 py-1 rounded-full transition-colors text-left"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 rounded-tl-none flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-slate-600 text-xs">Analyzing scheme database and eligibility rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about schemes, eligibility, documents, hospitals..."
              className="flex-1 px-4 py-3 bg-slate-100/80 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md shadow-emerald-600/30 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
