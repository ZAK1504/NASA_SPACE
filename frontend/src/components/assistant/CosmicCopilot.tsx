import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, X, Send, ArrowRight, Square,
  RotateCcw, Copy, Check, Bot, Compass, Maximize2, Minimize2,
  AlertCircle, RefreshCw, BookOpen, ShieldCheck, ChevronDown
} from 'lucide-react';
import { getApiUrl } from '../../services/api';
import { getCopilotContext } from '../../services/copilotContext';

export interface CopilotAction {
  label: string;
  url: string;
}

export type ResponseSource =
  | 'groq_ai'
  | 'deterministic_navigation'
  | 'scientific_knowledge_base'
  | 'fallback'
  | 'rate_limited'
  | 'budget_exhausted'
  | 'provider_unavailable';

export interface CopilotMessage {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  actions?: CopilotAction[];
  isStreaming?: boolean;
  source?: ResponseSource;
  error?: boolean;
  promptText?: string;
}

export interface CopilotStatus {
  ai_enabled: boolean;
  model: string;
  status: string;
  circuit_open?: boolean;
  daily_requests?: number;
  daily_tokens?: number;
  token_budget?: number;
  budget_used_percent?: number;
}

const INITIAL_SUGGESTIONS = [
  "Where is Barnard's Star?",
  "Why is WISE 0855 invisible in optical light?",
  "Explain Difference Image dipole",
  "What do the 102 spectral bands detect?"
];

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'welcome-1',
    sender: 'copilot',
    text: "Hello explorer! I am your **SPHEREx Cosmic Copilot**, powered by real astronomical mission science and Groq AI. I can guide you through near-infrared observations, explain cosmic physics (proper motion, Wien's displacement law, and 102-band spectroscopy), and navigate directly to any exploration tool.",
    source: 'scientific_knowledge_base',
    actions: [
      { label: "Track moving star (Barnard's Star)", url: "/time-machine?object=barnards-star" },
      { label: "Analyze WISE 0855 Spectra", url: "/spectra?object=wise-0855" },
      { label: "Variable Light Curves (R Draconis)", url: "/light-curves?target=r-draconis" },
      { label: "Discovery Lab Point Detection", url: "/discovery-lab?object=wise-0855" },
      { label: "Interactive Sky Map (Aladin Lite)", url: "/explore" },
      { label: "Beginner Mission 01", url: "/missions/moving-star" },
    ]
  }
];

const STORAGE_KEY_MESSAGES = 'spherex_copilot_messages_v3';
const STORAGE_KEY_IS_OPEN = 'spherex_copilot_is_open_v3';
const STORAGE_KEY_IS_EXPANDED = 'spherex_copilot_is_expanded_v3';

function loadPersistedMessages(): CopilotMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: CopilotMessage) => ({ ...m, isStreaming: false }));
      }
    }
  } catch {}
  return INITIAL_MESSAGES;
}

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('spherex_copilot_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem('spherex_copilot_session', sid);
    }
    return sid;
  } catch {
    return 'sess_fallback_' + Date.now();
  }
}

function resetSessionId(): string {
  try {
    const sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem('spherex_copilot_session', sid);
    return sid;
  } catch {
    return 'sess_fallback_' + Date.now();
  }
}

function SourceBadge({ source }: { source?: ResponseSource }) {
  if (!source) return null;

  switch (source) {
    case 'groq_ai':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E1E2A] text-[#F4A272] border border-[#F4A272]/30">
          <Sparkles className="w-2.5 h-2.5 text-[#F4A272]" />
          <span>Groq AI</span>
        </span>
      );
    case 'deterministic_navigation':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E1E2A] text-cyan-400 border border-cyan-500/30">
          <Compass className="w-2.5 h-2.5" />
          <span>Navigation</span>
        </span>
      );
    case 'scientific_knowledge_base':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E1E2A] text-amber-400 border border-amber-500/30">
          <BookOpen className="w-2.5 h-2.5" />
          <span>Scientific Guide</span>
        </span>
      );
    case 'rate_limited':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2A1E1E] text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-2.5 h-2.5" />
          <span>Rate Limit</span>
        </span>
      );
    case 'budget_exhausted':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2A1E1E] text-amber-300 border border-amber-500/30">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>Quota Limit</span>
        </span>
      );
    case 'fallback':
    case 'provider_unavailable':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E1E2A] text-[#9E9AA7] border border-[#262635]">
          <span>Offline Mode</span>
        </span>
      );
    default:
      return null;
  }
}

