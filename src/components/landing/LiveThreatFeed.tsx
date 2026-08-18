import { useEffect, useState } from "react";
import { AlertTriangle, Skull } from "lucide-react";
import { fetchTimeline } from "../../services/api";
import type { TimelineEvent } from "../../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

export default function LiveThreatFeed() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchTimeline(14).then((data) => {
      const sorted = [...data.events].sort((a, b) => b.date.localeCompare(a.date));
      setEvents(sorted.slice(0, 15));
    });
  }, []);

  if (events.length === 0) return null;

  const loopEvents = [...events, ...events];

  return (
    <div className="py-6 border-y border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center gap-2 px-6 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">
          Live Threat Feed
        </span>
      </div>

      <div className="relative">
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {loopEvents.map((event, i) => {
            const color = SEVERITY_COLOR[event.severity] || SEVERITY_COLOR.MEDIUM;
            return (
              <div
                key={i}
                className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-2 shrink-0"
              >
                {event.ransomware ? (
                  <Skull size={13} className="text-rose-400" />
                ) : (
                  <AlertTriangle size={13} style={{ color }} />
                )}
                <span className="text-xs text-slate-300">{event.title}</span>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ color, background: `${color}1a` }}
                >
                  {event.severity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}