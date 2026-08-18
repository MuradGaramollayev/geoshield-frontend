import { Map, Search, Grid3x3, Sparkles, FileText, ShieldAlert } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Interactive Risk Map",
    description: "Real-time choropleth of 124 countries, color-coded by live threat score, updated continuously from 9 sources.",
    color: "#38bdf8",
  },
  {
    icon: Search,
    title: "IOC Explorer",
    description: "Instant IP reputation lookup across AbuseIPDB, VirusTotal, Shodan, and GreyNoise, with exposed CVEs and open ports.",
    color: "#34d399",
  },
  {
    icon: Grid3x3,
    title: "MITRE ATT&CK Mapping",
    description: "Every indicator automatically mapped to real MITRE tactics and techniques, with live detection counts.",
    color: "#a78bfa",
  },
  {
    icon: Sparkles,
    title: "AI Copilot",
    description: "Ask natural-language questions about your threat landscape and get answers grounded in your live data.",
    color: "#fbbf24",
  },
  {
    icon: FileText,
    title: "Executive Reports",
    description: "One-click PDF briefings summarizing global risk, top origins, and key indicators for stakeholders.",
    color: "#fb923c",
  },
  {
    icon: ShieldAlert,
    title: "One-Click Response",
    description: "Generate real iptables, Cisco ACL, AWS, STIX, Sigma, and YARA rules the moment a threat is confirmed.",
    color: "#f43f5e",
  },
];

export default function FeaturesGrid() {
  return (
    <div id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            Platform
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Everything a modern SOC needs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-glow p-6 group hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                >
                  <Icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}