import { Brain, Database, Radar } from "lucide-react";
import { IconTile } from "../ui";
import { revealStyle, useReveal } from "./reveal";

const STEPS = [
  {
    icon: Database,
    step: "01",
    title: "Collect",
    body: "Nine live feeds — CISA KEV, Feodo Tracker, AbuseIPDB, Blocklist.de, Emerging Threats, VirusTotal, GreyNoise, PhishTank and Shodan — stream real indicators into one store.",
  },
  {
    icon: Brain,
    step: "02",
    title: "Score",
    body: "Each indicator is weighted by frequency, severity, source corroboration and trend, then attributed to a country and mapped onto MITRE ATT&CK.",
  },
  {
    icon: Radar,
    step: "03",
    title: "Forecast",
    body: "Daily snapshots turn those scores into movement: which origins are climbing, which vectors dominate, and where blocking pays off most.",
  },
];

/** The three stages between a raw feed and a country score. */
export default function Pipeline() {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="grid gap-8 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <div key={s.step} className="group relative" style={revealStyle(shown, i)}>
          <div className="flex items-center gap-3">
            <IconTile tone="accent" size="lg">
              <s.icon size={20} />
            </IconTile>
            <span className="code text-2xs tracking-[0.18em] text-text-3">{s.step}</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{s.title}</h3>
          <p className="mt-2.5 text-md leading-relaxed text-text-2">{s.body}</p>
          {i < STEPS.length - 1 && (
            <span className="pointer-events-none absolute -right-4 top-6 hidden h-px w-8 bg-line-strong md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
