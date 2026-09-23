import { AlertTriangle, Bug, Radio, Skull } from "lucide-react";
import { buildSparkline, fetchStatus, fetchTimeline, formatAsOf } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useTheme } from "../design/themeContext";
import RiskIndexCard from "../components/common/RiskIndexCard";
import RiskScoreNote from "../components/common/RiskScoreNote";
import HexRiskMap from "../components/map/HexRiskMap";
import ActivityFeed from "../components/common/ActivityFeed";
import { ErrorState, PageHeader, Skeleton, SkeletonCard, Sparkline, StatTile } from "../components/ui";

const DAYS = 14;

export default function Dashboard() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(() => Promise.all([fetchStatus(), fetchTimeline(DAYS)]), []);
  const [status, tl] = data ?? [null, null];
  const ev = tl?.events ?? [];
  const asOf = tl?.as_of;
  const window = asOf ? `${DAYS} days to ${formatAsOf(asOf)}` : `${DAYS} days`;

  const tiles = [
    { label: "Timeline events", icon: <AlertTriangle size={16} />, f: () => true, color: th.c.ink2 },
    { label: "CVE exploits", icon: <Bug size={16} />, f: (e: { type: string }) => e.type === "CVE_EXPLOIT", color: th.c.accent },
    { label: "C2 servers", icon: <Radio size={16} />, f: (e: { type: string }) => e.type === "C2_DETECTED", color: th.sev.HIGH.solid },
    { label: "Critical events", icon: <Skull size={16} />, f: (e: { severity: string }) => e.severity === "CRITICAL", color: th.sev.CRITICAL.solid },
  ];

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader title="Threat overview" description="Global risk posture, recent activity and the country map, from the current dataset." />

      {loading || !status ? <Skeleton className="h-40 rounded-[20px]" /> : <RiskIndexCard status={status} />}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[var(--gap-grid)]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
          : tiles.map((t, i) => {
              const series = buildSparkline(ev, DAYS, t.f, asOf);
              return (
                <StatTile
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  value={series.reduce((s, d) => s + d.value, 0)}
                  spark={<Sparkline id={`dash-${i}`} data={series} stroke={t.color} height={36} />}
                  footer={window}
                  delay={i * 0.03}
                />
              );
            })}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-[var(--gap-grid)]">
        <HexRiskMap height={440} />
        <ActivityFeed height={440} limit={9} />
      </div>

      <RiskScoreNote />
    </div>
  );
}
