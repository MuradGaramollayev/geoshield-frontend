import { Skull, TriangleAlert } from "lucide-react";
import { fetchTimeline } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { SeverityDot } from "../ui";

const WINDOW_DAYS = 14;

/** Marquee of the real events in the dataset's last fortnight. */
export default function ThreatTicker() {
  const th = useTheme();
  const { data } = useAsync(() => fetchTimeline(WINDOW_DAYS), []);

  const events = [...(data?.events ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);
  if (events.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-line bg-surface py-5">
      <div className="mx-auto mb-3 flex max-w-6xl items-center gap-2 px-6">
        <span className="live-dot" />
        <span className="code text-2xs uppercase tracking-[0.16em] text-text-2">
          Latest activity · {WINDOW_DAYS}-day window
        </span>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {[...events, ...events].map((e, i) => (
            <span
              key={`${e.id}-${i}`}
              className="e1 inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2"
            >
              {e.ransomware ? (
                <Skull size={13} style={{ color: th.sev.CRITICAL.solid }} />
              ) : (
                <TriangleAlert size={13} style={{ color: th.sev[e.severity].solid }} />
              )}
              <span className="code text-2xs text-text-3">{e.date}</span>
              <span className="max-w-[420px] truncate text-sm text-ink">{e.title}</span>
              <SeverityDot severity={e.severity} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
