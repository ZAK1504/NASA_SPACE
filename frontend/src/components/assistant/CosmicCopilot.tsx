import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Send, Compass, ArrowRight,
  HelpCircle, Minimize2, MessageSquare, ExternalLink
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
}

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: '1',
    sender: 'copilot',
    text: "Hello explorer! I am your SPHEREx Cosmic Copilot. I can guide you through the universe, explain astronomical concepts (like proper motion, infrared light, and difference imaging), and take you directly to any observation.",
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

export const CosmicCopilot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });

      if (!res.ok) throw new Error('Query failed');
      const data = await res.json();

      const copilotMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: data.response,
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (e) {
      const fallbackMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: "I can help you navigate to any section: Explore Sky, Time Machine, Object Explorer, Spectral Explorer, Missions, and Discovery Lab.",
        actions: [
          { label: "Object Explorer", url: "/objects" },
          { label: "Time Machine", url: "/time-machine" },
          { label: "Missions", url: "/missions" },
        ]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (url: string) => {
    navigate(url);
    // On small screens, close the copilot after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-[#151E30] hover:bg-[#1a2540] border border-[#6EA8FE]/40 text-[#E8EDF5] px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 group cursor-pointer transition-all duration-200 hover:scale-105"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6EA8FE] animate-ping absolute" />
            <Sparkles className="w-4 h-4 text-[#6EA8FE] relative" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#E8EDF5]">
            Cosmic Copilot
          </span>
          <span className="text-[10px] bg-[#6EA8FE]/10 text-[#6EA8FE] px-1.5 py-0.5 rounded border border-[#6EA8FE]/30 hidden sm:inline-block">
            Guide
          </span>
        </button>
      )}

      {/* Copilot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[92vw] sm:w-96 bg-[#151E30] border border-[#263247] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in" style={{ height: '520px', maxHeight: '82vh' }}>
          {/* Header */}
          <div className="px-4 py-3 bg-[#0d1526] border-b border-[#263247] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#6EA8FE]/10 border border-[#6EA8FE]/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#6EA8FE]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#E8EDF5]">Cosmic Copilot & Guide</div>
                <div className="text-[10px] text-[#94A3B8]">Astrophysics Assistant & Navigation</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-[#E8EDF5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#6EA8FE] text-[#0B1020] font-medium'
                      : 'bg-[#0B1020] border border-[#263247] text-[#E8EDF5]'
                  }`}
                >
                  {m.text}
                </div>

                {/* Clickable Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act.url)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded bg-[#1a2540] border border-[#6EA8FE]/30 text-[#6EA8FE] hover:bg-[#6EA8FE]/20 transition-all cursor-pointer font-medium"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] py-2">
                <Sparkles className="w-3.5 h-3.5 text-[#6EA8FE] animate-spin" />
                <span>Consulting astronomical knowledge base…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-3 py-1.5 bg-[#0d1526]/70 border-t border-[#263247] flex gap-1.5 overflow-x-auto text-[10px] text-[#94A3B8] whitespace-nowrap">
            {[
              "Where is Barnard's Star?",
              "What is WISE 0855?",
              "Explain Difference Image",
              "What is Proper Motion?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2 py-0.5 rounded bg-[#151E30] border border-[#263247] hover:border-[#6EA8FE] text-[#94A3B8] hover:text-[#E8EDF5] transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-[#0d1526] border-t border-[#263247] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request a page jump…"
              className="flex-1 bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6EA8FE]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-1.5 bg-[#6EA8FE] text-[#0B1020] rounded hover:bg-[#5a93e8] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
