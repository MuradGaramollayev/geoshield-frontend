import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { fetchCountries, fetchCountryDetail } from "../../services/api";
import type { CountryRisk, CountryDetail } from "../../services/api";
import { isoNumericToAlpha2 } from "../../data/isoNumericToAlpha2";
import { X, Loader2, TrendingUp, TrendingDown, Minus, Server } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const NO_DATA_COLOR = "rgba(148,163,184,0.10)";

function riskToColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped < 50) return interpolate("#34d399", "#fbbf24", clamped / 50);
  return interpolate("#fbbf24", "#f43f5e", (clamped - 50) / 50);
}

function interpolate(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

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

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function EnterpriseWorldMap() {
  const [countries, setCountries] = useState<Record<string, CountryRisk>>({});
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CountryRisk | null>(null);
  const [popupCode, setPopupCode] = useState<string | null>(null);
  const [detail, setDetail] = useState<CountryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCountries()
      .then((data) => {
        const map: Record<string, CountryRisk> = {};
        for (const c of data.countries) map[c.code] = c;
        setCountries(map);
      })
      .catch((err) => setError(err.message));
  }, []);

  const openPopup = (code: string) => {
    setPopupCode(code);
    setDetail(null);
    setDetailLoading(true);
    fetchCountryDetail(code)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  if (error) {
    return (
      <div className="card-glow p-8 text-rose-400 text-sm">
        Map data unavailable: {error}
      </div>
    );
  }

  const maxSource = detail ? Math.max(...Object.values(detail.sources), 1) : 1;
  const detailColor = detail ? riskToColor(detail.risk_score) : "#38bdf8";
  const TrendIcon = detail ? TREND_ICON[detail.trend as keyof typeof TREND_ICON] || Minus : Minus;

  const circumference = 2 * Math.PI * 36;
  const dashOffset = detail ? circumference * (1 - detail.risk_score / 100) : circumference;

  return (
    <div className="card-glow p-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Global Risk Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Click a country for a strategic summary</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-2 rounded-full" style={{
            background: "linear-gradient(90deg, #34d399, #fbbf24, #f43f5e)"
          }} />
          <span className="text-[10px] text-slate-500">Low</span>
          <span className="text-[10px] text-slate-500 ml-8">High</span>
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projectionConfig={{ scale: 145 }}
          width={800}
          height={380}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = String(geo.id).padStart(3, "0");
                const alpha2 = isoNumericToAlpha2[numericId];
                const data = alpha2 ? countries[alpha2] : undefined;
                const fill = data ? riskToColor(data.risk_score) : NO_DATA_COLOR;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => data && setHovered(data)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => data && openPopup(data.code)}
                    style={{
                      default: { fill, stroke: "#0b1220", strokeWidth: 0.4, outline: "none" },
                      hover: {
                        fill, stroke: "#e2e8f0", strokeWidth: 0.8, outline: "none",
                        cursor: data ? "pointer" : "default", filter: "brightness(1.15)",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {hovered && !popupCode && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-700/60 rounded-lg px-3 py-2 pointer-events-none backdrop-blur-sm">
            <p className="text-sm font-semibold text-slate-100">{hovered.name}</p>
            <p className="text-xs text-slate-400">
              Score <span className="font-semibold" style={{ color: riskToColor(hovered.risk_score) }}>
                {hovered.risk_score}
              </span>
            </p>
          </div>
        )}

        {popupCode && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" onClick={() => setPopupCode(null)}>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: `0 0 60px -12px ${detailColor}40` }}
            >
              <button
                onClick={() => setPopupCode(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 z-10"
              >
                <X size={16} />
              </button>

              {detailLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-16 justify-center">
                  <Loader2 size={16} className="animate-spin" /> Loading strategic summary...
                </div>
              )}

              {!detailLoading && detail && (
                <>
                  {/* Header with gauge */}
                  <div
                    className="p-6 pb-5 border-b border-slate-800 flex items-center gap-5"
                    style={{
                      background: `linear-gradient(180deg, ${detailColor}12, transparent)`,
                    }}
                  >
                    <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
                      <svg width="88" height="88" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
                        <circle
                          cx="44" cy="44" r="36" fill="none"
                          stroke={detailColor} strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 44 44)"
                          style={{ filter: `drop-shadow(0 0 6px ${detailColor}88)`, transition: "stroke-dashoffset 0.8s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: detailColor }}>
                          {detail.risk_score}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-slate-100 mb-1.5 truncate">{detail.name}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: detailColor, background: `${detailColor}22` }}
                        >
                          {detail.risk_level}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 capitalize">
                          <TrendIcon size={12} className={
                            detail.trend === "up" ? "text-rose-400" :
                            detail.trend === "down" ? "text-emerald-400" : "text-slate-500"
                          } />
                          {detail.trend}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-5 space-y-5">
                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-slate-100">{detail.total_threats.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Threats</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-slate-100">{detail.source_count}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Sources</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-slate-100 truncate" title={detail.primary_attack}>
                          {detail.primary_attack}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Vector</p>
                      </div>
                    </div>

                    {/* Source breakdown */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Source Breakdown
                      </p>
                      <div className="space-y-1.5">
                        {Object.entries(detail.sources)
                          .filter(([, v]) => v > 0)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 w-24 shrink-0">
                                {SOURCE_LABELS[key] || key}
                              </span>
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${(value / maxSource) * 100}%`, background: detailColor }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-300 w-8 text-right tabular-nums">{value}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Real IPs */}
                    {detail.top_ips.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Server size={11} /> Notable IPs Observed
                        </p>
                        <div className="space-y-1.5">
                          {detail.top_ips.slice(0, 3).map((ip, i) => (
                            <div key={i} className="bg-slate-800/40 rounded-lg px-3 py-2 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-300">{ip.ip}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{ip.isp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 pt-3 border-t border-slate-800">
                      Full technical breakdown available in Advanced Analytics
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}