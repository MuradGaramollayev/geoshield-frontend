import { useEffect, useState } from "react";
import { AlertCircle, User, Globe, X } from "lucide-react";
import { fetchIncidents, updateIncident } from "../services/api";
import type { Incident } from "../services/api";

const STATUSES: Incident["status"][] = ["NEW", "ASSIGNED", "INVESTIGATING", "RESOLVED"];

const STATUS_LABELS: Record<Incident["status"], string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

function formatTimestamp(ts: string): string {
  // Backend sends "+00:00Z" which is invalid ISO 8601 (double timezone marker)
  const cleaned = ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data.incidents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDrop = async (newStatus: Incident["status"], incidentId: string) => {
    setDragOverStatus(null);
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident || incident.status === newStatus) return;

    // Optimistic update
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
    );

    try {
      await updateIncident(incidentId, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, status: incident.status } : i))
      );
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Incidents</h1>
        <p className="text-sm text-slate-500">{incidents.length} total · drag cards between columns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUSES.map((status) => {
          const columnIncidents = incidents.filter((i) => i.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("incidentId");
                handleDrop(status, id);
              }}
              className={`rounded-xl p-3 min-h-[200px] transition-colors ${
                dragOverStatus === status ? "bg-slate-800/60 ring-1 ring-emerald/40" : "bg-slate-900/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-slate-600 bg-slate-800 rounded-full px-2 py-0.5">
                  {columnIncidents.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnIncidents.map((incident) => {
                  const color = SEVERITY_COLOR[incident.severity] || SEVERITY_COLOR.MEDIUM;
                  return (
                    <div
                      key={incident.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("incidentId", incident.id)}
                      onClick={() => setSelected(incident)}
                      className="card-glow p-3 cursor-grab active:cursor-grabbing hover:border-sky-500/30 transition-colors"
                      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-500">{incident.id}</span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color, background: `${color}1a` }}
                        >
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 font-medium mb-2 line-clamp-2">{incident.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Globe size={11} /> {incident.source_country || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={11} /> {incident.assignee}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={18} style={{ color: SEVERITY_COLOR[selected.severity] }} />
              <p className="text-xs font-mono text-slate-500">{selected.id}</p>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-3">{selected.title}</h2>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ color: SEVERITY_COLOR[selected.severity], background: `${SEVERITY_COLOR[selected.severity]}1a` }}
              >
                {selected.severity}
              </span>
              <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-1">
                {STATUS_LABELS[selected.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Source IP</p>
                <p className="text-sm font-mono text-slate-200">{selected.source_ip || "—"}</p>
              </div>
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Country</p>
                <p className="text-sm text-slate-200">{selected.source_country || "—"}</p>
              </div>
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Attack Type</p>
                <p className="text-sm text-slate-200">{selected.attack_type || "—"}</p>
              </div>
              <div className="card-glow p-3">
                <p className="text-xs text-slate-500 mb-1">Assignee</p>
                <p className="text-sm text-slate-200">{selected.assignee}</p>
              </div>
            </div>

            {selected.evidence.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Evidence</h3>
                <ul className="space-y-1">
                  {selected.evidence.map((e, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.notes.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                <div className="space-y-2">
                  {selected.notes.map((note, i) => (
                    <div key={i} className="text-sm text-slate-400 border-l-2 border-slate-700 pl-3">
                      <span className="text-slate-500 text-xs">
                        {note.author} · {formatTimestamp(note.timestamp)}
                      </span>
                      <p className="text-slate-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}