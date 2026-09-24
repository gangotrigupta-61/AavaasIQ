'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  HelpCircle,
  Compass,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentUserProfile } from '@/app/actions/profile';
import {
  AssistantRole,
  ROLE_QUICK_ACTIONS,
  ROLE_SUGGESTED_QUESTIONS,
  resolveAssistantQuery,
  AssistantAction,
  QuickAction,
} from '@/lib/assistant';

export type { AssistantRole };

interface ChatMessage {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  action?: AssistantAction;
  suggestedActions?: QuickAction[];
  timestamp: string;
}

interface AavaasIQAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  role: AssistantRole;
}

export function AavaasIQAssistant({ isOpen, onClose, role: initialRole }: AavaasIQAssistantProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeRole, setActiveRole] = useState<AssistantRole>(initialRole);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authenticate user role directly from Supabase session — never trust client role alone
  useEffect(() => {
    let isMounted = true;
    async function verifyAuthoritativeRole() {
      try {
        const user = await getCurrentUserProfile();
        if (isMounted && user?.role) {
          const validatedRole = user.role as AssistantRole;
          setActiveRole(validatedRole);
        }
      } catch (err) {
        console.error('[AavaasIQAssistant] Role verification error:', err);
      }
    }

    if (isOpen) {
      verifyAuthoritativeRole();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const quickActions = ROLE_QUICK_ACTIONS[activeRole] || [];
  const suggestedQuestions = ROLE_SUGGESTED_QUESTIONS[activeRole] || [];

  const handleClose = useCallback(() => {
    setMessages([]);
    setQuery('');
    onClose();
  }, [onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll chat area
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    if (isOpen) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const handleNavigate = (href: string) => {
    router.push(href);
    handleClose();
  };

  const handleSend = useCallback((textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: trimmed,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsThinking(true);

    // Brief processing delay for fluid interactive feel
    setTimeout(() => {
      const answer = resolveAssistantQuery(trimmed, activeRole);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        from: 'assistant',
        text: answer.text,
        action: answer.action,
        suggestedActions: answer.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 220);
  }, [activeRole]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AavaasIQ Guided Product Assistant"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-[#0f141c] border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  AavaasIQ Assistant
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 capitalize">
                  <ShieldCheck className="w-3 h-3" />
                  {activeRole}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Guided society features &amp; instant navigation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Questions Pills (Sticky top strip) */}
        <div className="px-5 py-2.5 bg-neutral-50/80 dark:bg-[#131924]/80 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 shrink-0">
              <HelpCircle className="w-3 h-3" />
              Suggested:
            </span>
            {suggestedQuestions.map((sq) => (
              <button
                key={sq.question}
                onClick={() => handleSend(sq.question)}
                className="shrink-0 text-xs px-3 py-1 rounded-full bg-white dark:bg-[#1a2232] border border-neutral-200 dark:border-[#2a3547] text-neutral-700 dark:text-neutral-300 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
              >
                {sq.question}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Default Welcome View when no questions asked yet */}
          {messages.length === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Greeting Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-primary-50/70 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 rounded-2xl rounded-tl-sm p-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-2xs">
                  <p className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                    Hi! I&apos;m AavaasIQ Assistant. How can I help?
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    I can guide you through complaints, visitors, package deliveries, maintenance billing, home services, community notices, and emergencies.
                  </p>
                </div>
              </div>

              {/* Quick Action Navigation Grid */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Compass className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Quick Navigation
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.href}
                      onClick={() => handleNavigate(qa.href)}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-[#222b3d] bg-white dark:bg-[#131924] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/20 text-left transition-all group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {qa.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-snug">
                        {qa.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Common Questions
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {suggestedQuestions.slice(0, 4).map((sq) => (
                    <button
                      key={sq.question}
                      onClick={() => handleSend(sq.question)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 bg-neutral-50/60 dark:bg-[#131924] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{sq.question}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex flex-col', msg.from === 'user' ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs',
                  msg.from === 'user'
                    ? 'bg-primary-600 text-white rounded-br-xs'
                    : 'bg-neutral-100 dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-800 rounded-bl-xs'
                )}
              >
                <p>{msg.text}</p>

                {/* Primary Destination Action Button */}
                {msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-[#2a3547]">
                    <button
                      onClick={() => handleNavigate(msg.action!.href)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Fallback Suggested Action Buttons (for unknown queries) */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-[#2a3547] space-y-1.5">
                    <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                      Available Sections:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.slice(0, 4).map((sa) => (
                        <button
                          key={sa.href}
                          onClick={() => handleNavigate(sa.href)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#131924] text-neutral-700 dark:text-neutral-200 hover:border-primary-500 hover:text-primary-600 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span>{sa.label}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-neutral-100 dark:bg-[#1a2232] rounded-2xl rounded-tl-xs px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141c] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask how to use any AavaasIQ feature…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-[#2a3547] bg-neutral-50 dark:bg-[#1a2232] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
            />
            <button
              type="submit"
              disabled={!query.trim() || isThinking}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 shadow-xs"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 px-1">
            <span>Deterministic guided assistant</span>
            <span>Zero fabricated responses</span>
          </div>
        </div>
      </div>
    </>
  );
}