/**
 * Safe, robust Markdown formatter supporting headings, bold, inline code,
 * bullet lists, numbered lists, scientific units, and safe sanitized links.
 */
function FormattedContent({ text }: { text: string }) {
  const navigate = useNavigate();

  const rendered = useMemo(() => {
    if (!text) return null;

    const parseInline = (line: string): React.ReactNode[] => {
      const tokens: React.ReactNode[] = [];
      // Regex matching **bold**, `code`, and [markdown links](url)
      const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push(line.substring(lastIndex, match.index));
        }
        const matchStr = match[0];

        if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
          tokens.push(
            <strong key={match.index} className="text-[#F3EFE8] font-semibold">
              {matchStr.slice(2, -2)}
            </strong>
          );
        } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
          tokens.push(
            <code key={match.index} className="bg-[#262635] text-[#F4A272] px-1 py-0.5 rounded text-[11px] font-mono">
              {matchStr.slice(1, -1)}
            </code>
          );
        } else if (matchStr.startsWith('[') && matchStr.includes('](')) {
          const closeBracket = matchStr.indexOf('](');
          const label = matchStr.slice(1, closeBracket);
          const rawUrl = matchStr.slice(closeBracket + 2, -1).trim();

          // Sanitize URL: only allow internal paths or safe http/https
          const isSafeExternal = /^https?:\/\//i.test(rawUrl);
          const isInternal = rawUrl.startsWith('/');

          if (isInternal) {
            tokens.push(
              <button
                key={match.index}
                onClick={() => navigate(rawUrl)}
                className="text-[#F4A272] underline hover:text-[#FF7B3D] cursor-pointer inline font-medium"
              >
                {label}
              </button>
            );
          } else if (isSafeExternal) {
            tokens.push(
              <a
                key={match.index}
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4A272] underline hover:text-[#FF7B3D] inline font-medium"
              >
                {label}
              </a>
            );
          } else {
            tokens.push(label);
          }
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        tokens.push(line.substring(lastIndex));
      }
      return tokens;
    };

    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map((para, pIdx) => {
      const trimmedPara = para.trim();
      if (!trimmedPara) return null;

      // Heading 3 or 4
      if (trimmedPara.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="text-sm font-bold text-[#F3EFE8] mt-2 mb-1 text-amber-300">
            {parseInline(trimmedPara.slice(4))}
          </h4>
        );
      }
      if (trimmedPara.startsWith('## ')) {
        return (
          <h3 key={pIdx} className="text-sm font-extrabold text-[#F3EFE8] mt-2.5 mb-1.5 text-amber-200">
            {parseInline(trimmedPara.slice(3))}
          </h3>
        );
      }

      const lines = para.split('\n').filter(Boolean);
      const isBulletList = lines.every((l) => /^\s*[-*]\s+/.test(l));
      const isNumList = lines.every((l) => /^\s*\d+\.\s+/.test(l));

      if (isBulletList) {
        return (
          <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1.5 text-[#D1CDD8]">
            {lines.map((l, lIdx) => (
              <li key={lIdx}>
                {parseInline(l.replace(/^\s*[-*]\s+/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      if (isNumList) {
        return (
          <ol key={pIdx} className="list-decimal pl-4 space-y-1 my-1.5 text-[#D1CDD8]">
            {lines.map((l, lIdx) => (
              <li key={lIdx}>
                {parseInline(l.replace(/^\s*\d+\.\s+/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p key={pIdx} className="my-1.5 leading-relaxed text-[#D1CDD8]">
          {lines.map((l, lIdx) => (
            <React.Fragment key={lIdx}>
              {parseInline(l)}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  }, [text, navigate]);

  return <div className="space-y-1 text-[13px] sm:text-sm">{rendered}</div>;
}

export const CosmicCopilot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_IS_OPEN) === 'true';
    } catch {
      return false;
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_IS_EXPANDED) === 'true';
    } catch {
      return false;
    }
  });

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(loadPersistedMessages);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [status, setStatus] = useState<CopilotStatus | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);

  // Request-lifecycle identification to eliminate race conditions
  const activeRequestIdRef = useRef<string | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Token buffer for smooth streaming rendering (flushes every ~45ms)
  const tokenBufferRef = useRef<string[]>([]);
  const fullStreamTextRef = useRef<string>('');
  const flushTimerRef = useRef<any>(null);

  // Persist messages across routes and workspace navigation
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist open/expanded states
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_IS_OPEN, isOpen ? 'true' : 'false');
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_IS_EXPANDED, isExpanded ? 'true' : 'false');
    } catch {}
  }, [isExpanded]);

  // Fetch AI status on mount using centralized same-origin helper
  useEffect(() => {
    fetch(getApiUrl('/assistant/status'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStatus({
            ai_enabled: data.ai_enabled,
            model: data.model,
            status: data.status,
            circuit_open: data.circuit_open,
            daily_requests: data.daily_requests,
            daily_tokens: data.daily_tokens,
            token_budget: data.token_budget,
            budget_used_percent: data.budget_used_percent,
          });
        }
      })
      .catch(() => {
        setStatus({
          ai_enabled: false,
          model: 'fallback',
          status: 'fallback',
        });
      });
  }, []);

  // Track if user is scrolling up to prevent jarring forced auto-scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If within 80px of bottom, keep auto-scroll active; otherwise pause it while reading
    isAutoScrollEnabledRef.current = distanceToBottom < 80;
  };

  useEffect(() => {
    if (isOpen && isAutoScrollEnabledRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up any pending stream on unmount
  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  // Stop Generation Handler
  const handleStopGenerating = useCallback(() => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    activeRequestIdRef.current = null;
    setLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  // Clear Chat History Handler
  const handleClearChat = useCallback(() => {
    handleStopGenerating();
    resetSessionId();
    setMessages(INITIAL_MESSAGES);
    setSuggestedQuestions(INITIAL_SUGGESTIONS);
    try {
      sessionStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch {}
  }, [handleStopGenerating]);

  // Copy message text to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message with Server-Sent Events (SSE) streaming & request-lifecycle identity
  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    // Reset auto-scroll on new user action
    isAutoScrollEnabledRef.current = true;

    // Assign unique requestId for this specific generation lifecycle
    const currentRequestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    activeRequestIdRef.current = currentRequestId;

    const userMsg: CopilotMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: q,
    };

    const copilotMsgId = 'cop_' + (Date.now() + 1);
    const initialCopilotMsg: CopilotMessage = {
      id: copilotMsgId,
      sender: 'copilot',
      text: '',
      actions: [],
      isStreaming: true,
      promptText: q,
    };

    setMessages((prev) => [...prev, userMsg, initialCopilotMsg]);
    setInput('');
    setLoading(true);

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    // Assemble rich verified scientific workspace context
    const searchParams = new URLSearchParams(location.search);
    const activeCtx = getCopilotContext();

    const contextPayload = {
      ...activeCtx,
      route: location.pathname,
      target_id: activeCtx.target_id || searchParams.get('object') || searchParams.get('target') || undefined,
      band: activeCtx.band || searchParams.get('band') || undefined,
      mode: activeCtx.mode || searchParams.get('mode') || undefined,
    };

    // Prepare bounded conversation history (last 6 turns)
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    // Setup streaming token buffer
    tokenBufferRef.current = [];
    fullStreamTextRef.current = '';

    const flushBuffer = () => {
      if (activeRequestIdRef.current !== currentRequestId) return;
      if (tokenBufferRef.current.length > 0) {
        const added = tokenBufferRef.current.join('');
        tokenBufferRef.current = [];
        fullStreamTextRef.current += added;
        const snapshot = fullStreamTextRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === copilotMsgId ? { ...m, text: snapshot } : m
          )
        );
      }
      flushTimerRef.current = null;
    };

    try {
      const response = await fetch(getApiUrl('/assistant/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          session_id: getSessionId(),
          history: historyPayload,
          context: contextPayload,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        // If request was superseded or cancelled, break immediately
        if (activeRequestIdRef.current !== currentRequestId) {
          reader.cancel().catch(() => {});
          break;
        }

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(trimmed.slice(6));

              if (activeRequestIdRef.current !== currentRequestId) return;

              if (eventData.type === 'token') {
                tokenBufferRef.current.push(eventData.token || '');
                if (!flushTimerRef.current) {
                  flushTimerRef.current = setTimeout(flushBuffer, 45);
                }
              } else if (eventData.type === 'actions') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId
                      ? { ...m, actions: eventData.actions || [] }
                      : m
                  )
                );
              } else if (eventData.type === 'suggested_questions') {
                if (eventData.suggested_questions?.length) {
                  setSuggestedQuestions(eventData.suggested_questions);
                }
              } else if (eventData.type === 'fallback') {
                flushBuffer();
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId
                      ? {
                          ...m,
                          text: eventData.text || m.text,
                          actions: eventData.actions || m.actions,
                          source: eventData.source || 'fallback',
                        }
                      : m
                  )
                );
              } else if (eventData.type === 'done') {
                flushBuffer();
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId
                      ? {
                          ...m,
                          isStreaming: false,
                          source: eventData.source || 'groq_ai',
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore malformed intermediate SSE frame safely
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User intentionally stopped generation
        return;
      }

      // Explicit error handling: DO NOT silently double-bill or duplicate Groq queries!
      // Display honest recovery card with user-controlled Retry action.
      if (activeRequestIdRef.current === currentRequestId) {
        flushBuffer();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === copilotMsgId
              ? {
                  ...m,
                  text: (fullStreamTextRef.current
                    ? fullStreamTextRef.current + "\n\n*(Neural stream interrupted)*"
                    : "I encountered a connection disruption while contacting our neural stream. You can click Retry below or continue with our scientific exploration tools."
                  ),
                  source: 'provider_unavailable',
                  isStreaming: false,
                  error: true,
                  actions: [
                    { label: "Open Sky Map", url: "/explore" },
                    { label: "Time Machine", url: "/time-machine" },
                    { label: "Spectral Explorer", url: "/spectra" },
                  ],
                }
              : m
          )
        );
      }
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        flushBuffer();
        setLoading(false);
        activeAbortControllerRef.current = null;
        activeRequestIdRef.current = null;
        setMessages((prev) =>
          prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
        );
      }
    }
  };

  // Explicit Retry Handler
  const handleRetry = (promptText?: string) => {
    if (!promptText || loading) return;
    handleSendMessage(promptText);
  };

  const handleActionClick = (url: string) => {
    navigate(url);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          data-tour="cosmic-copilot"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-[#111117] hover:bg-[#181822] border border-[#F4A272]/40 text-[#F3EFE8] px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 group cursor-pointer transition-all duration-200 hover:scale-105"
          aria-label="Open Cosmic Copilot AI Guide"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A272] animate-ping absolute" />
            <Sparkles className="w-4 h-4 text-[#F4A272] relative" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#F3EFE8]">
            Cosmic Copilot
          </span>
          <span className="text-[10px] bg-[#F4A272]/15 text-[#F4A272] px-1.5 py-0.5 rounded border border-[#F4A272]/30 hidden sm:inline-block font-mono">
            {status?.ai_enabled ? 'Groq AI' : 'Guide'}
          </span>
        </button>
      )}

      {/* Copilot Drawer / Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 ${
            isExpanded ? 'w-[95vw] sm:w-[580px]' : 'w-[92vw] sm:w-[420px]'
          } bg-[#111117] border border-[#262635] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-fade-in`}
          style={{ height: isExpanded ? '620px' : '560px', maxHeight: '86vh' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#0D0D12] border-b border-[#262635] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#F4A272]/15 border border-[#F4A272]/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#F4A272]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#F3EFE8]">Cosmic Copilot</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#1E1E2A] text-[#F4A272] border border-[#F4A272]/30">
                    <span className={`w-1.5 h-1.5 rounded-full ${status?.ai_enabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {status?.ai_enabled ? 'Groq AI Active' : 'Scientific Guide'}
                  </span>
                </div>
                <div className="text-[10px] text-[#9E9AA7]">
                  Astrophysics Companion & Navigation
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Expand / Minimize Drawer Width Toggle */}
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Compact view' : 'Expand reading view'}
                className="p-1.5 text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#181822] rounded-lg transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Compact drawer' : 'Expand drawer'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#181822] rounded-lg transition-colors cursor-pointer"
                aria-label="Clear Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#181822] rounded-lg transition-colors cursor-pointer"
                aria-label="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list with CRITICAL SCROLL ISOLATION (data-lenis-prevent) */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            data-lenis-prevent
            className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain"
            style={{
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Source Badge for Assistant Messages */}
                {m.sender === 'copilot' && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <SourceBadge source={m.source} />
                  </div>
                )}

                <div
                  className={`relative group p-3.5 rounded-xl max-w-[92%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] text-black font-medium shadow-sm'
                      : m.error
                      ? 'bg-[#261818] border border-rose-500/40 text-[#F3EFE8]'
                      : 'bg-[#181822] border border-[#262635] text-[#F3EFE8]'
                  }`}
                >
                  {/* Copy response button on assistant messages */}
                  {m.sender === 'copilot' && m.text && !m.isStreaming && (
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      title="Copy response"
                      className="absolute top-2.5 right-2.5 p-1 text-[#9E9AA7] hover:text-[#F4A272] bg-[#111117]/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Copy response text"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {m.sender === 'user' ? (
                    <div className="text-[13px] sm:text-sm">{m.text}</div>
                  ) : (
                    <>
                      <FormattedContent text={m.text} />
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-3 bg-[#F4A272] ml-1 animate-pulse align-middle" />
                      )}
                    </>
                  )}

                  {/* Explicit Retry button if message had error */}
                  {m.error && m.promptText && (
                    <div className="mt-3 pt-2 border-t border-rose-500/30 flex items-center justify-between">
                      <span className="text-[11px] text-rose-300">Generation interrupted</span>
                      <button
                        onClick={() => handleRetry(m.promptText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Clickable Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act.url)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-[#262635] border border-[#F4A272]/40 text-[#F4A272] hover:bg-[#F4A272]/20 transition-all cursor-pointer font-medium hover:scale-[1.02]"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && !messages.some((m) => m.isStreaming && m.text.length > 0) && (
              <div className="flex items-center gap-2 text-xs text-[#9E9AA7] py-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F4A272] animate-spin" />
                <span>Consulting SPHEREx neural synthesis stream…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div
            data-lenis-prevent
            className="px-3 py-2 bg-[#0D0D12] border-t border-[#262635] flex gap-1.5 overflow-x-auto text-[11px] text-[#9E9AA7] whitespace-nowrap overscroll-contain"
          >
            {suggestedQuestions.map((prompt, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#181822] border border-[#262635] hover:border-[#F4A272] text-[#9E9AA7] hover:text-[#F3EFE8] transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field + Stop Generating option */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0D0D12] border-t border-[#262635] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                loading ? 'Cosmic Copilot is synthesizing…' : 'Ask anything or request a page jump…'
              }
              className="flex-1 bg-[#08080C] border border-[#262635] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#F3EFE8] placeholder:text-[#9E9AA7] focus:outline-none focus:border-[#F4A272] disabled:opacity-60"
            />

            {loading ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                title="Stop generation"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#2A1818] border border-red-500/40 text-red-300 font-medium rounded-lg hover:bg-red-500/20 transition-colors text-xs cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 sm:px-3 sm:py-2 bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] text-black font-semibold rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};
