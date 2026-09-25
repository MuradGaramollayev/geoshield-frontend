import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { fetchCountries, fetchStatus, formatAsOf } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { severityForScore } from "../../design/tokens";
import { Button, CountUp, SeverityBadge, Skeleton } from "../ui";
import { revealStyle, useReveal } from "./reveal";
import HexField from "./HexField";

/**
 * Hero. The headline sits over a cursor-reactive hexagon field; the panel
 * beside it shows the live global index and the real top origins, so the first
 * thing a visitor sees is the product's own data rather than a mockup.
 */
export default function Hero() {
  const th = useTheme();
  const { ref, shown } = useReveal<HTMLDivElement>(0.05);
  const status = useAsync(fetchStatus, []);
  const countries = useAsync(fetchCountries, []);

  const top = [...(countries.data?.countries ?? [])]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);
  const index = status.data?.data.avg_risk;

  return (
    <div className="relative overflow-hidden">
      <HexField className="absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
        style={{ background: `radial-gradient(circle, ${th.c.accent} 0%, transparent 65%)` }}
      />

      <div ref={ref} className="relative mx-auto max-w-6xl px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div style={revealStyle(shown)}>
            <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 shadow-[var(--shadow-e2)]">
              <span className="live-dot" />
              <span className="code text-2xs uppercase tracking-[0.14em] text-text-2">
                {status.data ? `${status.data.data.sources} live sources · data as of ${formatAsOf(status.data.as_of)}` : "Connecting to feeds"}
              </span>
            </span>

            <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.04] tracking-tight text-ink text-balance">
              Know where the next attack<span className="text-accent-ink"> comes from</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-2">
              GeoShield aggregates nine live threat intelligence feeds into one country-level
              risk picture, so you can see which regions, vectors and infrastructure are
              trending before they reach your perimeter.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button variant="accent" size="lg" iconRight={<ArrowRight size={17} />}>
                  Open the console
                </Button>
              </Link>
              <a href="#live">
                <Button variant="secondary" size="lg" icon={<Radio size={16} />}>
                  See it on live data
                </Button>
              </a>
            </div>

            <p className="mt-6 text-sm text-text-3">
              No simulated data anywhere in the product. Every number traces to a named source.
            </p>
          </div>

          <aside
            className="e3 rounded-[20px] p-6"
            style={revealStyle(shown, 2)}
            aria-label="Live global risk"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-text-2">Global risk index</p>
              {index !== undefined && <SeverityBadge severity={severityForScore(index)} size="xs" />}
            </div>

            {status.loading || index === undefined ? (
              <Skeleton className="mt-3 h-14 w-32 rounded-[12px]" />
            ) : (
              <p className="num mt-2 text-4xl font-semibold tracking-tight text-ink">
                <CountUp value={index} decimals={1} />
              </p>
            )}
            <p className="mt-1 text-2xs text-text-3">
              Volume-weighted across {status.data?.data.countries ?? "—"} countries
            </p>

            <div className="mt-6 space-y-3">
              <p className="code text-2xs uppercase tracking-[0.14em] text-text-3">Highest risk origins</p>
              {countries.loading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 rounded-[10px]" />)
                : top.map((c) => (
                    <div key={c.code} className="group flex items-center gap-3">
                      <span className="code w-7 shrink-0 text-2xs text-text-3">{c.code}</span>
                      <span className="flex-1 truncate text-sm text-ink">{c.name}</span>
                      <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-well">
                        <span
                          className="block h-full rounded-full transition-[width] duration-700"
                          style={{ width: `${c.risk_score}%`, background: th.riskColor(c.risk_score) }}
                        />
                      </span>
                      <span className="num w-10 shrink-0 text-right text-sm font-semibold text-ink">
                        {c.risk_score.toFixed(1)}
                      </span>
                    </div>
                  ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
