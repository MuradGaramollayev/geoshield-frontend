import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Check, Shield } from "lucide-react";
import { Button, IconTile } from "../ui";
import { revealStyle, useReveal } from "./reveal";

const CONSOLES = [
  {
    icon: Shield,
    name: "Analyst console",
    tagline: "Dense, fast, technical.",
    body: "For SOC analysts and researchers working a queue: tight spacing, monospaced figures, keyboard-first navigation, dark by default.",
    points: [
      "IOC explorer with live vendor enrichment",
      "MITRE ATT&CK technique mapping",
      "Incident board and response rules",
      "Hexagon risk map with threat-flow arcs",
      "Operational copilot",
    ],
    to: "/analyst",
    cta: "Open Analyst",
  },
  {
    icon: Briefcase,
    name: "Enterprise console",
    tagline: "Spacious, calm, strategic.",
    body: "For CISOs and executives who need the posture and the movement, not the packet detail: generous spacing, slower motion, light by default.",
    points: [
      "Strategic overview and risk forecast",
      "Advanced analytics and supply chain risk",
      "Board-ready PDF briefings",
      "Defense architecture review",
      "Strategic advisor",
    ],
    to: "/enterprise",
    cta: "Open Enterprise",
  },
];

/** The two consoles: one token set, different density and pacing. */
export default function Consoles() {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="grid gap-6 md:grid-cols-2">
      {CONSOLES.map((c, i) => (
        <div key={c.name} className="e2 flex flex-col rounded-[20px] p-8" style={revealStyle(shown, i)}>
          <IconTile tone="ink" size="lg">
            <c.icon size={20} />
          </IconTile>
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{c.name}</h3>
          <p className="mt-1 text-sm font-semibold text-accent-ink">{c.tagline}</p>
          <p className="mt-3 text-md leading-relaxed text-text-2">{c.body}</p>
          <ul className="mt-6 mb-8 flex-1 space-y-2.5">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-ink">
                <Check size={15} className="mt-0.5 shrink-0 text-positive" />
                {p}
              </li>
            ))}
          </ul>
          <Link to={c.to}>
            <Button variant="secondary" size="md" className="w-full" iconRight={<ArrowRight size={15} />}>
              {c.cta}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
