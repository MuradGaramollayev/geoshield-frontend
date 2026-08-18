import { useEffect, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip,
} from "recharts";
import { fetchTimeline, buildRadarData } from "../../services/api";
import type { RadarCategory } from "../../services/api";

export default function AttackCategoryRadar() {
  const [data, setData] = useState<RadarCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline(21)
      .then((res) => setData(buildRadarData(res.events)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card-glow p-6 text-slate-500 text-sm">Loading radar...</div>;
  if (error) return <div className="card-glow p-6 text-rose-400 text-sm">Error: {error}</div>;

  return (
    <div className="card-glow p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Attack Category Comparison</h3>
        <p className="text-xs text-slate-500 mt-0.5">This week vs. last week</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.15)" />
          <PolarAngleAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: "#475569", fontSize: 9 }} />
          <Radar
            name="Last Week"
            dataKey="lastWeek"
            stroke="#64748b"
            fill="#64748b"
            fillOpacity={0.15}
          />
          <Radar
            name="This Week"
            dataKey="thisWeek"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend
            formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}