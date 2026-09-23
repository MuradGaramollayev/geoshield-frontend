import { useState } from "react";
import { motion } from "framer-motion";
import { fetchCountries } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { SEVERITY_ORDER, toSeverity } from "../../design/tokens";
import { useTheme } from "../../design/themeContext";
import { Card, CardHeader, ErrorState, SkeletonCard } from "../ui";

const TOP_N = 10;
const NODE_H = 34;
const GAP = 10;
const COL_W = 190;
const LINK_W = 110;

/**
 * Country → labelled primary vector → severity band for the top-risk countries.
 * Every link is one country; vector→severity links are counted per country
 * (not inferred from the first country in a group).
 */
export default function ThreatFlowSankey() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(fetchCountries, []);
  const [hover, setHover] = useState<string | null>(null);
  if (loading) return <SkeletonCard tall />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const top = [...data!.countries].sort((a, b) => b.risk_score - a.risk_score).slice(0, TOP_N);
  const vectors = Array.from(new Set(top.map((c) => c.primary_attack)));
  const levels = SEVERITY_ORDER.filter((s) => top.some((c) => c.risk_level === s));
  const rows = Math.max(top.length, vectors.length, levels.length);
  const H = rows * (NODE_H + GAP);
  const yOf = (i: number, n: number) => i * (NODE_H + GAP) + (H - n * (NODE_H + GAP)) / 2 + NODE_H / 2;
  const x1 = COL_W, x2 = COL_W + LINK_W, x3 = x2 + COL_W, x4 = x3 + LINK_W;
  const W = x4 + COL_W;

  const vecToLevel = new Map<string, number>();
  top.forEach((c) => {
    const k = `${c.primary_attack}|${c.risk_level}`;
    vecToLevel.set(k, (vecToLevel.get(k) ?? 0) + 1);
  });

  const curve = (xa: number, ya: number, xb: number, yb: number) => `M ${xa} ${ya} C ${xa + LINK_W / 2} ${ya}, ${xb - LINK_W / 2} ${yb}, ${xb} ${yb}`;
  const dim = (id: string, related: string[]) => (hover && hover !== id && !related.includes(hover) ? 0.12 : 0.55);

  return (
    <Card>
      <CardHeader
        title="How the highest-risk countries map to threat type and severity"
        description={`Top ${TOP_N} countries by risk score. Threat type is the primary attack labelled in the dataset.`}
      />
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[720px]" style={{ height: H }} role="img" aria-label="Country to threat type to severity flow">
          {top.map((c, i) => {
            const vi = vectors.indexOf(c.primary_attack);
            const sev = toSeverity(c.risk_level) ?? "LOW";
            return (
              <motion.path
                key={`cv-${c.code}`}
                d={curve(x1, yOf(i, top.length), x2, yOf(vi, vectors.length))}
                stroke={th.sev[sev].solid}
                strokeWidth={hover === c.code ? 5 : 3}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: dim(c.code, [`v-${c.primary_attack}`]) }}
                transition={{ duration: 0.8, delay: i * 0.04 }}
              />
            );
          })}
          {Array.from(vecToLevel.entries()).map(([k, n]) => {
            const [v, l] = k.split("|");
            const sev = toSeverity(l) ?? "LOW";
            return (
              <motion.path
                key={`vl-${k}`}
                d={curve(x3, yOf(vectors.indexOf(v), vectors.length), x4, yOf(levels.indexOf(sev), levels.length))}
                stroke={th.sev[sev].solid}
                strokeWidth={2 + n * 2}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: dim(`v-${v}`, top.filter((c) => c.primary_attack === v && c.risk_level === l).map((c) => c.code)) }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            );
          })}

          {top.map((c, i) => {
            const y = yOf(i, top.length) - NODE_H / 2;
            return (
              <g key={c.code} onMouseEnter={() => setHover(c.code)} onMouseLeave={() => setHover(null)} className="cursor-default">
                <rect x={0} y={y} width={COL_W} height={NODE_H} rx={10} fill={th.c.paper} stroke={th.c.line} />
                <text x={12} y={y + NODE_H / 2 + 4} fontSize={13} fontWeight={600} fill={th.c.ink}>{c.name}</text>
                <text x={COL_W - 12} y={y + NODE_H / 2 + 4} fontSize={12} textAnchor="end" fill={th.c.text2} className="num">{c.risk_score}</text>
              </g>
            );
          })}
          {vectors.map((v, i) => {
            const y = yOf(i, vectors.length) - NODE_H / 2;
            return (
              <g key={v} onMouseEnter={() => setHover(`v-${v}`)} onMouseLeave={() => setHover(null)}>
                <rect x={x2} y={y} width={COL_W} height={NODE_H} rx={10} fill={th.c.ink2} />
                <text x={x2 + COL_W / 2} y={y + NODE_H / 2 + 4} fontSize={13} fontWeight={600} textAnchor="middle" fill={th.c.paper}>{v}</text>
              </g>
            );
          })}
          {levels.map((l, i) => {
            const y = yOf(i, levels.length) - NODE_H / 2;
            return (
              <g key={l}>
                <rect x={x4} y={y} width={COL_W} height={NODE_H} rx={10} fill={th.sev[l].tint} />
                <text x={x4 + COL_W / 2} y={y + NODE_H / 2 + 4} fontSize={13} fontWeight={700} textAnchor="middle" fill={th.sev[l].text}>
                  {th.sev[l].label} · {top.filter((c) => c.risk_level === l).length}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
