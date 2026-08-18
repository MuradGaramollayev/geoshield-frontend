import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown, X, Skull } from "lucide-react";
import { fetchTimeline } from "../services/api";
import type { TimelineEvent } from "../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

type SortKey = "date" | "severity" | "title";
type SortDir = "asc" | "desc";

const SEVERITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

const PAGE_SIZE = 15;

export default function ThreatExplorer() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    fetchTimeline(90)
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => {
    const s = new Set(events.map((e) => e.type));
    return ["ALL", ...Array.from(s)];
  }, [events]);

  const filtered = useMemo(() => {
    let result = events;
    if (typeFilter !== "ALL") {
      result = result.filter((e) => e.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          (e.vendor || "").toLowerCase().includes(q) ||
          (e.product || "").toLowerCase().includes(q)
      );
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "severity") cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      else if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [events, typeFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  if (loading) return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  if (error) return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Threat Explorer</h1>
        <p className="text-sm text-slate-500">{filtered.length} of {events.length} events</p>
      </div>

      {/* Filter bar */}
      <div className="card-glow p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search size={15} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, CVE ID, vendor..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-600"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === t ? "bg-emerald text-navy" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {t === "ALL" ? "All" : t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-glow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("date")} className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200">
                  Date <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("title")} className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200">
                  Title <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("severity")} className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200">
                  Severity <ArrowUpDown size={11} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((event, i) => {
              const color = SEVERITY_COLOR[event.severity] || SEVERITY_COLOR.MEDIUM;
              return (
                <tr
                  key={`${event.id}-${i}`}
                  onClick={() => setSelected(event)}
                  className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono whitespace-nowrap">{event.date}</td>
                  <td className="px-4 py-3 text-slate-200">
                    <div className="flex items-center gap-2">
                      {event.ransomware && <Skull size={12} className="text-rose-400 shrink-0" />}
                      <span className="line-clamp-1">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{event.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color, background: `${color}1a` }}
                    >
                      {event.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                  No events match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 text-xs">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs bg-slate-800 text-slate-300 rounded px-3 py-1.5 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs bg-slate-800 text-slate-300 rounded px-3 py-1.5 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Slide-out detail panel */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-500">{selected.id}</span>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-3">{selected.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ color: SEVERITY_COLOR[selected.severity], background: `${SEVERITY_COLOR[selected.severity]}1a` }}
              >
                {selected.severity}
              </span>
              {selected.ransomware && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full text-rose-400 bg-rose-500/10">
                  RANSOMWARE
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="text-sm text-slate-200">{selected.date}</p>
              </div>
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <p className="text-sm text-slate-200">{selected.type.replace(/_/g, " ")}</p>
              </div>
              {selected.vendor && (
                <div className="card-glow p-3">
                  <p className="text-xs text-slate-500 mb-1">Vendor</p>
                  <p className="text-sm text-slate-200">{selected.vendor}</p>
                </div>
              )}
              {selected.product && (
                <div className="card-glow p-3">
                  <p className="text-xs text-slate-500 mb-1">Product</p>
                  <p className="text-sm text-slate-200">{selected.product}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}