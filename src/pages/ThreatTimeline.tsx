import { useEffect, useState } from "react";
import { AlertTriangle, Skull, Shield, Clock } from "lucide-react";
import { fetchTimeline } from "../services/api";
import type { TimelineEvent } from "../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

type FilterKey = "ALL" | "CVE_EXPLOIT" | "C2" | "CRITICAL";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "CVE_EXPLOIT", label: "CVE" },
  { key: "C2", label: "C2" },
  { key: "CRITICAL", label: "Critical" },
];

export default function ThreatTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("ALL");

  useEffect(() => {
    fetchTimeline(90)
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "CRITICAL") return e.severity === "CRITICAL";
    return e.type === filter;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Threat Timeline</h1>
        <p className="text-sm text-slate-500">
          {events.length} events over the last 90 days · CISA KEV + C2 infrastructure
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              filter === f.key
                ? "bg-emerald text-navy"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-slate-600 ml-2">{sorted.length} results</span>
      </div>

      {/* Vertical timeline */}
      {sorted.length === 0 ? (
        <div className="card-glow p-12 text-center text-slate-500 text-sm">
          No events match this filter
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-800" />
          <div className="space-y-4">
            {sorted.map((event, i) => {
              const color = SEVERITY_COLOR[event.severity] || SEVERITY_COLOR.MEDIUM;
              return (
                <div key={`${event.id}-${i}`} className="relative">
                  <div
                    className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950"
                    style={{ background: color }}
                  />
                  <div className="card-glow p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {event.ransomware ? (
                          <Skull size={14} className="text-rose-400" />
                        ) : event.type === "CVE_EXPLOIT" ? (
                          <AlertTriangle size={14} style={{ color }} />
                        ) : (
                          <Shield size={14} style={{ color }} />
                        )}
                        <span className="text-xs font-mono text-slate-500">{event.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color, background: `${color}1a` }}
                        >
                          {event.severity}
                        </span>
                        {event.ransomware && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-rose-400 bg-rose-500/10">
                            RANSOMWARE
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mb-2">{event.title}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {event.date}
                      </span>
                      {event.vendor && <span>Vendor: {event.vendor}</span>}
                      {event.product && <span>Product: {event.product}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}