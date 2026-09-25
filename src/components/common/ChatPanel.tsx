import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, X } from "lucide-react";
import type { CopilotResponse } from "../../services/api";
import { useMotion } from "../../design/panel";

interface Message {
  role: "user" | "assistant";
  text: string;
  mode?: string;
  confidence?: number;
  error?: boolean;
}

/** Renders **bold** and "- " / "• " bullet lines from plain-text answers without injecting HTML. */
function RichText({ text }: { text: string }) {
  const inline = (line: string, key: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${key}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={`${key}-${i}`}>{part}</span>
      ),
    );
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc pl-4 space-y-1 my-1.5 marker:text-text-3">
          {bullets.map((b, i) => (
            <li key={i}>{inline(b, `b${out.length}-${i}`)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  lines.forEach((l, i) => {
    const m = l.match(/^\s*(?:[-•*]|\d+\.)\s+(.*)$/);
    if (m) bullets.push(m[1]);
    else {
      flush();
      if (l.trim()) out.push(<p key={`p-${i}`} className="my-1">{inline(l, `p${i}`)}</p>);
    }
  });
  flush();
  return <>{out}</>;
}

function modeLabel(mode?: string): string | null {
  if (!mode) return null;
  const m = mode.toLowerCase();
  if (m.includes("claude") || m === "online") return "Answered by Claude";
  if (m.includes("offline")) return "Answered offline from the GeoShield dataset";
  return `Mode: ${mode}`;
}

export interface ChatPanelProps {
  title: string;
  subtitle: string;
  launcherIcon: ReactNode;
  launcherLabel: string;
  emptyPrompt: string;
  placeholder: string;
  loadSuggestions: () => Promise<string[]>;
  ask: (question: string) => Promise<CopilotResponse>;
  showConfidence?: boolean;
}

export default function ChatPanel({
  title,
  subtitle,
  launcherIcon,
  launcherLabel,
  emptyPrompt,
  placeholder,
  loadSuggestions,
  ask,
  showConfidence = false,
}: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const m = useMotion();
  const enterprise = m.panel === "enterprise";

  useEffect(() => {
    loadSuggestions().then(setSuggestions).catch(() => setSuggestions([]));
  }, [loadSuggestions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const send = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await ask(question);
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer, mode: res.mode, confidence: res.confidence }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `The backend didn't answer (${msg}). Check that the API is running and try again.`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? `Close ${title}` : launcherLabel}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-40 h-14 pl-4 pr-5 rounded-[18px] bg-ink-2 text-paper inline-flex items-center gap-2.5 font-semibold text-sm shadow-[0_14px_32px_-12px_rgba(0,0,0,0.55)] hover:bg-black"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: m.duration }}
      >
        <span className="w-8 h-8 rounded-[10px] bg-accent text-sev-high-on inline-flex items-center justify-center">
          {open ? <X size={17} /> : launcherIcon}
        </span>
        {open ? "Close" : title}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={title}
            className="e4 fixed bottom-[92px] right-6 z-40 flex flex-col overflow-hidden"
            style={{ width: `min(${enterprise ? 440 : 400}px, calc(100vw - 48px))`, height: `min(${enterprise ? 620 : 580}px, calc(100vh - 140px))` }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: m.duration + 0.06, ease: m.ease }}
          >
            <div className="px-5 pt-5 pb-4 border-b border-line">
              <p className="text-md font-semibold text-ink">{title}</p>
              <p className="text-xs text-text-3 mt-0.5">{subtitle}</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div>
                  <p className="text-sm text-text-2 mb-3">{emptyPrompt}</p>
                  <div className="space-y-2">
                    {suggestions === null &&
                      Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-[12px]" />)}
                    {suggestions?.slice(0, 5).map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="block w-full text-left text-sm text-ink bg-paper/80 hover:bg-paper rounded-[12px] px-3.5 py-2.5 shadow-[var(--shadow-e3)] interactive hover:-translate-y-px"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-ink-2 text-paper px-3.5 py-2.5 text-sm">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="max-w-[95%]">
                    <div
                      className={`text-sm leading-relaxed ${msg.error ? "text-sev-critical-text" : "text-text-2"}`}
                    >
                      <RichText text={msg.text} />
                    </div>
                    {!msg.error && (modeLabel(msg.mode) || (showConfidence && msg.confidence !== undefined)) && (
                      <p className="text-2xs text-text-3 mt-1.5">
                        {modeLabel(msg.mode)}
                        {showConfidence && msg.confidence !== undefined && (
                          <> · keyword match <span className="num">{Math.round(msg.confidence * (msg.confidence <= 1 ? 100 : 1))}%</span></>
                        )}
                      </p>
                    )}
                  </div>
                ),
              )}

              {loading && (
                <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-text-3"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-line">
              <div className="field items-end py-1.5 pr-1.5">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={placeholder}
                  className="resize-none max-h-28 py-1.5"
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="w-8 h-8 rounded-[10px] bg-ink-2 text-paper inline-flex items-center justify-center shrink-0 interactive disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
