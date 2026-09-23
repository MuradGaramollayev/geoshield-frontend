import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Globe2, Grid3x3, Search, ShieldAlert, Sparkles } from "lucide-react";
import { IconTile } from "../ui";
import { revealStyle, useReveal } from "./reveal";

const FEATURES = [
  {
    icon: Globe2,
    title: "Hexagon risk map",
    body: "Every country rendered as an H3 hexagon grid, coloured on a continuous scale from its live score. Hover for the primary vector, click for the full profile.",
    to: "/analyst",
    detail: "124 countries · continuous ramp · threat-flow overlay",
  },
  {
    icon: Search,
    title: "IOC enrichment",
    body: "One address, four vendors. Each field states whether it came from a live call, the cache, or nowhere at all.",
    to: "/analyst/ioc-explorer",
    detail: "AbuseIPDB · VirusTotal · Shodan · GreyNoise",
  },
  {
    icon: Grid3x3,
    title: "ATT&CK mapping",
    body: "Indicators attributed to real MITRE tactics and techniques, with the detection count behind each cell.",
    to: "/analyst/mitre",
    detail: "Tactic coverage from the live corpus",
  },
  {
    icon: Sparkles,
    title: "Grounded copilot",
    body: "Ask about the landscape in plain language and get answers computed from the data in front of you, never from a model's memory.",
    to: "/analyst",
    detail: "Answers cite the figures they used",
  },
  {
    icon: FileText,
    title: "Executive briefings",
    body: "A one-click PDF covering global posture, top origins and where blocking pays off most, drawn as vectors so it prints clean.",
    to: "/enterprise/reports",
    detail: "Board-ready, generated on request",
  },
  {
    icon: ShieldAlert,
    title: "Response rules",
    body: "Turn a confirmed origin into iptables, Cisco ACL, AWS, STIX, Sigma or YARA rules without leaving the incident.",
    to: "/analyst/incidents",
    detail: "Six export formats",
  },
];

/** Feature grid. Each card lifts, lights up under the cursor, reveals its
 *  detail line, and links through. */
export default function Capabilities() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [active, setActive] = useState<string | null>(null);
  const frame = useRef(0);

  // The cursor position reaches CSS as two custom properties; one rAF at a
  // time keeps a fast pointer from queueing style writes.
  const track = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((clientY - r.top) / r.height) * 100}%`);
    });
  };

  return (
    <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => {
        const on = active === f.title;
        return (
          <Link
            key={f.title}
            to={f.to}
            onMouseEnter={() => setActive(f.title)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(f.title)}
            onBlur={() => setActive(null)}
            onPointerMove={track}
            className="e2 spot group relative flex flex-col rounded-[16px] p-6 interactive hover:-translate-y-1"
            style={revealStyle(shown, i)}
          >
            <span className="flex items-start justify-between">
              <IconTile tone={on ? "accent" : "paper"} size="lg">
                <f.icon size={20} />
              </IconTile>
              <ArrowUpRight
                size={16}
                className={`text-text-3 transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`}
              />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 flex-1 text-base leading-relaxed text-text-2">{f.body}</p>
            <span
              className="code mt-4 block overflow-hidden text-2xs text-text-3 transition-all duration-300"
              style={{ maxHeight: on ? 40 : 0, opacity: on ? 1 : 0 }}
            >
              {f.detail}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
