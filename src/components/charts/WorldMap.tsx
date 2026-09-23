import { memo, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { fetchCountries } from "../../services/api";
import type { CountryRisk } from "../../services/api";
import { isoNumericToAlpha2 } from "../../data/isoNumericToAlpha2";
import { useTheme } from "../../design/themeContext";
import { useAsync } from "../../hooks/useAsync";
import CountryDetailPanel from "./CountryDetailPanel";
import { Card, CardHeader, ErrorState, SeverityBadge, Skeleton } from "../ui";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Hover {
  c: CountryRisk;
  x: number;
  y: number;
}

const Shapes = memo(function Shapes({
  byCode,
  onHover,
  onSelect,
}: {
  byCode: Record<string, CountryRisk>;
  onHover: (h: Hover | null) => void;
  onSelect: (code: string) => void;
}) {
  const th = useTheme();
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => {
          const a2 = isoNumericToAlpha2[String(geo.id).padStart(3, "0")];
          const c = a2 ? byCode[a2] : undefined;
          const fill = c ? th.riskColor(c.risk_score) : th.c.noData;
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseMove={(e) => c && onHover({ c, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseLeave={() => onHover(null)}
              onClick={() => c && onSelect(c.code)}
              style={{
                default: { fill, stroke: th.c.surface, strokeWidth: 0.5, outline: "none", transition: "fill 200ms, opacity 200ms" },
                hover: { fill, stroke: th.c.ink, strokeWidth: c ? 1 : 0.5, outline: "none", cursor: c ? "pointer" : "default" },
                pressed: { fill, outline: "none" },
              }}
            />
          );
        })
      }
    </Geographies>
  );
});

/** Global risk choropleth (Section 1 styling; replaced by the hex map in Section 3). */
export default function WorldMap({ title = "Global risk map", description }: { title?: string; description?: string }) {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(fetchCountries, []);
  const [hover, setHover] = useState<Hover | null>(null);
  const [params, setParams] = useSearchParams();
  const selected = params.get("country"); // selection lives in the URL so it can be deep-linked

  const byCode = useMemo(() => Object.fromEntries((data?.countries ?? []).map((c) => [c.code, c])), [data]);
  const select = (code: string | null) => {
    const next = new URLSearchParams(params);
    if (code) next.set("country", code);
    else next.delete("country");
    setParams(next, { replace: true });
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <Card>
      <CardHeader
        title={title}
        description={description ?? "Colour follows each country's risk score. Click a country for detail."}
        actions={
          <div className="w-56">
            <div className="h-2 rounded-full" style={{ background: th.rampCss() }} />
            <div className="flex justify-between text-2xs text-text-3 mt-1 num">
              <span>0</span><span>30</span><span>45</span><span>65</span><span>100</span>
            </div>
          </div>
        }
      />
      <div className="relative">
        {loading ? (
          <Skeleton className="w-full aspect-[2/1] rounded-[16px]" />
        ) : (
          <ComposableMap projectionConfig={{ scale: 150 }} width={800} height={400} style={{ width: "100%", height: "auto" }}>
            <Shapes byCode={byCode} onHover={setHover} onSelect={select} />
          </ComposableMap>
        )}
        <AnimatePresence>
          {hover && (
            <motion.div
              key="tip"
              className="e4 pointer-events-none absolute z-10 px-4 py-3 w-56"
              style={{ left: Math.min(hover.x + 16, 9999), top: hover.y + 16 }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-base font-semibold text-ink">{hover.c.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="num text-2xl font-medium tracking-[-0.03em]" style={{ color: th.riskColor(hover.c.risk_score) }}>
                  {hover.c.risk_score}
                </span>
                <SeverityBadge severity={hover.c.risk_level} size="xs" />
              </div>
              <p className="text-xs text-text-3 mt-1.5">
                <span className="num text-text-2">{hover.c.total_threats.toLocaleString()}</span> indicators · {hover.c.primary_attack}
                {hover.c.primary_attack_share > 0 && <span className="num"> ({hover.c.primary_attack_share}%)</span>}
              </p>
              <p className="text-2xs text-text-3 mt-1">
                {hover.c.trend === "insufficient"
                  ? `Trend needs 2 days of snapshots (have ${hover.c.trend_days})`
                  : `${hover.c.trend === "up" ? "Up" : hover.c.trend === "down" ? "Down" : "Flat"} ${Math.abs(hover.c.trend_change)} pts over ${hover.c.trend_days} days`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CountryDetailPanel countryCode={selected} onClose={() => select(null)} />
    </Card>
  );
}
