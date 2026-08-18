import { useEffect, useState } from "react";
import { fetchCountries } from "../../services/api";
import type { CountryRisk } from "../../services/api";

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

const ATTACK_COLOR: Record<string, string> = {
  "Malware C2": "#f43f5e",
  "Phishing": "#fb923c",
  "BruteForce": "#fbbf24",
  "DDoS": "#38bdf8",
  "Botnet": "#a78bfa",
  "Port Scan": "#34d399",
  "Spam": "#94a3b8",
};

export default function ThreatFlowSankey() {
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries()
      .then((data) => setCountries(data.countries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card-glow p-6 text-slate-500 text-sm">Loading flow diagram...</div>;
  if (error) return <div className="card-glow p-6 text-rose-400 text-sm">Error: {error}</div>;

  const top8 = [...countries].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8);
  const attackTypes = Array.from(new Set(top8.map((c) => c.primary_attack)));
  const riskLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const nodeHeight = 32;
  const nodeGap = 10;
  const colWidth = 180;
  const svgHeight = Math.max(top8.length, attackTypes.length, riskLevels.length) * (nodeHeight + nodeGap);

  const countryY = (i: number) => i * (nodeHeight + nodeGap);
  const attackY = (i: number) => i * (nodeHeight + nodeGap) + (svgHeight - attackTypes.length * (nodeHeight + nodeGap)) / 2;
  const riskY = (i: number) => i * (nodeHeight + nodeGap) + (svgHeight - riskLevels.length * (nodeHeight + nodeGap)) / 2;

  const col1X = 0;
  const col2X = colWidth + 60;
  const col3X = (colWidth + 60) * 2;

  return (
    <div className="card-glow p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-200">Threat Flow: Country → Vector → Severity</h3>
        <p className="text-xs text-slate-500 mt-0.5">Top 8 risk countries, real attack vectors and severity mapping</p>
      </div>

      <div className="overflow-x-auto">
        <svg width={col3X + colWidth} height={svgHeight + 20} className="mx-auto">
          {/* Flow lines: country -> attack type */}
          {top8.map((c, i) => {
            const attackIdx = attackTypes.indexOf(c.primary_attack);
            const flowId = `c-${c.code}`;
            const y1 = countryY(i) + nodeHeight / 2;
            const y2 = attackY(attackIdx) + nodeHeight / 2;
            const color = ATTACK_COLOR[c.primary_attack] || "#38bdf8";
            const isHovered = hoveredFlow === flowId;
            return (
              <path
                key={flowId}
                d={`M ${col1X + colWidth} ${y1} C ${col1X + colWidth + 60} ${y1}, ${col2X - 60} ${y2}, ${col2X} ${y2}`}
                stroke={color}
                strokeWidth={isHovered ? 4 : 2}
                fill="none"
                opacity={isHovered ? 0.9 : 0.35}
                onMouseEnter={() => setHoveredFlow(flowId)}
                onMouseLeave={() => setHoveredFlow(null)}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
              />
            );
          })}

          {/* Flow lines: attack type -> risk level */}
          {attackTypes.map((attack, ai) => {
            const relatedCountries = top8.filter((c) => c.primary_attack === attack);
            const dominantLevel = relatedCountries[0]?.risk_level || "MEDIUM";
            const riskIdx = riskLevels.indexOf(dominantLevel);
            const flowId = `a-${attack}`;
            const y1 = attackY(ai) + nodeHeight / 2;
            const y2 = riskY(riskIdx) + nodeHeight / 2;
            const color = RISK_COLOR[dominantLevel];
            const isHovered = hoveredFlow === flowId;
            return (
              <path
                key={flowId}
                d={`M ${col2X + colWidth} ${y1} C ${col2X + colWidth + 60} ${y1}, ${col3X - 60} ${y2}, ${col3X} ${y2}`}
                stroke={color}
                strokeWidth={isHovered ? 4 : 2}
                fill="none"
                opacity={isHovered ? 0.9 : 0.35}
                onMouseEnter={() => setHoveredFlow(flowId)}
                onMouseLeave={() => setHoveredFlow(null)}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
              />
            );
          })}

          {/* Column 1: Countries */}
          {top8.map((c, i) => (
            <g key={c.code}>
              <rect
                x={col1X} y={countryY(i)} width={colWidth} height={nodeHeight}
                rx={6} fill="#1e293b" stroke={RISK_COLOR[c.risk_level]} strokeWidth={1.5}
              />
              <text x={col1X + 10} y={countryY(i) + nodeHeight / 2 + 4} fill="#e2e8f0" fontSize={12} fontWeight={600}>
                {c.name}
              </text>
              <text x={col1X + colWidth - 10} y={countryY(i) + nodeHeight / 2 + 4} fill={RISK_COLOR[c.risk_level]} fontSize={11} textAnchor="end" fontWeight={700}>
                {c.risk_score}
              </text>
            </g>
          ))}

          {/* Column 2: Attack types */}
          {attackTypes.map((attack, i) => (
            <g key={attack}>
              <rect
                x={col2X} y={attackY(i)} width={colWidth} height={nodeHeight}
                rx={6} fill="#1e293b" stroke={ATTACK_COLOR[attack] || "#38bdf8"} strokeWidth={1.5}
              />
              <text x={col2X + colWidth / 2} y={attackY(i) + nodeHeight / 2 + 4} fill="#e2e8f0" fontSize={12} textAnchor="middle" fontWeight={600}>
                {attack}
              </text>
            </g>
          ))}

          {/* Column 3: Risk levels */}
          {riskLevels.map((level, i) => (
            <g key={level}>
              <rect
                x={col3X} y={riskY(i)} width={colWidth} height={nodeHeight}
                rx={6} fill="#1e293b" stroke={RISK_COLOR[level]} strokeWidth={1.5}
              />
              <text x={col3X + colWidth / 2} y={riskY(i) + nodeHeight / 2 + 4} fill={RISK_COLOR[level]} fontSize={12} textAnchor="middle" fontWeight={700}>
                {level}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-slate-500">
        <span>Country</span>
        <span>→</span>
        <span>Primary Vector</span>
        <span>→</span>
        <span>Risk Level</span>
      </div>
    </div>
  );
}