import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BellRing, Clock, ShieldAlert, Skull } from "lucide-react";
import {
  computeCriticalHighRatio, computeMeanResponseMinutes, fetchCountries, fetchIncidents, fetchStatus, fetchTimeline,
} from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { SEVERITY } from "../../design/tokens";
import { useMotion } from "../../design/panel";
import { getUser } from "../../utils/auth";
import RiskIndexCard from "../../components/common/RiskIndexCard";
import RiskScoreNote from "../../components/common/RiskScoreNote";
import WorldMap from "../../components/charts/WorldMap";
import { Card, CardHeader, ErrorState, SeverityBadge, Skeleton, SkeletonCard, StatTile } from "../../components/ui";

const OPEN = new Set(["NEW", "ASSIGNED", "INVESTIGATING"]);

export default function EnterpriseDashboard() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([fetchStatus(), fetchCountries(), fetchIncidents(), fetchTimeline(90)]),
    [],
  );
  const [status, countries, inc, tl] = data ?? [null, null, null, null];
  const m = useMotion();
  const user = getUser();

  const top = useMemo(() => [...(countries?.countries ?? [])].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8), [countries]);
  const incidents = inc?.incidents ?? [];
  const open = incidents.filter((i) => OPEN.has(i.status)).length;
  const ransomware = (tl?.events ?? []).filter((e) => e.ransomware).length;

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-[var(--gap-grid)]">
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: m.enter, ease: m.ease }}
        className="mb-2"
      >
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
          {user ? `Welcome back, ${user.firstName}` : "Strategic overview"}
        </h1>
        <p className="text-md text-text-2 mt-1 max-w-2xl">
          Your organisation's external threat exposure at a glance: overall risk, where it comes from, and how the team is responding.
        </p>
      </motion.header>

      {loading || !status ? <Skeleton className="h-56 rounded-[20px]" /> : <RiskIndexCard status={status} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[var(--gap-grid)]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
        ) : (
          <>
            <StatTile icon={<BellRing size={18} />} label="Open alerts" value={open} footer={`${incidents.length} incidents tracked`} />
            <StatTile
              icon={<ShieldAlert size={18} />}
              label="Critical or high incidents"
              value={computeCriticalHighRatio(incidents)}
              suffix="%"
              footer="Share of all tracked incidents"
              delay={0.07}
            />
            <StatTile
              icon={<Clock size={18} />}
              label="Mean time to latest update"
              value={computeMeanResponseMinutes(incidents)}
              suffix="min"
              footer={computeMeanResponseMinutes(incidents) === null ? "No incident has moved past New yet" : "Created → most recent status change"}
              delay={0.14}
            />
            <StatTile
              icon={<Skull size={18} />}
              label="Ransomware-linked CVEs"
              value={ransomware}
              valueTone={ransomware ? SEVERITY.CRITICAL.text : undefined}
              footer="Added to CISA KEV, last 90 days"
              delay={0.21}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-[var(--gap-grid)]">
        <div className="2xl:col-span-2">
          <WorldMap title="Where exposure comes from" description="Countries coloured by risk score. Select one for a strategic summary." />
        </div>
        <Card>
          <CardHeader
            title="Highest-exposure countries"
            actions={<Link to="/enterprise/analytics" className="text-sm font-semibold text-accent-ink hover:underline">Analytics</Link>}
          />
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : (
            <ol className="divide-y divide-line">
              {top.map((c, i) => (
                <li key={c.code} className="flex items-center gap-4 py-3">
                  <span className="num text-sm text-text-3 w-5">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-base font-semibold text-ink truncate">{c.name}</span>
                    <span className="block text-sm text-text-3">{c.total_threats.toLocaleString()} indicators</span>
                  </span>
                  <span className="num text-lg font-medium text-ink">{c.risk_score}</span>
                  <SeverityBadge severity={c.risk_level} />
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <RiskScoreNote />
    </div>
  );
}
