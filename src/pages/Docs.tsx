import { useState } from "react";
import { Book, ChevronRight, Search } from "lucide-react";

const SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { q: "What is GeoShield?", a: "GeoShield is a real-time cyber threat intelligence platform aggregating data from 9 sources (CISA KEV, Feodo Tracker, AbuseIPDB, Blocklist.de, Emerging Threats, VirusTotal, GreyNoise, PhishTank, Shodan) covering 120+ countries and 100,000+ threat indicators." },
      { q: "How is the risk score calculated?", a: "Risk score blends indicator frequency, severity, trend and source corroboration. More independent sources flagging a country raise the score. Bands: LOW 0-29, MEDIUM 30-44, HIGH 45-64, CRITICAL 65+." },
    ],
  },
  {
    title: "Dashboard",
    items: [
      { q: "What does the world map show?", a: "Each country is colored by its current risk level. Click any country to open a detail panel with source breakdown, real IPs seen from that country, and one-click response actions." },
      { q: "Why do some countries show no data?", a: "GeoShield currently tracks 124 countries actively contributing indicators. Countries without recent activity from any of the 9 sources appear uncolored (no data), not 'safe'." },
    ],
  },
  {
    title: "IOC Explorer",
    items: [
      { q: "What sources does IOC lookup use?", a: "Live queries to AbuseIPDB and VirusTotal, enriched with local Shodan (exposed services, CVEs) and GreyNoise (scanner classification) data." },
      { q: "Why does a source sometimes show 'No data'?", a: "Free-tier API rate limits can be reached during heavy testing. The lookup gracefully falls back rather than failing the whole request." },
    ],
  },
  {
    title: "Incidents & Alerts",
    items: [
      { q: "How does the Kanban board work?", a: "Drag any incident card between New, Assigned, Investigating and Resolved columns. Status changes are saved immediately to the backend." },
      { q: "What is Escalation Policy?", a: "Configure notification thresholds (minutes to notify per severity) and an email address. Settings are persisted and shown as 'Configured' once saved." },
    ],
  },
  {
    title: "AI Copilot",
    items: [
      { q: "Is Copilot's data real?", a: "Yes. All answers are grounded in the live aggregated dataset — country risk scores, indicator counts, and MITRE mappings are pulled from the same data powering the dashboard." },
      { q: "Why is Copilot offline by default?", a: "The Analyst Copilot prioritizes speed and consistency for day-to-day SOC work. The Enterprise AI Advisor uses full Claude reasoning for strategic questions." },
    ],
  },
];

export default function Docs() {
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(SECTIONS[0].title);

  const filteredSections = SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter(
      (i) =>
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Documentation</h1>
        <p className="text-sm text-slate-500">Guides and FAQs for using GeoShield</p>
      </div>

      <div className="flex items-center gap-2 bg-panel border border-gray-700 rounded-lg px-4 py-1">
        <Search size={16} className="text-slate-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documentation..."
          className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-white placeholder-gray-500"
        />
      </div>

      <div className="space-y-3">
        {filteredSections.map((section) => (
          <div key={section.title} className="card-glow overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Book size={15} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">{section.title}</span>
              </div>
              <ChevronRight
                size={16}
                className={`text-slate-500 transition-transform ${
                  openSection === section.title ? "rotate-90" : ""
                }`}
              />
            </button>

            {openSection === section.title && (
              <div className="px-4 pb-4 space-y-4">
                {section.items.map((item, i) => (
                  <div key={i} className="border-t border-slate-800 pt-3">
                    <p className="text-sm font-medium text-slate-200 mb-1">{item.q}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="card-glow p-8 text-center text-slate-500 text-sm">
            No results for "{search}"
          </div>
        )}
      </div>
    </div>
  );
}