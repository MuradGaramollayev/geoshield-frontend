import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Server, Ban, FileText, Plus } from "lucide-react";
import { fetchCountryDetail } from "../../services/api";
import type { CountryDetail } from "../../services/api";
import ResponseModal from "./ResponseModal";

interface CountryDetailPanelProps {
  countryCode: string | null;
  onClose: () => void;
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

const SOURCE_LABELS: Record<string, string> = {
  phishtank: "PhishTank",
  feodo: "Feodo Tracker",
  abuseipdb: "AbuseIPDB",
  blocklist_de: "Blocklist.de",
  emerging_threats: "Emerging Threats",
  virustotal: "VirusTotal",
  greynoise: "GreyNoise",
  shodan_vulns: "Shodan",
};

const TREND_LABEL: Record<string, string> = {
  up: "↑ Increasing",
  down: "↓ Decreasing",
  stable: "→ Stable",
};

export default function CountryDetailPanel({ countryCode, onClose }: CountryDetailPanelProps) {
  const [detail, setDetail] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    fetchCountryDetail(countryCode)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [countryCode]);

  const isOpen = countryCode !== null;
  const maxSourceValue = detail
    ? Math.max(...Object.values(detail.sources), 1)
    : 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-300">Country Details</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {loading && (
                <div className="p-6 text-slate-500 text-sm">Loading...</div>
              )}

              {error && (
                <div className="p-6 text-rose-400 text-sm">Error: {error}</div>
              )}

              {detail && (
                <div className="p-5 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-50 mb-2">{detail.name}</h1>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold" style={{ color: RISK_COLOR[detail.risk_level] }}>
                        {detail.risk_score}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          color: RISK_COLOR[detail.risk_level],
                          background: `${RISK_COLOR[detail.risk_level]}1a`,
                        }}
                      >
                        {detail.risk_level}
                      </span>
                      <span className="text-sm text-slate-400">
                        {TREND_LABEL[detail.trend] || detail.trend}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-glow p-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <ShieldAlert size={14} /> Total Threats
                      </div>
                      <p className="text-xl font-bold text-slate-100">
                        {detail.total_threats.toLocaleString()}
                      </p>
                    </div>
                    <div className="card-glow p-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Server size={14} /> Source Count
                      </div>
                      <p className="text-xl font-bold text-slate-100">{detail.source_count}</p>
                    </div>
                  </div>

                  <div className="card-glow p-3">
                    <p className="text-xs text-slate-500 mb-1">Primary Attack Type</p>
                    <p className="text-sm font-semibold text-slate-100">{detail.primary_attack}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Source Breakdown
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(detail.sources)
                        .filter(([, v]) => v > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-32 shrink-0">
                              {SOURCE_LABELS[key] || key}
                            </span>
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-400 rounded-full"
                                style={{ width: `${(value / maxSourceValue) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-300 w-10 text-right">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {detail.top_ips.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Real IPs From This Country
                      </h3>
                      <div className="space-y-2">
                        {detail.top_ips.map((ip, i) => (
                          <div
                            key={i}
                            className="card-glow px-3 py-2 flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-mono text-slate-200">{ip.ip}</p>
                              <p className="text-xs text-slate-500">{ip.city} · {ip.isp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => setShowResponseModal(true)}
                      className="flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg py-2.5 text-sm font-medium hover:bg-rose-500/20 transition-colors"
                    >
                      <Ban size={16} /> Block Country
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors">
                      <FileText size={16} /> View Full Report
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors">
                      <Plus size={16} /> Create Incident
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showResponseModal && detail && (
        <ResponseModal
          action="block_country"
          target={detail.code}
          reason={`High risk (${detail.risk_level}) — ${detail.primary_attack}`}
          onClose={() => setShowResponseModal(false)}
        />
      )}
    </>
  );
}