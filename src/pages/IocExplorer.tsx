import { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, Globe, Building2, Server, AlertTriangle } from "lucide-react";
import { lookupIoc } from "../services/api";
import type { IocLookupResult } from "../services/api";

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
  UNKNOWN: "#94a3b8",
};

function Row({ label, value, valueClass = "text-slate-100" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-[13px] text-slate-500 shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function EmptySourceCard({ icon: Icon, iconColor, title, note }: { icon: any; iconColor: string; title: string; note: string }) {
  return (
    <div className="card-glow p-5 flex flex-col items-center justify-center text-center py-8">
      <Icon size={22} className={iconColor} />
      <h3 className="text-sm font-semibold text-slate-300 mt-2 mb-1">{title}</h3>
      <p className="text-xs text-slate-600">{note}</p>
    </div>
  );
}

export default function IocExplorer() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<IocLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleSearch = async (targetIp?: string) => {
    const query = (targetIp ?? ip).trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lookupIoc(query);
      setResult(data);
      setHistory((prev) => [query, ...prev.filter((h) => h !== query)].slice(0, 6));
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result ? RISK_COLOR[result.risk_level] || RISK_COLOR.UNKNOWN : RISK_COLOR.UNKNOWN;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-x-hidden">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">IOC Explorer</h1>
        <p className="text-sm text-slate-500">
          Real-time IP reputation lookup — AbuseIPDB, VirusTotal, Shodan, GreyNoise
        </p>
      </div>

      {/* Search bar — flex layout, no absolute icon overlap */}
      <div className="card-glow p-4">
        <div className="flex items-center gap-2 bg-panel border border-gray-700 rounded-lg px-4 py-1 focus-within:border-emerald/50 focus-within:ring-1 focus-within:ring-emerald/30 transition-colors">
          <Search className="text-slate-500 shrink-0" size={18} />
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter an IP address (e.g. 45.148.10.141)"
            className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-white placeholder-gray-500 min-w-0"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="shrink-0 bg-emerald text-navy font-semibold text-sm px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-slate-500">Recent searches:</span>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => { setIp(h); handleSearch(h); }}
                className="text-xs font-mono text-slate-400 bg-slate-800 hover:bg-slate-700 rounded px-2 py-1 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="card-glow p-4 text-rose-400 text-sm">Error: {error}</div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Risk summary — full width */}
          <div className="card-glow p-6 flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg width="96" height="96" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                <circle
                  cx="56" cy="56" r="44" fill="none"
                  stroke={riskColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={0}
                  transform="rotate(-90 56 56)"
                  style={{ filter: `drop-shadow(0 0 6px ${riskColor}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {result.risk_level === "LOW" || result.risk_level === "UNKNOWN" ? (
                  <ShieldCheck size={30} style={{ color: riskColor }} />
                ) : (
                  <ShieldAlert size={30} style={{ color: riskColor }} />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-lg text-slate-100 mb-2">{result.ip}</p>
              <span
                className="inline-block text-sm font-bold px-3 py-1 rounded-full mb-2"
                style={{ color: riskColor, background: `${riskColor}1a` }}
              >
                {result.risk_level}
              </span>
              <p className="text-sm text-slate-400">{result.recommendation}</p>
            </div>
          </div>

          {/* Source cards — 2 columns, generous spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AbuseIPDB */}
            {result.abuseipdb?.score !== undefined ? (
              <div className="card-glow p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Globe size={16} className="text-sky-400" />
                  <h3 className="text-sm font-semibold text-slate-200">AbuseIPDB</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  <Row label="Confidence Score" value={`${result.abuseipdb.score}%`} valueClass="text-rose-400" />
                  <Row label="Country" value={result.abuseipdb.country || "—"} />
                  <Row label="ISP" value={result.abuseipdb.isp || "—"} />
                  <Row label="Total Reports" value={result.abuseipdb.totalReports ?? "—"} />
                  {result.abuseipdb.categories && result.abuseipdb.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {result.abuseipdb.categories.map((cat) => (
                        <span key={cat} className="text-xs bg-slate-800 text-slate-300 rounded px-2 py-1">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptySourceCard
                icon={Globe} iconColor="text-sky-400/50"
                title="AbuseIPDB"
                note="No data — rate limit reached or IP not reported"
              />
            )}

            {/* VirusTotal */}
            {result.virustotal?.malicious !== undefined ? (
              <div className="card-glow p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-slate-200">VirusTotal</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  <Row label="Malicious" value={result.virustotal.malicious} valueClass="text-rose-400" />
                  <Row label="Suspicious" value={result.virustotal.suspicious} valueClass="text-amber-400" />
                  <Row label="Harmless" value={result.virustotal.harmless} valueClass="text-emerald-400" />
                  <Row label="Reputation" value={result.virustotal.reputation ?? "—"} />
                  <Row label="AS Owner" value={result.virustotal.as_owner || "—"} />
                </div>
              </div>
            ) : (
              <EmptySourceCard
                icon={AlertTriangle} iconColor="text-amber-400/50"
                title="VirusTotal"
                note="No data — rate limit reached or IP not scanned"
              />
            )}

            {/* Shodan */}
            {result.shodan ? (
              <div className="card-glow p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Server size={16} className="text-violet-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Shodan</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  <Row label="City / Country" value={`${result.shodan.city}, ${result.shodan.country}`} />
                  <Row label="Organization" value={result.shodan.org || "—"} />
                  <Row label="Open Ports" value={result.shodan.port_count} />
                  <Row
                    label="Vulnerabilities (CVE)"
                    value={result.shodan.vuln_count}
                    valueClass={result.shodan.vuln_count! > 0 ? "text-rose-400" : "text-slate-100"}
                  />
                  {result.shodan.cves && result.shodan.cves.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {result.shodan.cves.slice(0, 5).map((cve) => (
                        <span key={cve} className="text-xs font-mono bg-rose-500/10 text-rose-400 rounded px-2 py-1">
                          {cve}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptySourceCard
                icon={Server} iconColor="text-violet-400/50"
                title="Shodan"
                note="No exposed services found for this IP"
              />
            )}

            {/* GreyNoise */}
            {result.greynoise ? (
              <div className="card-glow p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Building2 size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-200">GreyNoise</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  <Row label="Classification" value={result.greynoise.classification || "—"} valueClass="text-slate-100 capitalize" />
                  <Row label="Name" value={result.greynoise.name || "—"} />
                  <Row label="Noise" value={result.greynoise.noise ? "Yes" : "No"} />
                </div>
              </div>
            ) : (
              <EmptySourceCard
                icon={Building2} iconColor="text-cyan-400/50"
                title="GreyNoise"
                note="No classification available for this IP"
              />
            )}
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="card-glow p-12 text-center text-slate-500 text-sm">
          Search an IP address to get real-time threat intelligence
        </div>
      )}
    </div>
  );
}