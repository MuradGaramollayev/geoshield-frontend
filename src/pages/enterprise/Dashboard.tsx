import { useEffect, useState } from "react";
import { ShieldAlert, Globe, Clock, AlertOctagon } from "lucide-react";
import EnterpriseRiskBanner from "../../components/enterprise/EnterpriseRiskBanner";
import EnterpriseKpiCard from "../../components/enterprise/EnterpriseKpiCard";
import EnterpriseWorldMap from "../../components/enterprise/EnterpriseWorldMap";
import {
  fetchStatus,
  fetchCountries,
  fetchIncidents,
  computeMeanResponseMinutes,
  computeCriticalHighRatio,
} from "../../services/api";
import type { StatusData, CountryRisk } from "../../services/api";

function riskLevel(score: number): "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL" {
  if (score < 20) return "LOW";
  if (score < 40) return "MODERATE";
  if (score < 60) return "ELEVATED";
  if (score < 80) return "HIGH";
  return "CRITICAL";
}

export default function EnterpriseDashboard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [meanResponse, setMeanResponse] = useState<number | null>(null);
  const [criticalRatio, setCriticalRatio] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchCountries(), fetchIncidents()])
      .then(([statusRes, countriesRes, incidentsRes]) => {
        setStatus(statusRes);
        setCountries(countriesRes.countries);
        setMeanResponse(computeMeanResponseMinutes(incidentsRes.incidents));
        setCriticalRatio(computeCriticalHighRatio(incidentsRes.incidents));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 text-rose-400 text-sm">
        Failed to connect to backend: {error}
      </div>
    );
  }

  if (!status) {
    return <div className="p-6 text-slate-400 text-sm">Loading executive summary...</div>;
  }

  const { countries: countryCount, total_threats, avg_risk } = status.data;

  const top10 = [...countries]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Strategic overview across {countryCount} monitored countries
        </p>
      </div>

      <EnterpriseRiskBanner
        score={avg_risk}
        level={riskLevel(avg_risk)}
        countriesTracked={countryCount}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Global Risk Index"
          value={avg_risk}
          icon={ShieldAlert}
          accentColor="#38bdf8"
          delay={0.1}
        />
        <EnterpriseKpiCard
          label="Active Threat Indicators"
          value={total_threats.toLocaleString()}
          icon={Globe}
          accentColor="#34d399"
          delay={0.15}
        />
        <EnterpriseKpiCard
          label="Mean Response Time"
          value={meanResponse !== null ? `${meanResponse}m` : "—"}
          icon={Clock}
          trendLabel={meanResponse !== null ? "avg. across resolved incidents" : "no resolved incidents yet"}
          accentColor="#a78bfa"
          delay={0.2}
        />
        <EnterpriseKpiCard
          label="Critical/High Ratio"
          value={`${criticalRatio}%`}
          icon={AlertOctagon}
          trendLabel="of active incidents"
          accentColor="#f43f5e"
          delay={0.25}
        />
      </div>

      <EnterpriseWorldMap />

      <div className="card-glow p-6">
        <h3 className="text-base font-semibold text-slate-100 mb-4">Top 10 Risk Countries</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
              <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
              <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trend</th>
              <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Threat</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((c, i) => (
              <tr key={c.code} className="border-b border-slate-800/60">
                <td className="py-3 text-slate-500 font-mono text-xs">#{i + 1}</td>
                <td className="py-3 text-slate-200 font-medium">{c.name}</td>
                <td className="py-3">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: c.risk_level === "CRITICAL" ? "#f43f5e" :
                             c.risk_level === "HIGH" ? "#fb923c" :
                             c.risk_level === "MEDIUM" ? "#fbbf24" : "#34d399",
                    }}
                  >
                    {c.risk_score}
                  </span>
                </td>
                <td className="py-3 text-slate-400 capitalize">{c.trend}</td>
                <td className="py-3 text-slate-400">{c.primary_attack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}