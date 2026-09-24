import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Skull } from "lucide-react";
import { fetchTimeline, formatAsOf, sparklineFromDaily } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { useMotion, usePanel } from "../../design/panel";
import { Card, CardHeader, EmptyState, ErrorState, SeverityBadge, Skeleton, Sparkline } from "../ui";

const WINDOW_DAYS = 30;

/**
 * Most recent events in the dataset, newest first, with a 30-day sparkline.
 * Everything is dated from the dataset's own as-of date, not the browser clock.
 */
export default function ActivityFeed({ limit = 8, height = 460 }: { limit?: number; height?: number }) {
  const { data, error, loading, reload } = useAsync(() => fetchTimeline(WINDOW_DAYS), []);
  const th = useTheme();
  const m = useMotion();
  const panel = usePanel();

  const events = useMemo(
    () => [...(data?.events ?? [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit),
    [data, limit],
  );
  const series = useMemo(() => sparklineFromDaily(data?.daily), [data]);
  const total = data?.count ?? 0;

  return (
    <Card className="flex flex-col" style={{ minHeight: height }}>
      <CardHeader
        title="Latest activity"
        description={data ? `${total} events in the ${WINDOW_DAYS} days to ${formatAsOf(data.as_of)}` : `Last ${WINDOW_DAYS} days`}
        actions={
          <Link
            to={panel === "enterprise" ? "/enterprise/analytics" : "/analyst/timeline"}
            className="text-sm font-semibold text-accent-ink hover:underline"
          >
            {panel === "enterprise" ? "Analytics" : "Timeline"}
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-10 rounded-[12px]" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[12px]" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={<Radio size={20} />} title="No events in this window" />
      ) : (
        <>
          <Sparkline id="activity" data={series} stroke={th.c.accent} height={44} />
          <ul className="mt-3 -mx-1 flex-1 overflow-y-auto divide-y divide-line">
            {events.map((e, i) => (
              <motion.li
                key={`${e.id}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: m.enter, delay: Math.min(i, 8) * m.stagger, ease: m.ease }}
                className="flex items-start gap-3 px-1 py-2.5"
              >
                <span className="code text-2xs text-text-3 w-[68px] shrink-0 pt-0.5">{e.date}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    {e.ransomware && <Skull size={12} className="text-sev-critical shrink-0" />}
                    <span className="text-sm text-ink line-clamp-1">{e.title}</span>
                  </span>
                  <span className="text-2xs text-text-3">
                    {e.type === "C2_DETECTED" ? "C2 detected" : "CVE exploit"}
                    {e.vendor ? ` · ${e.vendor}` : ""}
                  </span>
                </span>
                <SeverityBadge severity={e.severity} size="xs" />
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
