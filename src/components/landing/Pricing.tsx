import { Link } from "react-router-dom";
import { Check } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For students and individual researchers exploring the platform.",
    features: ["Analyst Dashboard access", "5 IOC lookups / day", "Basic MITRE mapping", "Community support"],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For freelance analysts and small security teams.",
    features: ["Everything in Free", "Unlimited IOC lookups", "Full Threat Explorer", "AI Copilot access", "Email support"],
    cta: "Start Pro Trial",
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    description: "For SOC teams of 5-20 analysts.",
    features: ["Everything in Pro", "Incident Kanban board", "One-click response rules", "Team roles & permissions", "Priority support"],
    highlighted: true,
    cta: "Start Business Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "starting at $499/mo",
    description: "For large organizations needing executive dashboards.",
    features: ["Everything in Business", "Enterprise Panel access", "AI Advisor", "Advanced analytics suite", "Dedicated account manager"],
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  return (
    <div id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-3 font-bold">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Simple pricing that scales with you
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`card-glow p-6 flex flex-col relative ${
                tier.highlighted ? "ring-1 ring-emerald-400/50" : ""
              }`}
              style={tier.highlighted ? { borderColor: "rgba(16,185,129,0.4)" } : undefined}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-navy text-[10px] font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                {tier.name}
              </h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-slate-100">{tier.price}</span>
                <span className="text-sm text-slate-500 ml-1">{tier.period}</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">{tier.description}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  tier.highlighted
                    ? "bg-emerald text-navy hover:opacity-90"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-10">
          Billing integration is not yet live. Pricing shown reflects the planned tier structure.
        </p>
      </div>
    </div>
  );
}