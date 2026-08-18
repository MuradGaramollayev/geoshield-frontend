import { X, Check } from "lucide-react";

const PROBLEMS = [
  "Reactive alerts after the breach already happened",
  "Fragmented data across disconnected tools",
  "No visibility into which countries pose real risk",
  "Manual correlation across dozens of dashboards",
  "Generic scores with no source transparency",
];

const SOLUTIONS = [
  "72-hour predictive window before attacks materialize",
  "9 live sources unified into one risk score",
  "Real-time risk mapping across 124 countries",
  "Automated correlation with MITRE ATT&CK context",
  "Every score traceable to its exact source and evidence",
];

export default function ProblemSolution() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            The Gap
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Traditional threat intel is reactive. GeoShield isn't.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem side */}
          <div className="card-glow p-8 border-rose-500/20" style={{ borderColor: "rgba(244,63,94,0.2)" }}>
            <h3 className="text-lg font-semibold text-rose-400 mb-6 flex items-center gap-2">
              <X size={18} /> The Old Way
            </h3>
            <ul className="space-y-4">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-400">
                  <X size={15} className="text-rose-500/60 shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution side */}
          <div className="card-glow p-8" style={{ borderColor: "rgba(16,185,129,0.25)" }}>
            <h3 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-2">
              <Check size={18} /> The GeoShield Way
            </h3>
            <ul className="space-y-4">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}