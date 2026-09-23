import { useState } from "react";
import { motion } from "framer-motion";
import { buildHeatmapData, fetchTimeline, formatAsOf } from "../../services/api";
import type { HeatmapCell } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { Card, CardHeader, ErrorState, SkeletonCard } from "../ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKS = 4;

export default function AttackHeatmap() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(() => fetchTimeline(WEEKS * 7 + 7), []);
  const [hover, setHover] = useState<HeatmapCell | null>(null);
  // Warm single-hue ramp from the reference donut: empty -> accent.
  const RAMP = [th.c.sunken, th.c.accent100, th.c.accent200, th.c.accent300, th.c.accent];

  if (loading) return <SkeletonCard tall />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const cells = buildHeatmapData(data!.events, WEEKS, data!.as_of);
  const max = Math.max(1, ...cells.map((c) => c.count));
  const tone = (n: number) => (n === 0 ? RAMP[0] : RAMP[Math.min(4, 1 + Math.floor((n / max) * 3.999))]);

  return (
    <Card>
      <CardHeader
        title="When activity lands"
        description={`Events per day, ${WEEKS} weeks to ${formatAsOf(data!.as_of)}`}
        actions={
          <span className="text-sm text-text-2 h-6" aria-live="polite">
            {hover ? (
              <>
                {DAYS[hover.day]}, week −{hover.week}: <span className="num font-semibold text-ink">{hover.count}</span>
              </>
            ) : null}
          </span>
        }
      />
      <div className="grid grid-cols-[48px_repeat(7,1fr)] gap-1.5">
        <span />
        {DAYS.map((d) => (
          <span key={d} className="text-xs text-text-3 text-center pb-1">{d}</span>
        ))}
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} className="contents">
            <span className="text-xs text-text-3 flex items-center">{w === 0 ? "This wk" : `−${w} wk`}</span>
            {Array.from({ length: 7 }).map((__, d) => {
              const cell = cells.find((c) => c.week === w && c.day === d)!;
              return (
                <motion.button
                  key={d}
                  aria-label={`${DAYS[d]}, ${w === 0 ? "this week" : `${w} weeks ago`}: ${cell.count} events`}
                  onMouseEnter={() => setHover(cell)}
                  onFocus={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (w * 7 + d) * 0.012 }}
                  className="h-11 rounded-[10px] hover:ring-2 hover:ring-ink-2/30 focus-visible:ring-2 interactive"
                  style={{ background: tone(cell.count) }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-text-3">
        Fewer
        {RAMP.map((c) => (
          <span key={c} className="w-4 h-4 rounded-[5px]" style={{ background: c }} />
        ))}
        More
      </div>
    </Card>
  );
}
