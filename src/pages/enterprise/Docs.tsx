import { useState } from "react";
import { Briefcase, ChevronRight } from "lucide-react";
import Docs from "../Docs";

const EXECUTIVE_FAQ = [
  {
    q: "How should I present GeoShield data to the board?",
    a: "Focus on the Global Risk Index trend, Top 10 Risk Countries, and Mean Response Time. Avoid raw indicator counts — frame findings as business risk, not technical detail.",
  },
  {
    q: "What does the Global Risk Index actually measure?",
    a: "A weighted average combining indicator frequency, severity, source corroboration, and threat trend across all monitored countries. It updates in real time from 9 live intelligence sources.",
  },
  {
    q: "How is this different from a traditional SIEM dashboard?",
    a: "GeoShield aggregates cross-source, cross-country intelligence into a single risk narrative — it's built for strategic decisions, not log triage. Operational detail lives in the Analyst Panel.",
  },
];

export default function EnterpriseDocs() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Documentation</h1>
        <p className="text-sm text-slate-500 mt-1">Guides for security leadership</p>
      </div>

      {/* Enterprise-only: Executive FAQ */}
      <div className="card-glow overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Briefcase size={15} className="text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Executive FAQ</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {EXECUTIVE_FAQ.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-200">{item.q}</span>
                <ChevronRight
                  size={15}
                  className={`text-slate-500 shrink-0 ml-3 transition-transform ${openIdx === i ? "rotate-90" : ""}`}
                />
              </button>
              {openIdx === i && (
                <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Docs />
    </div>
  );
}