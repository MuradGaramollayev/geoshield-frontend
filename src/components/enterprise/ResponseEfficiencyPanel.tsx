import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { fetchIncidents, computeMeanResponseMinutes, computeCriticalHighRatio } from "../../services/api";
import type { Incident } from "../../services/api";

export default function ResponseEfficiencyPanel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data.incidents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card-glow p-6 text-slate-500 text-sm">Loading efficiency data...</div>;
  if (error) return <div className="card-glow p-6 text-rose-400 text-sm">Error: {error}</div>;

  const total = incidents.length;
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const meanResponse = computeMeanResponseMinutes(incidents);
  const criticalRatio = computeCriticalHighRatio(incidents);
  const withEvidence = incidents.filter((i) => i.evidence.length > 0).length;
  const evidenceRate = total > 0 ? Math.round((withEvidence / total) * 100) : 0;

  return (
    <div className="card-glow p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-200">Detection & Response Efficiency</h3>
        <p className="text-xs text-slate-500 mt-0.5">Derived from {total} tracked incidents</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Resolution Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{resolvedRate}%</p>
          <p className="text-[10px] text-slate-600 mt-1">{resolved} of {total} incidents resolved</p>
        </div>

        <div className="bg-slate-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} className="text-sky-400" />
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Mean Response</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {meanResponse !== null ? `${meanResponse}m` : "—"}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            {meanResponse !== null ? "avg. time to status change" : "no resolved incidents yet"}
          </p>
        </div>

        <div className="bg-slate-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-rose-400" />
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Critical/High Load</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{criticalRatio}%</p>
          <p className="text-[10px] text-slate-600 mt-1">of active incident volume</p>
        </div>

        <div className="bg-slate-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-violet-400" />
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Evidence Coverage</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{evidenceRate}%</p>
          <p className="text-[10px] text-slate-600 mt-1">incidents with supporting evidence</p>
        </div>
      </div>
    </div>
  );
}