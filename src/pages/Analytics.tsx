import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Globe2, ShieldAlert } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { fetchCountries, fetchMitreMatrix, fetchTimeline } from "../services/api";
import type { CountryRisk, MitreMatrix, TimelineEvent } from "../services/api";

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

export default function Analytics() {
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [matrix, setMatrix] = useState<MitreMatrix | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCountries(), fetchMitreMatrix(), fetchTimeline(90)])
      .then(([c, m, t]) => {
        setCountries(c.countries);
        setMatrix(m);
        setEvents(t.events);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  if (error) return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;

  // Top 10 countries by risk score
  const topCountries = [...countries]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10)
    .map((c) => ({ name: c.code, risk: c.risk_score, level: c.risk_level }));

  // Risk level distribution
  const levelCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  countries.forEach((c) => { levelCounts[c.risk_level] = (levelCounts[c.risk_level] || 0) + 1; });
  const levelData = Object.entries(levelCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Top attack techniques (MITRE)
  const allTechniques = matrix?.tactics.flatMap((t) => t.techniques) || [];
  const topTechniques = [...allTechniques]
    .sort((a, b) => b.our_count - a.our_count)
    .slice(0, 8)
    .map((t) => ({ name: t.id, count: t.our_count, severity: t.severity }));

  // Events by type
  const cveCount = events.filter((e) => e.type === "CVE_EXPLOIT").length;
  const ransomwareCount = events.filter((e) => e.ransomware).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Analytics</h1>
        <p className="text-sm text-slate-500">
          Aggregate statistics across {countries.length} countries, {matrix?.total_mapped.toLocaleString()} indicators
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-glow p-4">
          <Globe2 size={16} className="text-sky-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{countries.length}</p>
          <p className="text-xs text-slate-500 mt-1">Countries Tracked</p>
        </div>
        <div className="card-glow p-4">
          <ShieldAlert size={16} className="text-rose-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{events.length}</p>
          <p className="text-xs text-slate-500 mt-1">Events (90 days)</p>
        </div>
        <div className="card-glow p-4">
          <TrendingUp size={16} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{cveCount}</p>
          <p className="text-xs text-slate-500 mt-1">CVE Exploits</p>
        </div>
        <div className="card-glow p-4">
          <BarChart3 size={16} className="text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-slate-100">{ransomwareCount}</p>
          <p className="text-xs text-slate-500 mt-1">Ransomware-linked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 countries bar chart */}
        <div className="card-glow p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Top 10 Countries by Risk Score</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCountries} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={40} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                {topCountries.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLOR[entry.level] || "#38bdf8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk level distribution pie */}
        <div className="card-glow p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={levelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine={false}
              >
                {levelData.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLOR[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
              />
              <Legend
                formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top MITRE techniques */}
        <div className="card-glow p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Top MITRE ATT&CK Techniques by Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topTechniques}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {topTechniques.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLOR[entry.severity] || "#38bdf8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}