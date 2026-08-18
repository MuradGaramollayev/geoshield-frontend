import { useEffect, useState } from "react";
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Info, Globe2, AlertTriangle } from "lucide-react";
import { fetchGlobalForecast, fetchCountryForecast, fetchCountries } from "../../services/api";
import type { ForecastResult, CountryRisk } from "../../services/api";

const TREND_CONFIG = {
  up: { color: "#f43f5e", icon: TrendingUp, label: "Trending Up" },
  down: { color: "#34d399", icon: TrendingDown, label: "Trending Down" },
  stable: { color: "#38bdf8", icon: Minus, label: "Stable" },
};

export default function RiskForecast() {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("GLOBAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries().then((d) => setCountries(d.countries));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const promise = selectedCode === "GLOBAL"
      ? fetchGlobalForecast()
      : fetchCountryForecast(selectedCode);
    promise
      .then(setForecast)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCode]);

  if (loading && !forecast) return <div className="p-8 text-slate-400 text-sm">Loading forecast...</div>;
  if (error) return <div className="p-8 text-rose-400 text-sm">Error: {error}</div>;
  if (!forecast) return null;

  const trendCfg = TREND_CONFIG[forecast.trend] || TREND_CONFIG.stable;
  const TrendIcon = trendCfg.icon;

  const chartData = [
    ...forecast.history.map((h) => ({
      date: h.date.slice(5),
      actual: h.count,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    })),
    ...forecast.forecast.map((f) => ({
      date: f.date.slice(5),
      actual: null as number | null,
      predicted: f.predicted,
      lower: f.lower_bound,
      upper: f.upper_bound,
    })),
  ];

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Risk Forecast</h1>
        <p className="text-sm text-slate-500 mt-1">
          Predictive threat trend, based on 30 days of real event history
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Globe2 size={16} className="text-slate-500" />
        <select
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
        >
          <option value="GLOBAL">Global</option>
          {countries
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
        </select>
      </div>

      {forecast.low_data_warning && (
        <div className="card-glow p-4 flex items-start gap-3 border-amber-500/30">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">
            Event volume for this scope is very low, the trend below may not be
            statistically meaningful. Consider viewing the Global forecast for a
            more reliable signal.
          </p>
        </div>
      )}

      <div className="card-glow p-6 flex items-center gap-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${trendCfg.color}15`, border: `1px solid ${trendCfg.color}30` }}
        >
          <TrendIcon size={28} style={{ color: trendCfg.color }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: trendCfg.color }}>
            {trendCfg.label}
          </p>
          <p className="text-sm text-slate-400">
            {forecast.expected_change_percent >= 0 ? "+" : ""}
            {forecast.expected_change_percent}% expected change over the next 7 days
            {forecast.country_name ? ` for ${forecast.country_name}` : ""}
          </p>
        </div>
      </div>

      <div className="card-glow p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          30-Day History + 7-Day Forecast
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#38bdf8" fillOpacity={0.08} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#0f172a" fillOpacity={1} />
            <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} dot={false} connectNulls={false} />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" /> Actual history
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-sky-400" /> Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-sky-400/10 border border-sky-400/30" /> Confidence band
          </span>
        </div>
      </div>

      <div className="card-glow p-4 flex items-start gap-3">
        <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">{forecast.methodology}</p>
      </div>
    </div>
  );
}