import { useState } from "react";
import { motion } from "framer-motion";
import { Globe2, GripVertical, Inbox, User } from "lucide-react";
import { fetchIncidents, updateIncident } from "../services/api";
import type { Incident } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { SEVERITY, toSeverity } from "../design/tokens";
import { useMotion } from "../design/panel";
import { formatTs, relativeTs } from "../utils/time";
import { getUser } from "../utils/auth";
import {
  Badge, Button, Drawer, ErrorState, KeyValue, PageHeader, SeverityBadge, Skeleton,
} from "../components/ui";

const STATUSES: Incident["status"][] = ["NEW", "ASSIGNED", "INVESTIGATING", "RESOLVED"];
const STATUS_LABEL: Record<Incident["status"], string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
};

export default function Incidents() {
  const { data, error, loading, reload, setData } = useAsync(fetchIncidents, []);
  const incidents = data?.incidents ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const m = useMotion();
  const me = getUser();
  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  const replace = (updated: Incident) =>
    setData((prev) => ({ count: prev?.count ?? 0, incidents: (prev?.incidents ?? []).map((i) => (i.id === updated.id ? updated : i)) }));

  const move = async (id: string, status: Incident["status"]) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc || inc.status === status) return;
    setMoveError(null);
    replace({ ...inc, status }); // optimistic
    setSavingId(id);
    try {
      replace(await updateIncident(id, { status }));
    } catch (err) {
      replace(inc);
      setMoveError(`${id} couldn't move to ${STATUS_LABEL[status]}: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSavingId(null);
    }
  };

  const assignToMe = async (inc: Incident) => {
    if (!me) return;
    setSavingId(inc.id);
    try {
      replace(await updateIncident(inc.id, { assignee: `${me.firstName} ${me.lastName}`, status: inc.status === "NEW" ? "ASSIGNED" : inc.status }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Incident Queue"
        description="Drag cards between columns to change status. Every move is saved to the backend."
        meta={
          !loading && (
            <span className="text-sm text-text-3">
              <span className="num text-ink font-semibold">{incidents.filter((i) => i.status !== "RESOLVED").length}</span> open ·{" "}
              <span className="num">{incidents.length}</span> total
            </span>
          )
        }
      />

      {moveError && (
        <p role="alert" className="mb-3 text-sm rounded-[12px] px-3.5 py-2.5 bg-sev-critical-tint text-sev-critical-text">
          {moveError}
        </p>
      )}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--gap-grid)] items-start">
          {STATUSES.map((status) => {
            const col = incidents
              .filter((i) => i.status === status)
              .sort((a, b) => (SEVERITY[b.severity]?.rank ?? 0) - (SEVERITY[a.severity]?.rank ?? 0));
            const over = dragOver === status;
            return (
              <section
                key={status}
                aria-label={`${STATUS_LABEL[status]} column`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(status);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  move(e.dataTransfer.getData("incidentId"), status);
                }}
                className={`e1 p-2.5 min-h-[260px] interactive ${over ? "!shadow-[inset_0_0_0_2px_var(--color-accent),0_0_0_1px_rgba(0,0,0,0.04)]" : ""}`}
              >
                <div className="flex items-center justify-between px-2 pt-1 pb-2.5">
                  <h2 className="text-sm font-semibold text-ink">{STATUS_LABEL[status]}</h2>
                  <span className="num text-xs font-semibold text-text-2 bg-paper rounded-full px-2 py-0.5 shadow-[var(--shadow-e3)]">
                    {loading ? "–" : col.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {loading &&
                    Array.from({ length: status === "NEW" ? 3 : 1 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-[14px]" />)}
                  {!loading && col.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center gap-1.5 py-8 text-text-3">
                      <Inbox size={18} />
                      <span className="text-xs">Drop an incident here</span>
                    </div>
                  )}
                  {col.map((inc, i) => {
                    const sev = toSeverity(inc.severity);
                    return (
                      <motion.div
                        layout
                        key={inc.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: savingId === inc.id ? 0.6 : 1, y: 0 }}
                        transition={{ duration: m.duration, delay: i * m.stagger }}
                      >
                      <button
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("incidentId", inc.id)}
                        onClick={() => setSelectedId(inc.id)}
                        className="group relative w-full text-left e3 p-3 pl-4 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-[var(--shadow-e2-hover)] interactive"
                      >
                        <span className="absolute left-0 inset-y-0 w-1" style={{ background: sev ? SEVERITY[sev].solid : undefined }} />
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="code text-xs font-semibold text-ink">{inc.id}</span>
                          <span className="flex items-center gap-1">
                            <SeverityBadge severity={inc.severity} size="xs" />
                            <GripVertical size={14} className="text-text-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-ink leading-snug line-clamp-2 mb-2">{inc.title}</p>
                        <div className="flex items-center gap-3 text-xs text-text-3">
                          <span className="inline-flex items-center gap-1 code">
                            <Globe2 size={12} /> {inc.source_country || "—"}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate">
                            <User size={12} /> {inc.assignee}
                          </span>
                          <span className="ml-auto whitespace-nowrap">{relativeTs(inc.updated_at)}</span>
                        </div>
                      </button>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        subtitle={selected ? <span className="code">{selected.id}</span> : null}
        title={selected?.title}
        footer={
          selected && (
            <div className="flex flex-wrap gap-2">
              {STATUSES.filter((s) => s !== selected.status).map((s) => (
                <Button key={s} size="sm" variant={s === "RESOLVED" ? "primary" : "secondary"} onClick={() => move(selected.id, s)} loading={savingId === selected.id}>
                  Move to {STATUS_LABEL[s]}
                </Button>
              ))}
              {me && selected.assignee !== `${me.firstName} ${me.lastName}` && (
                <Button size="sm" variant="ghost" onClick={() => assignToMe(selected)}>
                  Assign to me
                </Button>
              )}
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={selected.severity} />
              <Badge>{STATUS_LABEL[selected.status]}</Badge>
            </div>
            <div className="divide-y divide-line">
              <KeyValue label="Source IP" value={selected.source_ip || "—"} mono />
              <KeyValue label="Country" value={selected.source_country || "—"} mono />
              <KeyValue label="Attack type" value={selected.attack_type || "—"} />
              <KeyValue label="Assignee" value={selected.assignee} />
              <KeyValue label="Created" value={formatTs(selected.created_at)} />
              <KeyValue label="Updated" value={formatTs(selected.updated_at)} />
            </div>

            {selected.evidence.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">Evidence</h3>
                <ul className="space-y-1.5">
                  {selected.evidence.map((e, i) => (
                    <li key={i} className="text-sm text-text-2 bg-sunken rounded-[10px] px-3 py-2">{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">Activity</h3>
              <ol className="relative border-l border-line-strong ml-1.5 space-y-3">
                {[...selected.timeline].reverse().map((t, i) => (
                  <li key={i} className="pl-4 relative">
                    <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-ink-2 ring-4 ring-paper" />
                    <p className="text-sm text-ink">{t.event}</p>
                    <p className="text-xs text-text-3">{formatTs(t.time)}</p>
                  </li>
                ))}
              </ol>
            </div>

            {selected.notes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">Notes</h3>
                <div className="space-y-2">
                  {selected.notes.map((n, i) => (
                    <div key={i} className="rounded-[12px] bg-sunken px-3 py-2.5">
                      <p className="text-xs text-text-3 mb-0.5">
                        {n.author} · {formatTs(n.timestamp)}
                      </p>
                      <p className="text-sm text-ink">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
