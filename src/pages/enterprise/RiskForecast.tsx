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
  Card, CardHeader, ErrorState, MethodologyNote, PageHeader, SelectField, SkeletonCard,
} from "../../components/ui";

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

  useEffect(() => {
    fetchCountries().then((d) => setCountries(d.countries));
  }, []);

  const req = useAsync<ForecastResult>(
    () => (selectedCode === "GLOBAL" ? fetchGlobalForecast() : fetchCountryForecast(selectedCode)),
    [selectedCode],
  );
  const { data: forecast, loading, error } = req;

  const trend = forecast ? TREND[forecast.trend] ?? TREND.stable : TREND.stable;
  const TrendIcon = trend.icon;

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
        description="Where threat activity is heading over the next 7 days, projected from the last 30 days of recorded events."
        actions={
          <SelectField value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)} aria-label="Forecast scope" className="w-64">
            <option value="GLOBAL">Global</option>
            {countries
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
          </SelectField>
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
                There are very few events for this scope, so the projected trend may not be meaningful. The global forecast
                gives a steadier signal.
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
                  Expected change over the next 7 days{forecast.country_name ? ` for ${forecast.country_name}` : ""}
                </p>
              </div>
              <p className="num text-4xl font-medium tracking-[-0.04em] text-ink">
                {forecast.expected_change_percent >= 0 ? "+" : ""}
                {forecast.expected_change_percent}%
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="30-day history and 7-day projection" description="Daily event count" />
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
                <Line type="monotone" dataKey="actual" name="Recorded events" stroke={th.c.ink2} strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" name="Projected events" stroke={th.c.accent} strokeWidth={2.25} strokeDasharray="6 5" dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-text-2">
              <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-ink-2" /> Recorded events</span>
              <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-accent" /> Projection</span>
              <span className="flex items-center gap-2"><span className="w-4 h-2.5 rounded-sm bg-accent/15" /> Confidence band</span>
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
