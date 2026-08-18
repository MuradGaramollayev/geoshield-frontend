import { useEffect, useState } from "react";
import RiskBanner from "../components/common/RiskBanner";
import MetricCard from "../components/common/MetricCard";
import WorldMap from "../components/charts/WorldMap";
import {
  fetchStatus,
  fetchTimeline,
  buildSparkline,
} from "../services/api";
import type { StatusData, TimelineEvent } from "../services/api";
import { ShieldAlert, Globe, AlertTriangle, Radar } from "lucide-react";

function riskLevel(score: number): "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL" {
  if (score < 20) return "LOW";
  if (score < 40) return "MODERATE";
  if (score < 60) return "ELEVATED";
  if (score < 80) return "HIGH";
  return "CRITICAL";
}

const SPARKLINE_DAYS = 14;

export default function Dashboard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchTimeline(SPARKLINE_DAYS)])
      .then(([statusRes, timelineRes]) => {
        setStatus(statusRes);
        setEvents(timelineRes.events);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 text-rose-400">
        Could not connect to backend: {error}
        <br />
        <span className="text-slate-500 text-sm">
          Make sure `python start.py` is running (http://localhost:8000)
        </span>
      </div>
    );
  }

  if (!status) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  const { countries, total_threats, avg_risk, critical, high, sources } = status.data;

  const allSparkline = buildSparkline(events, SPARKLINE_DAYS);
  const criticalSparkline = buildSparkline(
    events, SPARKLINE_DAYS, (e) => e.severity === "CRITICAL"
  );
  const highSparkline = buildSparkline(
    events, SPARKLINE_DAYS, (e) => e.severity === "HIGH"
  );

  return (
    <div className="p-6 space-y-6">
      <RiskBanner
        score={avg_risk}
        level={riskLevel(avg_risk)}
        topCountry={`${countries} countries monitored`}
        activeIndicators={total_threats}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Threat Indicators"
          value={total_threats.toLocaleString()}
          icon={ShieldAlert}
          trendLabel={`from ${sources} sources`}
          sparklineData={allSparkline}
          accentColor="#38bdf8"
          delay={0.1}
        />
        <MetricCard
          label="Countries Monitored"
          value={countries}
          icon={Globe}
          trendLabel="global coverage"
          sparklineData={allSparkline}
          accentColor="#34d399"
          delay={0.15}
        />
        <MetricCard
          label="Critical Events"
          value={critical}
          icon={AlertTriangle}
          trendLabel={`last ${SPARKLINE_DAYS} days`}
          sparklineData={criticalSparkline}
          accentColor="#f43f5e"
          delay={0.2}
        />
        <MetricCard
          label="High Risk Events"
          value={high}
          icon={Radar}
          trendLabel={`last ${SPARKLINE_DAYS} days`}
          sparklineData={highSparkline}
          accentColor="#fbbf24"
          delay={0.25}
        />
      </div>

      <WorldMap />
    </div>
  );
}