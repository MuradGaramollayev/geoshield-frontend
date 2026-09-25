import { useState } from "react";
import { ClipboardList, FileClock, ShieldCheck } from "lucide-react";
import { fetchAuditLog, fetchAuditSummary } from "../../services/api";
import type { AuditEntry } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import {
  Card, CardHeader, EmptyState, ErrorState, MethodologyNote, PageHeader, SelectField,
  Skeleton, StatTile, Table, Th, rowClass,
} from "../../components/ui";

const CATEGORY_ORDER = ["Reporting", "Response", "Detection", "Governance", "Operations", "Other"];

/** UTC timestamp, split so the date and the time read separately. */
function When({ at }: { at: string }) {
  const [date, rest] = at.split("T");
  return (
    <span className="code text-2xs text-text-2">
      {date} <span className="text-text-3">{(rest ?? "").replace("Z", "")}</span>
    </span>
  );
}

/**
 * The audit trail: what has actually been done in this deployment. Entries are
 * appended by the endpoints that performed the actions, never generated to
 * fill the page, so an empty log is a truthful answer.
 */
export default function AuditTrail() {
  const [action, setAction] = useState("");
  const log = useAsync(() => fetchAuditLog(action, 300), [action]);
  const summary = useAsync(fetchAuditSummary, []);

  const d = log.data;
  const byCategory = summary.data?.by_category ?? {};
  const categories = CATEGORY_ORDER.filter((c) => byCategory[c]).map((c) => ({
    category: c,
    count: byCategory[c],
  }));

  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader
        title="Audit trail"
        description="Every report generated, incident raised, block rule exported and detection rule changed in this deployment."
        actions={
          <SelectField
            aria-label="Filter by action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="min-w-[240px]"
          >
            <option value="">All actions</option>
            {(d?.actions ?? []).map((a) => (
              <option key={a.action} value={a.action}>{a.label}</option>
            ))}
          </SelectField>
        }
      />

      <div className="grid gap-[var(--gap-grid)] sm:grid-cols-3">
        <StatTile
          icon={<ClipboardList size={18} />}
          label="Recorded actions"
          value={summary.data?.total ?? null}
          footer="Since this deployment started logging"
        />
        <StatTile
          icon={<FileClock size={18} />}
          label="Categories in use"
          value={categories.length}
          footer={categories.map((c) => `${c.category} ${c.count}`).join(" · ") || "Nothing recorded yet"}
        />
        <StatTile
          icon={<ShieldCheck size={18} />}
          label="Entries shown"
          value={d?.count ?? null}
          footer={action ? "Filtered to one action" : "Newest first"}
        />
      </div>

      <Card>
        <CardHeader
          title="Activity"
          description={
            summary.data?.first_at
              ? `From ${summary.data.first_at.replace("T", " ").replace("Z", " UTC")}`
              : "Nothing has been recorded yet"
          }
        />
        {log.error ? (
          <ErrorState message={log.error} onRetry={log.reload} />
        ) : !d ? (
          <Skeleton className="h-48 rounded-[12px]" />
        ) : d.entries.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={20} />}
            title="No actions recorded"
            description="Generate a report, raise an incident or change a detection rule and it will appear here. This page is never pre-filled."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>When (UTC)</Th>
                <Th>Category</Th>
                <Th>Action</Th>
                <Th>Detail</Th>
                <Th>Target</Th>
              </tr>
            </thead>
            <tbody>
              {d.entries.map((e: AuditEntry, i) => (
                <tr key={`${e.at}-${i}`} className={rowClass}>
                  <td className="whitespace-nowrap px-4 py-2.5"><When at={e.at} /></td>
                  <td className="px-4 py-2.5 text-sm text-text-2">{e.category}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-ink">{e.label}</td>
                  <td className="px-4 py-2.5 text-sm text-text-2">{e.detail}</td>
                  <td className="code px-4 py-2.5 text-2xs text-text-2">{e.target}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {d && <MethodologyNote title="How the audit trail is kept">{d.methodology}</MethodologyNote>}
    </div>
  );
}
