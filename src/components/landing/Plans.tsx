import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "../ui";
import { revealStyle, useReveal } from "./reveal";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    body: "For students and individual researchers exploring the platform.",
    features: ["Analyst console access", "5 IOC lookups a day", "Country risk map", "Community support"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    body: "For freelance analysts and small security teams.",
    features: ["Everything in Free", "Unlimited IOC lookups", "Full threat explorer", "Copilot access", "Email support"],
    cta: "Start Pro trial",
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    body: "For SOC teams of five to twenty analysts.",
    features: ["Everything in Pro", "Incident board", "Response rule generation", "Roles and permissions", "Priority support"],
    featured: true,
    cta: "Start Business trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "from $499/month",
    body: "For organisations that need the executive console.",
    features: ["Everything in Business", "Enterprise console", "Strategic advisor", "Advanced analytics", "Account manager"],
    cta: "Contact sales",
  },
];

export default function Plans() {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t, i) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-[18px] p-6 ${t.featured ? "e3 ring-1 ring-accent" : "e2"}`}
            style={revealStyle(shown, i)}
          >
            {t.featured && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-0.5 text-2xs font-bold text-sev-high-on">
                MOST POPULAR
              </span>
            )}
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-text-3">{t.name}</p>
            <p className="mt-3">
              <span className="num text-2xl font-semibold tracking-tight text-ink">{t.price}</span>
              <span className="ml-1.5 text-sm text-text-3">{t.period}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-text-3">{t.body}</p>
            <ul className="mt-6 mb-6 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-text-2">
                  <Check size={13} className="mt-0.5 shrink-0 text-positive" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button variant={t.featured ? "accent" : "secondary"} size="sm" className="w-full">
                {t.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-text-3">
        Billing is not yet live. These are the planned tiers, shown so the structure is clear.
      </p>
    </div>
  );
}
