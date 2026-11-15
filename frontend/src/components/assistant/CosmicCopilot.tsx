import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, X, Send, ArrowRight, Square,
  RotateCcw, Copy, Check, Bot, Compass
} from 'lucide-react';

interface CopilotAction {
  label: string;
  url: string;
}

interface CopilotMessage {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  actions?: CopilotAction[];
  isStreaming?: boolean;
}

interface CopilotStatus {
  ai_enabled: boolean;
  model: string;
  status: string;
}

const INITIAL_SUGGESTIONS = [
  "Where is Barnard's Star?",
  "What is WISE 0855?",
  "Explain Difference Image",
  "What is Proper Motion?"
];

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: '1',
    sender: 'copilot',
    text: "Hello explorer! I am your SPHEREx Cosmic Copilot, powered by real astronomical mission science and Groq AI. I can guide you through the universe, explain cosmic phenomena (like proper motion, infrared spectroscopy, and difference imaging), and navigate directly to any observation.",
    actions: [
      { label: "Show a moving star", url: "/time-machine?object=barnards-star" },
      { label: "Variable Light Curves (R Draconis)", url: "/light-curves?target=r-draconis" },
      { label: "Image Stacking Co-Addition", url: "/discovery-lab?object=wise-0855" },
      { label: "Coldest brown dwarf (WISE 0855)", url: "/spectra?object=wise-0855" },
      { label: "Interactive Sky Map", url: "/explore" },
      { label: "Beginner Mission 01", url: "/missions/moving-star" },
    ]
  }
];

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

/**
 * Safe, lightweight Markdown formatter that handles bold, inline code,
 * bullet lists, numbered lists, and paragraphs without dangerous HTML injection.
 */
function FormattedContent({ text }: { text: string }) {
  const rendered = useMemo(() => {
    if (!text) return null;

    const parseInline = (line: string): React.ReactNode[] => {
      // Splits on **bold** and `code`
      const tokens: React.ReactNode[] = [];
      const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
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
  }, [text]);

  return <div className="space-y-1 text-xs">{rendered}</div>;
}

export const CosmicCopilot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [status, setStatus] = useState<CopilotStatus | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);

  // Fetch AI status on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/assistant/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStatus({
            ai_enabled: data.ai_enabled,
            model: data.model,
            status: data.status,
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stop Generation Handler
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  // Clear Chat History Handler
  const handleClearChat = () => {
    if (loading) handleStopGenerating();
    resetSessionId();
    setMessages(INITIAL_MESSAGES);
    setSuggestedQuestions(INITIAL_SUGGESTIONS);
  };

  // Copy message text to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message with Server-Sent Events (SSE) streaming
  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    // Reset auto-scroll on new message
    isAutoScrollEnabledRef.current = true;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
    };

    const copilotMsgId = (Date.now() + 1).toString();
    const initialCopilotMsg: CopilotMessage = {
      id: copilotMsgId,
      sender: 'copilot',
      text: '',
      actions: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, initialCopilotMsg]);
    setInput('');
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Build context from current route and params
    const searchParams = new URLSearchParams(location.search);
    const context = {
      route: location.pathname,
      target_id: searchParams.get('object') || searchParams.get('target') || undefined,
      band: searchParams.get('band') || undefined,
      mode: searchParams.get('mode') || undefined,
    };

    // Prepare bounded history (last 6 turns)
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const response = await fetch('http://localhost:8000/api/assistant/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          session_id: getSessionId(),
          history: historyPayload,
          context: context,
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

              if (eventData.type === 'token') {
                const token = eventData.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId ? { ...m, text: m.text + token } : m
                  )
                );
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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId
                      ? {
                          ...m,
                          text: eventData.text || m.text,
                          actions: eventData.actions || m.actions,
                        }
                      : m
                  )
                );
              } else if (eventData.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === copilotMsgId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch {
              // Ignore malformed intermediate SSE frame
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Stream intentionally stopped by user
        return;
      }

      // If streaming fails (e.g. proxy issue), try synchronous query fallback
      try {
        const fallbackRes = await fetch('http://localhost:8000/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: q,
            session_id: getSessionId(),
          }),
        });

        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === copilotMsgId
                ? {
                    ...m,
                    text: fbData.response || "Here are exploration tools for your query.",
                    actions: fbData.actions || [],
                    isStreaming: false,
                  }
                : m
            )
          );
          if (fbData.suggested_questions?.length) {
            setSuggestedQuestions(fbData.suggested_questions);
          }
          return;
        }
      } catch {
        // Fallback also failed
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === copilotMsgId
            ? {
                ...m,
                text: "I am currently in deterministic guide mode. You can explore our celestial targets, inspect infrared spectra in 102 bands, or track stars in the Time Machine.",
                actions: [
                  { label: "Interactive Sky Map", url: "/explore" },
                  { label: "Time Machine", url: "/time-machine" },
                  { label: "Spectral Explorer", url: "/spectra" },
                ],
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
    }
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
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[92vw] sm:w-[410px] bg-[#111117] border border-[#262635] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
          style={{ height: '540px', maxHeight: '84vh' }}
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
            className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs overscroll-contain"
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
                <div
                  className={`relative group p-3 rounded-xl max-w-[90%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] text-black font-medium shadow-sm'
                      : 'bg-[#181822] border border-[#262635] text-[#F3EFE8]'
                  }`}
                >
                  {/* Copy response button on assistant messages */}
                  {m.sender === 'copilot' && m.text && !m.isStreaming && (
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      title="Copy response"
                      className="absolute top-2 right-2 p-1 text-[#9E9AA7] hover:text-[#F4A272] bg-[#111117]/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {m.sender === 'user' ? (
                    <div>{m.text}</div>
                  ) : (
                    <>
                      <FormattedContent text={m.text} />
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-3 bg-[#F4A272] ml-1 animate-pulse align-middle" />
                      )}
                    </>
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
            className="px-3 py-2 bg-[#0D0D12] border-t border-[#262635] flex gap-1.5 overflow-x-auto text-[10px] text-[#9E9AA7] whitespace-nowrap overscroll-contain"
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
                loading ? 'Cosmic Copilot is thinking…' : 'Ask anything or request a page jump…'
              }
              className="flex-1 bg-[#08080C] border border-[#262635] rounded-lg px-3 py-2 text-xs text-[#F3EFE8] placeholder:text-[#9E9AA7] focus:outline-none focus:border-[#F4A272] disabled:opacity-60"
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
                className="p-2 bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] text-black font-semibold rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 cursor-pointer"
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
