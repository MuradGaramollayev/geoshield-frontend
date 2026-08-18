import { CheckCircle2 } from "lucide-react";

const SOURCES = [
  { name: "CISA KEV", desc: "US Government known exploited vulns" },
  { name: "Feodo Tracker", desc: "Botnet C2 infrastructure" },
  { name: "AbuseIPDB", desc: "Community-reported malicious IPs" },
  { name: "Blocklist.de", desc: "Attack type distribution" },
  { name: "Emerging Threats", desc: "Compromised infrastructure feed" },
  { name: "VirusTotal", desc: "Multi-engine IOC enrichment" },
  { name: "GreyNoise", desc: "Malicious vs. benign scanner classification" },
  { name: "PhishTank", desc: "Verified phishing URLs" },
  { name: "Shodan", desc: "Exposed services and CVEs" },
];

export default function DataSources() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            Data Sources
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
            9 live intelligence feeds, zero simulated data
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every number on this platform traces back to a real, verifiable source.
            No synthetic datasets, no placeholder statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          {SOURCES.map((s) => (
            <div
              key={s.name}
              className="card-glow p-4 flex items-start gap-3 hover:border-emerald-500/30 transition-colors"
            >
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-200">{s.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}