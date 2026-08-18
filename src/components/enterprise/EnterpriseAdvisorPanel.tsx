import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Briefcase } from "lucide-react";
import { askCopilotWithRole, fetchCopilotSuggestionsWithRole } from "../../services/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  mode?: string;
}

export default function EnterpriseAdvisorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCopilotSuggestionsWithRole("executive").then(setSuggestions).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askCopilotWithRole(question, false, "executive"); // force_offline: false -> real Claude
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer, mode: res.mode }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
        style={{ boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)" }}
      >
        {isOpen ? <X size={24} /> : <Briefcase size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-40">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800">
            <Sparkles size={16} className="text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">AI Advisor</h3>
              <p className="text-[10px] text-slate-500">Strategic insights · powered by Claude</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">Ask a strategic question:</p>
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="block w-full text-left text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-sky-500 text-white font-medium"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 rounded-lg px-3 py-2 text-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-800">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about strategy, risk posture..."
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-slate-600"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="text-sky-400 hover:text-sky-300 disabled:opacity-30 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}