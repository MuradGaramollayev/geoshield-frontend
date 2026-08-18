import { Link } from "react-router-dom";
import { Shield, Briefcase, ArrowRight, Check } from "lucide-react";

const ANALYST_FEATURES = [
  "IOC Explorer with live IP reputation",
  "MITRE ATT&CK technique mapping",
  "Incident Kanban board",
  "One-click firewall rule generation",
  "Operational AI Copilot",
];

const ENTERPRISE_FEATURES = [
  "Executive risk dashboards",
  "Advanced analytics (heatmap, radar, flow)",
  "Board-ready PDF reports",
  "Team management",
  "Strategic AI Advisor",
];

export default function TwoProducts() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            Built For Every Role
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            One platform, two experiences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analyst */}
          <div className="card-glow p-8 flex flex-col" style={{ borderColor: "rgba(16,185,129,0.25)" }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
              <Shield size={22} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Analyst Panel</h3>
            <p className="text-sm text-slate-400 mb-6">
              Built for SOC analysts, managers, and researchers who need deep operational
              tooling for day-to-day threat hunting and response.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {ANALYST_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm py-3 rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              Start as Analyst <ArrowRight size={15} />
            </Link>
          </div>

          {/* Enterprise */}
          <div className="card-glow p-8 flex flex-col" style={{ borderColor: "rgba(56,189,248,0.25)" }}>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-5">
              <Briefcase size={22} className="text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Enterprise Panel</h3>
            <p className="text-sm text-slate-400 mb-6">
              Built for CISOs and executives who need strategic risk visibility without
              wading through operational detail.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={15} className="text-sky-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold text-sm py-3 rounded-lg hover:bg-sky-500/20 transition-colors"
            >
              Start as Executive <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}