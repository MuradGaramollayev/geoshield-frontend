import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { fetchCountries, fetchCountryForecast, fetchGlobalForecast } from "../../services/api";
import type { CountryRisk, ForecastResult } from "../../services/api";
import { useTheme } from "../../design/themeContext";
import { ChartTooltip } from "../../design/ChartTooltip";
import {
  Card, CardHeader, ErrorState, KeyValue, MethodologyNote, PageHeader, Segmented, SelectField, SkeletonCard,
} from "../../components/ui";

const WINDOWS = [
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "180", label: "180d" },
  { value: "365", label: "365d" },
];

const TREND = {
  up: { icon: TrendingUp, label: "Exposure is rising", tone: "bg-accent-100 text-accent-ink" },
  down: { icon: TrendingDown, label: "Exposure is easing", tone: "bg-positive-tint text-positive" },
  stable: { icon: Minus, label: "Exposure is holding steady", tone: "bg-sunken text-text-2" },
};

export default function RiskForecast() {
  const th = useTheme();
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [params] = useSearchParams();
  const [selectedCode, setSelectedCode] = useState<string>(params.get("country") ?? "GLOBAL");
  const [windowDays, setWindowDays] = useState("90");

  useEffect(() => {
    fetchCountries().then((d) => setCountries(d.countries));
  }, []);

  const req = useAsync<ForecastResult>(
    () =>
      selectedCode === "GLOBAL"
        ? fetchGlobalForecast(Number(windowDays))
        : fetchCountryForecast(selectedCode, Number(windowDays)),
    [selectedCode, windowDays],
  );
  const { data: forecast, loading, error } = req;

  const trend = forecast ? TREND[forecast.trend] ?? TREND.stable : TREND.stable;
  const TrendIcon = trend.icon;

  // One marker per recorded day, so it is visible that the line is fitted to
  // individual real observations. The radius shrinks as the window grows, or
  // 365 daily points would merge into a band.
  const points = forecast?.history.length ?? 0;
  const pointRadius = points <= 60 ? 2.6 : points <= 120 ? 1.9 : 1.2;

  const chartData = forecast
    ? [
        ...forecast.history.map((h) => ({ date: h.date.slice(5), actual: h.count, predicted: null as number | null, band: null as [number, number] | null })),
        ...forecast.forecast.map((f) => ({ date: f.date.slice(5), actual: null as number | null, predicted: f.predicted, band: [f.lower_bound, f.upper_bound] as [number, number] })),
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Risk Forecast"
        description="Where threat activity is heading over the next 7 days, projected from real dated history."
        actions={
          <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={WINDOWS}
            value={windowDays}
            onChange={setWindowDays}
            size="sm"
            ariaLabel="History window"
          />
          <SelectField value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)} aria-label="Forecast scope" className="w-64">
            <option value="GLOBAL">Global</option>
            {countries
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
          </SelectField>
          </div>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={req.reload} />
      ) : !forecast ? (
        <SkeletonCard tall />
      ) : (
        <div className={`space-y-[var(--gap-grid)] transition-opacity duration-[var(--dur)] ${loading ? "opacity-50" : ""}`}>
          {forecast.low_data_warning && (
            <div role="note" className="flex items-start gap-3 rounded-[16px] bg-caution-tint px-5 py-4">
              <AlertTriangle size={18} className="text-caution shrink-0 mt-0.5" />
              <p className="text-base text-caution">
                {forecast.low_data_reason ||
                  "There are too few dated events in this window to read a direction from."}
              </p>
            </div>
          )}

          <Card>
            <div className="flex flex-wrap items-center gap-6">
              <span className={`w-16 h-16 rounded-[18px] inline-flex items-center justify-center ${trend.tone}`}>
                <TrendIcon size={28} />
              </span>
              <div className="flex-1 min-w-[240px]">
                <p className="text-xl font-semibold text-ink tracking-[-0.01em]">{trend.label}</p>
                <p className="text-base text-text-2">
                  {forecast.series_source === "country"
                    ? `Expected change in ${forecast.country_name}'s own daily event volume over the next 7 days`
                    : "Expected change in daily event volume over the next 7 days"}
                </p>
                {forecast.change_is_global && (
                  <p className="text-sm text-text-3 mt-1">
                    This is the global direction. There is no per-country daily series in the data, so only
                    the level below is scaled &mdash; by {forecast.country_name}&apos;s{" "}
                    {forecast.basis.share_percent}% share of indicators.
                  </p>
                )}
              </div>
              <p className="num text-4xl font-medium tracking-[-0.04em] text-ink">
                {forecast.expected_change_percent >= 0 ? "+" : ""}
                {forecast.expected_change_percent}%
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={`${forecast.basis.window_days}-day history and 7-day projection`}
              description={`${forecast.series_label ?? "Daily event count"}, to ${forecast.basis.anchor ?? ""}`}
            />
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke={th.chart.gridStroke} vertical={false} />
                <XAxis dataKey="date" tick={th.chart.axisTick} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={th.chart.axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                <Tooltip
                  content={
                    <ChartTooltip
                      format={(v) => (Array.isArray(v) ? `${(v as number[])[0]}–${(v as number[])[1]}` : String(v))}
                    />
                  }
                />
                <Area type="monotone" dataKey="band" name="Confidence band" stroke="none" fill={th.c.accent} fillOpacity={0.14} isAnimationActive={false} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Recorded events"
                  stroke={th.c.ink2}
                  strokeWidth={2}
                  dot={{ r: pointRadius, fill: th.c.ink2, stroke: "none" }}
                  activeDot={{ r: 4.5, fill: th.c.ink2, stroke: th.c.surface, strokeWidth: 2 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                <Line type="monotone" dataKey="predicted" name="Projected events" stroke={th.c.accent} strokeWidth={2.25} strokeDasharray="6 5" dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-text-2">
              <span className="flex items-center gap-2">
                <span className="relative inline-block w-4 h-0.5 bg-ink-2">
                  <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-2" />
                </span>
                Recorded events · one point per day
              </span>
              <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-accent" /> Projection</span>
              <span className="flex items-center gap-2"><span className="w-4 h-2.5 rounded-sm bg-accent/15" /> Confidence band</span>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="What this rests on"
              description="The evidence behind the projection, stated so the numbers above can be checked."
            />
            <div className="grid gap-x-8 sm:grid-cols-2">
              <KeyValue
                label={`Dated events in the last ${forecast.basis.window_days} days`}
                value={`${forecast.basis.dated_events} across ${forecast.basis.active_days} active days`}
              />
              <KeyValue
                label="Undated rows excluded"
                value={
                  forecast.basis.undated_events_excluded === 0
                    ? "none"
                    : `${forecast.basis.undated_events_excluded} C2 rows (no date in the feed)`
                }
              />
              {forecast.basis.country_history_days !== undefined && forecast.series_source === "country" && (
                <KeyValue
                  label="This country's own dated history"
                  value={`${forecast.basis.country_history_days} active days, ${forecast.basis.country_history_first} to ${forecast.basis.country_history_last}`}
                />
              )}
              {forecast.basis.country_indicators !== undefined && (
                <KeyValue
                  label="This country's indicators"
                  value={`${forecast.basis.country_indicators.toLocaleString()} · ${forecast.basis.share_percent}% of all`}
                />
              )}
              {forecast.basis.recorded_history_days !== undefined && (
                <KeyValue
                  label="Recorded risk-score history"
                  value={
                    forecast.basis.recorded_history_days > 0
                      ? `${forecast.basis.recorded_history_days} daily snapshot(s), ${forecast.basis.recorded_trend}`
                      : "no snapshots yet"
                  }
                />
              )}
            </div>
          </Card>

          <MethodologyNote>
            <p>{forecast.methodology}</p>
          </MethodologyNote>
        </div>
      )}
    </div>
  );
}
