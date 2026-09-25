import { fetchStatus } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { revealStyle, useReveal } from "./reveal";

const FEEDS = [
  { name: "CISA KEV", role: "Known exploited vulnerabilities", mode: "aggregated" },
  { name: "Feodo Tracker", role: "Botnet command-and-control", mode: "aggregated" },
  { name: "Blocklist.de", role: "Attack type distribution", mode: "aggregated" },
  { name: "Emerging Threats", role: "Compromised infrastructure", mode: "aggregated" },
  { name: "PhishTank", role: "Verified phishing URLs", mode: "aggregated" },
  { name: "AbuseIPDB", role: "Community-reported addresses", mode: "queried", key: "abuseipdb" },
  { name: "VirusTotal", role: "Multi-engine reputation", mode: "queried", key: "virustotal" },
  { name: "GreyNoise", role: "Scanner classification", mode: "queried" },
  { name: "Shodan", role: "Exposed services and CVEs", mode: "queried" },
];

/** The nine feeds, and whether each is aggregated daily or queried per lookup. */
export default function Feeds() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const { data } = useAsync(fetchStatus, []);
  const keys = data?.keys ?? {};

  return (
    <div ref={ref}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEEDS.map((f, i) => (
          <div
            key={f.name}
            className="e1 flex items-start gap-3 rounded-[14px] px-4 py-3.5"
            style={revealStyle(shown, i % 3)}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                f.mode === "queried" ? "bg-accent" : "bg-positive"
              }`}
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{f.name}</span>
                {f.key && keys[f.key] && (
                  <span className="code text-2xs text-text-3">key configured</span>
                )}
              </span>
              <span className="mt-0.5 block text-xs text-text-3">{f.role}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-3">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-positive" /> aggregated into the daily dataset
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" /> queried live per lookup
        </span>
      </div>
    </div>
  );
}
