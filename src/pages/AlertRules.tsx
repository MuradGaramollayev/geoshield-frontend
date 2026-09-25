import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Plus, Trash2 } from "lucide-react";
import {
  createAlertRule, deleteAlertRule, fetchAlertRules, fetchRuleFields, toggleAlertRule,
} from "../services/api";
import type { AlertRule } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, IconButton, MethodologyNote,
  PageHeader, SelectField, SeverityBadge, Skeleton, StatTile, TextField,
} from "../components/ui";

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

/** One rule, its expression, and the countries currently matching it. */
function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: AlertRule;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  const firing = rule.enabled && rule.match_count > 0;
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="e2 rounded-[14px] p-[var(--pad-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">{rule.name}</p>
            <SeverityBadge severity={rule.severity} size="xs" />
            {!rule.enabled && <Badge tone="neutral">Paused</Badge>}
          </div>
          <p className="code mt-1 text-2xs text-text-2">
            {rule.expression}
            {rule.scope.length > 0 && ` · scope ${rule.scope.join(", ")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="switch"
            checked={rule.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={`${rule.enabled ? "Pause" : "Enable"} ${rule.name}`}
            title={rule.enabled ? "Pause this rule" : "Enable this rule"}
          />
          {confirming ? (
            <span className="flex items-center gap-1.5">
              <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Keep</Button>
            </span>
          ) : (
            <IconButton
              label={`Delete ${rule.name}`}
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={15} />
            </IconButton>
          )}
        </div>
      </div>

      {!rule.enabled ? (
        <p className="mt-3 text-sm text-text-3">Paused — not evaluated.</p>
      ) : rule.note ? (
        <p className="mt-3 text-sm text-sev-medium-text">{rule.note}</p>
      ) : firing ? (
        <>
          <p className="mt-3 text-sm text-text-2">
            <span className="num font-semibold text-ink">{rule.match_count}</span> of{" "}
            <span className="num">{rule.countries_tested}</span> countries match right now
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rule.matches.slice(0, 14).map((m) => (
              <Link
                key={m.code}
                to={`/analyst?country=${m.code}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2 py-1 interactive hover:bg-well"
                title={`${m.name}: ${m.value} ${rule.unit}`}
              >
                <span className="code text-2xs text-text-2">{m.code}</span>
                <span className="num text-2xs font-semibold text-ink">{m.value}</span>
              </Link>
            ))}
            {rule.match_count > 14 && (
              <span className="self-center text-2xs text-text-3">+{rule.match_count - 14} more</span>
            )}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-text-3">
          No country meets this threshold right now ({rule.countries_tested} tested).
        </p>
      )}
    </div>
  );
}

/**
 * Custom alert rules: thresholds on real per-country fields, re-evaluated
 * against the current dataset on every load. A firing rule names the countries
 * that match and the value that made each one match.
 */
export default function AlertRules() {
  const rules = useAsync(fetchAlertRules, []);
  const fields = useAsync(fetchRuleFields, []);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    field: "risk_score",
    comparator: "gte",
    threshold: "65",
    severity: "HIGH",
    scope: "",
  });

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await createAlertRule({
        name: draft.name.trim() || "Untitled rule",
        field: draft.field,
        comparator: draft.comparator,
        threshold: Number(draft.threshold),
        severity: draft.severity,
        scope: draft.scope.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setAdding(false);
      setDraft({ ...draft, name: "", scope: "" });
      rules.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the rule");
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      rules.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  const d = rules.data;
  const unit = fields.data?.fields.find((f) => f.field === draft.field)?.unit ?? "";

  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader
        title="Alert rules"
        description="Thresholds on real per-country fields, checked against the current dataset every time this page loads."
        actions={
          <Button variant="accent" size="sm" icon={<Plus size={15} />} onClick={() => setAdding((v) => !v)}>
            New rule
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {adding && (
        <Card>
          <CardHeader title="New rule" description="Pick a field, a comparator and a threshold. Leave the scope empty to test every country." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <TextField
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Critical origin emerges"
              className="lg:col-span-2"
            />
            <SelectField
              label="Field"
              value={draft.field}
              onChange={(e) => setDraft({ ...draft, field: e.target.value })}
            >
              {(fields.data?.fields ?? []).map((f) => (
                <option key={f.field} value={f.field} disabled={!f.available}>
                  {f.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Is"
              value={draft.comparator}
              onChange={(e) => setDraft({ ...draft, comparator: e.target.value })}
            >
              {(fields.data?.comparators ?? []).map((c) => (
                <option key={c.value} value={c.value}>{c.symbol}</option>
              ))}
            </SelectField>
            <TextField
              label={`Threshold${unit ? ` (${unit})` : ""}`}
              value={draft.threshold}
              onChange={(e) => setDraft({ ...draft, threshold: e.target.value })}
              inputMode="decimal"
              mono
            />
            <SelectField
              label="Severity"
              value={draft.severity}
              onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
            >
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
            <TextField
              label="Scope (optional)"
              value={draft.scope}
              onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
              placeholder="DE, NL, GB"
              hint="Country codes, comma separated"
              className="lg:col-span-2"
              mono
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="accent" size="sm" loading={busy} onClick={submit}>Create rule</Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {rules.error ? (
        <ErrorState message={rules.error} onRetry={rules.reload} />
      ) : !d ? (
        <div className="grid gap-[var(--gap-grid)] sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-[16px]" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-[var(--gap-grid)] sm:grid-cols-3">
            <StatTile icon={<BellRing size={16} />} label="Rules defined" value={d.count} footer="Persisted configuration" />
            <StatTile icon={<BellRing size={16} />} label="Firing now" value={d.firing} footer="At least one country matches" />
            <StatTile
              icon={<BellRing size={16} />}
              label="Countries matched"
              value={d.rules.reduce((n, r) => n + (r.enabled ? r.match_count : 0), 0)}
              footer="Across all enabled rules"
            />
          </div>

          {d.rules.length === 0 ? (
            <Card>
              <EmptyState
                icon={<BellRing size={20} />}
                title="No rules yet"
                description="A rule is a threshold on a real field — risk score, indicator volume, C2 servers — checked against every country."
              />
            </Card>
          ) : (
            <div className="grid gap-[var(--gap-grid)] xl:grid-cols-2">
              {d.rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={(enabled) => act(() => toggleAlertRule(rule.id, enabled))}
                  onDelete={() => act(() => deleteAlertRule(rule.id))}
                />
              ))}
            </div>
          )}

          <MethodologyNote title="How rules are evaluated">{d.methodology}</MethodologyNote>
        </>
      )}
    </div>
  );
}
