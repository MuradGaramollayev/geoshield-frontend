import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Radio, Skull, CalendarClock } from "lucide-react";
import { fetchTimeline } from "../services/api";
import type { TimelineEvent } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { EMPTY } from "../utils/empty";
import { useTheme } from "../design/themeContext";
import { useMotion } from "../design/panel";
import {
  Badge, Card, EmptyState, ErrorState, MethodologyNote, PageHeader, Segmented, SeverityBadge, Skeleton,
} from "../components/ui";

type FilterKey = "ALL" | "CVE_EXPLOIT" | "C2_DETECTED" | "CRITICAL";

function matches(e: TimelineEvent, f: FilterKey) {
  if (f === "ALL") return true;
  if (f === "CRITICAL") return e.severity === "CRITICAL";
  return e.type === f;
}

function monthLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default function ThreatTimeline() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(() => fetchTimeline(90), []);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const m = useMotion();
  const events = data?.events ?? EMPTY;

  // Counts come from the window's per-day totals, not from the event list:
  // the API caps that list, so counting it would understate every filter.
  const totals = useMemo(() => {
    const daily = data?.daily ?? [];
    const sum = (key: "count" | "cve" | "c2" | "critical") =>
      daily.reduce((n, d) => n + d[key], 0);
    return { all: sum("count"), cve: sum("cve"), c2: sum("c2"), critical: sum("critical") };
  }, [data]);

  const options = useMemo(
    () => [
      { value: "ALL" as const, label: "All", count: totals.all },
      { value: "CVE_EXPLOIT" as const, label: "CVE", count: totals.cve },
      { value: "C2_DETECTED" as const, label: "C2", count: totals.c2 },
      { value: "CRITICAL" as const, label: "Critical", count: totals.critical },
    ],
    [totals],
  );

  const grouped = useMemo(() => {
    const sorted = events.filter((e) => matches(e, filter)).sort((a, b) => b.date.localeCompare(a.date));
    const groups: { month: string; items: TimelineEvent[] }[] = [];
    for (const e of sorted) {
      const month = monthLabel(e.date);
      if (!groups.length || groups[groups.length - 1].month !== month) groups.push({ month, items: [] });
      groups[groups.length - 1].items.push(e);
    }
    return groups;
  }, [events, filter]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Threat Timeline"
        description={
          data
            ? `CISA KEV additions and ThreatFox/Feodo C2 sightings, newest first, over the 90 days to ${data.as_of}. Showing the newest ${(data.returned ?? events.length).toLocaleString()} of ${data.count.toLocaleString()}.`
            : "CISA KEV additions and ThreatFox/Feodo C2 sightings, newest first."
        }
        actions={<Segmented ariaLabel="Filter events" options={options} value={filter} onChange={setFilter} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[20px]" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <EmptyState icon={<CalendarClock size={20} />} title="No events for this filter" description="Switch to All to see every event in the window." />
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.month}>
              <h2 className="text-sm font-semibold text-text-2 mb-3 sticky top-0 bg-surface/90 backdrop-blur-sm py-1 z-10">
                {g.month} <span className="num text-text-3 font-medium">· {g.items.length}</span>
              </h2>
              <ol className="relative ml-2 border-l border-line-strong">
                {g.items.map((event, i) => {
                  const sev = th.sev[event.severity];
                  const isC2 = event.type === "C2_DETECTED";
                  return (
                    <motion.li
                      key={`${event.id}-${i}`}
                      className="relative pl-6 pb-3 last:pb-0"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: m.enter, delay: Math.min(i, 10) * m.stagger, ease: m.ease }}
                    >
                      <span
                        className="absolute -left-[6px] top-5 w-[11px] h-[11px] rounded-full ring-4 ring-surface"
                        style={{ background: sev.solid }}
                        aria-hidden="true"
                      />
                      <Card level={2} pad="sm" className="interactive hover:shadow-[var(--shadow-e2-hover)]">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1.5">
                          {event.ransomware ? (
                            <Skull size={14} className="text-sev-critical" />
                          ) : isC2 ? (
                            <Radio size={14} className="text-text-2" />
                          ) : (
                            <AlertTriangle size={14} className="text-text-2" />
                          )}
                          <span className="code text-xs text-ink font-semibold">{event.id}</span>
                          <span className="code text-xs text-text-3">{event.date}</span>
                          {isC2 && (
                            <span title="Feodo Tracker publishes no first-seen date; the backend assigns a stable placeholder date inside the window.">
                              <Badge tone="caution">Placeholder date</Badge>
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-2">
                            {event.ransomware && <Badge tone="ink">Ransomware</Badge>}
                            <SeverityBadge severity={event.severity} />
                          </span>
                        </div>
                        <p className="text-base font-medium text-ink leading-snug">{event.title}</p>
                        {(event.vendor || event.product) && (
                          <p className="text-xs text-text-3 mt-1">
                            {event.vendor}
                            {event.vendor && event.product ? " · " : ""}
                            {event.product}
                          </p>
                        )}
                      </Card>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          ))}
          <MethodologyNote>
            <p>
              CVE events are CISA Known Exploited Vulnerabilities, dated by the day CISA added them to the catalogue.
              Severity is Critical when CISA links the CVE to ransomware campaigns, High for remote-code-execution,
              privilege-escalation or authentication-bypass flaws, otherwise Medium.
            </p>
            <p>
              C2 events are Feodo Tracker botnet servers: High while the server is online, Medium once offline. Feodo
              does not publish a first-seen date, so each C2 event carries a stable placeholder date derived from its
              IP. Treat C2 dates as ordering only, not as observed dates.
            </p>
          </MethodologyNote>
        </div>
      )}
    </div>
  );
}
