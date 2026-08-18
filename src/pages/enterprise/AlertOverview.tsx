import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { fetchIncidents, fetchTimeline } from "../../services/api";
import type { Incident, TimelineEvent } from "../../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

export default function AlertOverview() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchIncidents(), fetchTimeline(30)])
      .then(([inc, tl]) => {
        setIncidents(inc.incidents);
        setEvents(tl.events);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading alert overview...</div>;
  if (error) return <div className="p-8 text-rose-400 text-sm">Error: {error}</div>;

  // Severity breakdown from incidents
  const counts = {
    CRITICAL: incidents.filter((i) => i.severity === "CRITICAL").length,
    HIGH: incidents.filter((i) => i.severity === "HIGH").length,
    MEDIUM: incidents.filter((i) => i.severity === "MEDIUM").length,
    LOW: incidents.filter((i) => i.severity === "LOW").length,
  };
  const total = incidents.length;

  // 30-day trend from real timeline events, grouped by day
  const trendMap: Record<string, number> = {};
  events.forEach((e) => {
    trendMap[e.date] = (trendMap[e.date] || 0) + 1;
  });
  const today = new Date();
  const trendData: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    trendData.push({ date: key.slice(5), count: trendMap[key] || 0 });
  }

  // Compare last 7 days vs previous 7 days (real trend %)
  const last7 = trendData.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = trendData.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const trendPercent = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

  // Top attack categories from incidents
  const categoryMap: Record<string, number> = {};
  incidents.forEach((i) => {
    if (i.attack_type) categoryMap[i.attack_type] = (categoryMap[i.attack_type] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Alert Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Executive summary of {total} active alerts · standalone strategic view
        </p>
      </div>

      {/* Severity breakdown — large numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="card-glow p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} style={{ color: SEVERITY_COLOR[sev] }} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{sev}</span>
            </div>
            <p className="text-4xl font-bold" style={{ color: SEVERITY_COLOR[sev] }}>
              {counts[sev]}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {total > 0 ? Math.round((counts[sev] / total) * 100) : 0}% of total
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-day trend */}
        <div className="card-glow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Alert Volume Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 days, daily event count</p>
            </div>
            {trendPercent !== null && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                trendPercent >= 0 ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
              }`}>
                {trendPercent >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(trendPercent)}% vs prior week
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top categories */}
        <div className="card-glow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-slate-200">Top Alert Categories</h3>
          </div>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No categorized alerts yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#38bdf8">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f43f5e" : "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Response readiness */}
      <div className="card-glow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Escalation Readiness</h3>
        </div>
        <p className="text-sm text-slate-400">
          {counts.CRITICAL + counts.HIGH} of {total} active alerts are Critical or High severity
          and require prioritized attention. Configure automated escalation thresholds in{" "}
          <span className="text-slate-300 font-medium">Settings</span>.
        </p>
      </div>
    </div>
  );
}