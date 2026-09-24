import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bug, Globe2, ShieldAlert, Skull } from "lucide-react";
import { fetchCountries, fetchMitreMatrix, fetchTimeline } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { EMPTY } from "../utils/empty";
import { SEVERITY_ORDER, toSeverity } from "../design/tokens";
import { useTheme } from "../design/themeContext";
import { ChartTooltip } from "../design/ChartTooltip";
import RiskScoreNote from "../components/common/RiskScoreNote";
import { Card, CardHeader, ErrorState, PageHeader, SkeletonCard, StatTile } from "../components/ui";

export default function Analytics() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([fetchCountries(), fetchMitreMatrix(), fetchTimeline(90)]),
    [],
  );
  const [countriesRes, matrix, timeline] = data ?? [null, null, null];
  const countries = countriesRes?.countries ?? EMPTY;
  const events = timeline?.events ?? [];

  const top = useMemo(
    () =>
      [...countries]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 12)
        .map((c) => ({ code: c.code, name: c.name, risk: c.risk_score, level: c.risk_level })),
    [countries],
  );
  const dist = SEVERITY_ORDER.map((s) => ({ s, n: countries.filter((c) => c.risk_level === s).length }));
  const techniques = useMemo(
    () =>
      (matrix?.tactics.flatMap((t) => t.techniques) ?? [])
        .sort((a, b) => b.our_count - a.our_count)
        .slice(0, 10)
        .map((t) => ({ id: t.id, name: t.name, count: t.our_count, severity: t.severity })),
    [matrix],
  );

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={
          countriesRes
            ? `Aggregates across ${countriesRes.count} countries and ${(timeline?.count ?? 0).toLocaleString()} timeline events (90 days).`
            : "Aggregates across countries, techniques and timeline events."
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={0} />)
        ) : (
          <>
            <StatTile icon={<Globe2 size={16} />} label="Countries tracked" value={countries.length} />
            <StatTile icon={<ShieldAlert size={16} />} label="Timeline events, 90 days" value={events.length} delay={0.03} />
            <StatTile icon={<Bug size={16} />} label="CVE exploits" value={events.filter((e) => e.type === "CVE_EXPLOIT").length} delay={0.06} />
            <StatTile
              icon={<Skull size={16} />}
              label="Ransomware-linked"
              value={events.filter((e) => e.ransomware).length}
              valueTone={th.sev.CRITICAL.text}
              delay={0.09}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        <Card className="xl:col-span-3">
          <CardHeader title="Highest-risk countries" description="Top 12 by risk score, coloured by severity band" />
          {loading ? (
            <div className="skeleton h-[340px] rounded-[14px]" />
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={top} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }} barCategoryGap={6}>
                <CartesianGrid stroke={th.chart.gridStroke} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={th.chart.axisTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="code" tick={th.chart.axisTickMono} width={34} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: th.chart.cursor }}
                  content={<ChartTooltip labelFormat={(l) => top.find((t) => t.code === l)?.name ?? l} format={(v) => `${v} / 100`} />}
                />
                <Bar dataKey="risk" name="Risk score" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={500}>
                  {top.map((t) => (
                    <Cell key={t.code} fill={th.sev[toSeverity(t.level) ?? "LOW"].solid} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Countries by severity band" description="How the 124 monitored countries are distributed" />
          {loading ? (
            <div className="skeleton h-[340px] rounded-[14px]" />
          ) : (
            <div>
              <div className="flex h-4 rounded-full overflow-hidden mb-6 gap-0.5">
                {dist.filter((d) => d.n > 0).map((d) => (
                  <span key={d.s} style={{ width: `${(d.n / countries.length) * 100}%`, background: th.sev[d.s].solid }} title={`${th.sev[d.s].label}: ${d.n}`} />
                ))}
              </div>
              <ul className="divide-y divide-line">
                {dist.map((d) => (
                  <li key={d.s} className="flex items-center gap-3 py-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: th.sev[d.s].solid }} />
                    <span className="flex-1 text-base text-ink">{th.sev[d.s].label}</span>
                    <span className="num text-xl font-medium text-ink">{d.n}</span>
                    <span className="num text-sm text-text-3 w-12 text-right">
                      {countries.length ? Math.round((d.n / countries.length) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-[var(--gap-grid)]">
        <CardHeader title="ATT&CK techniques by attributed volume" description="Top 10; see MITRE ATT&CK for how indicators are attributed" />
        {loading ? (
          <div className="skeleton h-[280px] rounded-[14px]" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={techniques} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barCategoryGap={10}>
              <CartesianGrid stroke={th.chart.gridStroke} vertical={false} />
              <XAxis dataKey="id" tick={th.chart.axisTickMono} axisLine={false} tickLine={false} />
              <YAxis tick={th.chart.axisTick} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                cursor={{ fill: th.chart.cursor }}
                content={<ChartTooltip labelFormat={(l) => `${l} · ${techniques.find((t) => t.id === l)?.name ?? ""}`} />}
              />
              <Bar dataKey="count" name="Attributed indicators" radius={[6, 6, 0, 0]} animationDuration={500}>
                {techniques.map((t) => (
                  <Cell key={t.id} fill={th.sev[toSeverity(t.severity) ?? "LOW"].solid} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <RiskScoreNote />
    </div>
  );
}
