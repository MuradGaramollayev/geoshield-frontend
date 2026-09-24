import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchIncidents, fetchTimeline, formatAsOf, seriesFromDaily } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { SEVERITY_ORDER } from "../../design/tokens";
import { useTheme } from "../../design/themeContext";
import { ChartTooltip } from "../../design/ChartTooltip";
import { Card, CardHeader, ErrorState, MethodologyNote, PageHeader, SegmentGauge, SkeletonCard, TrendBadge } from "../../components/ui";

const OPEN = new Set(["NEW", "ASSIGNED", "INVESTIGATING"]);

export default function AlertOverview() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(() => Promise.all([fetchIncidents(), fetchTimeline(30)]), []);
  const [inc, tl] = data ?? [null, null];

  const open = useMemo(() => (inc?.incidents ?? []).filter((i) => OPEN.has(i.status)), [inc]);
  const counts = SEVERITY_ORDER.map((s) => ({ s, n: open.filter((i) => i.severity === s).length }));
  const urgent = counts[0].n + counts[1].n;

  const series = useMemo(
    () => seriesFromDaily(tl?.daily).map((d) => ({ date: d.date.slice(5), count: d.value })),
    [tl],
  );
  const last7 = series.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = series.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const change = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

  const categories = useMemo(() => {
    const m = new Map<string, number>();
    open.forEach((i) => i.attack_type && m.set(i.attack_type, (m.get(i.attack_type) ?? 0) + 1));
    return Array.from(m, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [open]);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Alert Overview"
        description="Where attention is needed now, and how threat activity has moved over the last 30 days of the dataset."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        {loading ? (
          <>
            <SkeletonCard className="lg:col-span-2" tall />
            <SkeletonCard className="lg:col-span-3" tall />
          </>
        ) : (
          <>
            <Card className="lg:col-span-2">
              <CardHeader title="Open alerts by severity" description="Incidents not yet resolved" />
              <SegmentGauge
                size={260}
                segments={counts.filter((c) => c.n > 0).map((c) => ({ value: c.n, color: th.sev[c.s].solid, label: th.sev[c.s].label }))}
                center={open.length}
                caption="open alerts"
              />
              <ul className="mt-4 space-y-3">
                {counts.map(({ s, n }) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-[4px]" style={{ background: th.sev[s].solid }} />
                    <span className="flex-1 text-base text-text-2">{th.sev[s].label}</span>
                    <span className="num text-xl text-ink">{n}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader
                title="Threat activity"
                description={`Daily CVE and C2 events, 30 days to ${formatAsOf(tl?.as_of)}`}
                actions={
                  change !== null ? (
                    <TrendBadge trend={change > 0 ? "up" : change < 0 ? "down" : "stable"}>
                      {change > 0 ? "+" : ""}
                      {change}% vs prior week
                    </TrendBadge>
                  ) : undefined
                }
              />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ao-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={th.c.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={th.c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={th.chart.gridStroke} vertical={false} />
                  <XAxis dataKey="date" tick={th.chart.axisTick} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={th.chart.axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name="Events" stroke={th.c.accent} strokeWidth={2} fill="url(#ao-fill)" animationDuration={700} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
          <Card>
            <CardHeader title="What the open alerts are about" description="Open incidents by attack type" />
            {categories.length === 0 ? (
              <p className="text-base text-text-3 py-10 text-center">No open alerts carry an attack type.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(140, categories.length * 44)}>
                <BarChart data={categories} layout="vertical" margin={{ left: 0, right: 16 }} barCategoryGap={12}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ ...th.chart.axisTick, fontSize: 13, fill: th.c.text2 }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: th.chart.cursor }} content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Open alerts" fill={th.c.ink2} radius={[0, 8, 8, 0]} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="flex flex-col">
            <CardHeader title="Response readiness" />
            <p className="text-3xl font-medium tracking-[-0.03em] text-ink num mb-2">
              {urgent} <span className="text-text-3 text-xl">of {open.length}</span>
            </p>
            <p className="text-base text-text-2 max-w-[48ch]">
              open alerts are critical or high severity and need prioritised attention from the security team.
            </p>
            <Link to="/enterprise/team" className="mt-auto pt-6 text-sm font-semibold text-accent-ink hover:underline">
              Review who is on the response team
            </Link>
          </Card>
        </div>
      )}

      <MethodologyNote>
        <p>Open alerts are incidents whose status is New, Assigned or Investigating, grouped by the severity the incident was raised with.</p>
        <p>
          Threat activity counts CISA KEV and Feodo C2 timeline events per day, for the 30 days ending on the dataset date.
          The weekly change compares the last 7 days with the 7 before. C2 events use placeholder dates, so read the curve as
          direction rather than exact daily counts.
        </p>
      </MethodologyNote>
    </div>
  );
}
