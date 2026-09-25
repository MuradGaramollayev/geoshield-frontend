import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ban, BellOff, CheckCheck, Clock, Globe2, Route, Siren } from "lucide-react";
import {
  fetchEscalation, fetchIncidents, fetchRouting, toggleRouting, updateEscalation, updateIncident,
} from "../services/api";
import type { EscalationPolicy, Incident, RoutingConfig } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { SEVERITY_ORDER, SEVERITY_RANK } from "../design/tokens";
import { useTheme } from "../design/themeContext";
import { useMotion } from "../design/panel";
import { formatTs, relativeTs } from "../utils/time";
import { getUser } from "../utils/auth";
import ResponseModal from "../components/charts/ResponseModal";
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, PageHeader, SeverityBadge, Skeleton, TextField,
} from "../components/ui";

const OPEN = new Set(["NEW", "ASSIGNED", "INVESTIGATING"]);

export default function AlertCenter() {
  const th = useTheme();
  const inc = useAsync(fetchIncidents, []);
  const esc = useAsync(fetchEscalation, []);
  const routingState = useAsync(fetchRouting, []);
  const m = useMotion();
  const me = getUser();

  const [togglingName, setTogglingName] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [responding, setResponding] = useState<Incident | null>(null);


  const open = useMemo(
    () =>
      (inc.data?.incidents ?? [])
        .filter((i) => OPEN.has(i.status))
        .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.created_at.localeCompare(a.created_at)),
    [inc.data],
  );
  const counts = SEVERITY_ORDER.map((s) => ({ s, n: open.filter((i) => i.severity === s).length }));

  const patch = async (i: Incident, updates: Parameters<typeof updateIncident>[1]) => {
    setBusyId(i.id);
    try {
      const updated = await updateIncident(i.id, updates);
      inc.setData((prev) => ({ count: prev?.count ?? 0, incidents: (prev?.incidents ?? []).map((x) => (x.id === updated.id ? updated : x)) }));
    } finally {
      setBusyId(null);
    }
  };
  const actor = me ? `${me.firstName} ${me.lastName}` : "Analyst";

  const toggle = async (name: string, enabled: boolean) => {
    setTogglingName(name);
    try {
      routingState.setData(await toggleRouting(name, !enabled) as RoutingConfig);
    } finally {
      setTogglingName(null);
    }
  };

  return (
    <div>
      <PageHeader title="Alert Center" description="Open incidents that need action, sorted by severity, plus escalation and routing rules." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        {counts.map(({ s, n }, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: m.enter, delay: i * m.stagger }}
            className="e2 p-4 flex items-center gap-4"
          >
            <span className="w-2 self-stretch rounded-full" style={{ background: th.sev[s].solid }} />
            <div>
              <p className="num text-2xl font-medium tracking-[-0.03em] text-ink">{inc.loading ? "–" : n}</p>
              <p className="text-sm text-text-2">{th.sev[s].label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[var(--gap-grid)] items-start">
        <div className="xl:col-span-2 space-y-2.5">
          <h2 className="text-sm font-semibold text-ink px-1">
            Active alerts <span className="num text-text-3 font-medium">· {open.length}</span>
          </h2>
          {inc.error ? (
            <ErrorState message={inc.error} onRetry={inc.reload} />
          ) : inc.loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[20px]" />)
          ) : open.length === 0 ? (
            <Card>
              <EmptyState icon={<BellOff size={20} />} title="No open alerts" description="Every incident is resolved. New incidents appear here automatically." />
            </Card>
          ) : (
            open.map((i, idx) => (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: busyId === i.id ? 0.6 : 1, y: 0 }}
                transition={{ duration: m.enter, delay: idx * m.stagger }}
                className="e2 relative overflow-hidden p-4 pl-5"
              >
                <span className="absolute left-0 inset-y-0 w-1.5" style={{ background: th.sev[i.severity].solid }} />
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="code text-xs font-semibold text-ink">{i.id}</span>
                  <SeverityBadge severity={i.severity} />
                  <Badge>{i.status.charAt(0) + i.status.slice(1).toLowerCase()}</Badge>
                  <span className="ml-auto text-xs text-text-3">{relativeTs(i.created_at)}</span>
                </div>
                <p className="text-base font-semibold text-ink mb-2">{i.title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-3 mb-3.5">
                  <span className="inline-flex items-center gap-1 code"><Globe2 size={12} /> {i.source_country || "—"}</span>
                  {i.source_ip && <span className="code">{i.source_ip}</span>}
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatTs(i.created_at)}</span>
                  {i.attack_type && <span>{i.attack_type}</span>}
                  <span>Owner: <span className="text-text-2">{i.assignee}</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="danger" icon={<Ban size={14} />} onClick={() => setResponding(i)} disabled={!i.source_ip}>
                    Generate block rules
                  </Button>
                  {i.status === "NEW" && (
                    <Button size="sm" icon={<CheckCheck size={14} />} onClick={() => patch(i, { status: "ASSIGNED", assignee: actor, note: `Acknowledged by ${actor}` })}>
                      Acknowledge
                    </Button>
                  )}
                  {i.status !== "INVESTIGATING" && (
                    <Button
                      size="sm"
                      icon={<Siren size={14} />}
                      onClick={() =>
                        patch(i, {
                          status: "INVESTIGATING",
                          note: `Escalated by ${actor}${esc.data?.notify_email ? ` (policy contact: ${esc.data.notify_email})` : ""}`,
                        })
                      }
                    >
                      Escalate
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => patch(i, { status: "RESOLVED", resolution: `Resolved from Alert Center by ${actor}` })}>
                    Resolve
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-[var(--gap-grid)]">
          <Card>
            <CardHeader
              title="Escalation policy"
              description="Notification deadlines per severity"
              actions={esc.data?.configured ? <Badge tone="positive">Configured</Badge> : <Badge>Not set</Badge>}
            />
            {esc.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <EscalationForm key={esc.data?.updated_at ?? "unset"} policy={esc.data} onSaved={esc.setData} />
            )}
          </Card>

          <Card>
            <CardHeader title="Alert routing" description="Where alerts should go" icon={<Route size={17} />} />
            {routingState.loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {routingState.data?.integrations.map((r) => (
                  <li key={r.name} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-ink">{r.name}</span>
                    <label className="inline-flex items-center gap-2 text-xs text-text-3 cursor-pointer">
                      {r.connected ? "On" : "Off"}
                      <input
                        type="checkbox"
                        className="switch"
                        checked={r.connected}
                        disabled={togglingName === r.name}
                        onChange={() => toggle(r.name, r.connected)}
                        aria-label={`Route alerts to ${r.name}`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-text-3 mt-3 leading-relaxed">
              Saves your routing preference. Delivery to these channels isn't wired up yet, so alerts stay in GeoShield
              for now.
            </p>
          </Card>
        </div>
      </div>

      {responding?.source_ip && (
        <ResponseModal
          action="block_ip"
          target={responding.source_ip}
          reason={`${responding.id}: ${responding.title}`}
          onClose={() => setResponding(null)}
        />
      )}
    </div>
  );
}

function EscalationForm({ policy, onSaved }: { policy: EscalationPolicy | null; onSaved: (p: EscalationPolicy) => void }) {
  const [critMin, setCritMin] = useState(policy?.critical_notify_minutes?.toString() ?? "");
  const [highMin, setHighMin] = useState(policy?.high_notify_minutes?.toString() ?? "");
  const [email, setEmail] = useState(policy?.notify_email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      onSaved(
        await updateEscalation({
          critical_notify_minutes: critMin ? parseInt(critMin, 10) : undefined,
          high_notify_minutes: highMin ? parseInt(highMin, 10) : undefined,
          notify_email: email || undefined,
        }),
      );
    } catch (err) {
      setError(`Not saved: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <TextField label="Critical: notify within (minutes)" type="number" min={1} value={critMin} onChange={(e) => setCritMin(e.target.value)} placeholder="5" />
      <TextField label="High: notify within (minutes)" type="number" min={1} value={highMin} onChange={(e) => setHighMin(e.target.value)} placeholder="15" />
      <TextField label="Notify email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="soc@yourcompany.com" />
      <Button type="submit" variant="primary" className="w-full" loading={saving}>
        Save escalation rules
      </Button>
      {error && <p role="alert" className="text-sm text-sev-critical-text">{error}</p>}
      {policy?.updated_at && <p role="status" className="text-xs text-text-3">Saved {formatTs(policy.updated_at)}</p>}
    </form>
  );
}
