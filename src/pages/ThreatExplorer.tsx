import { useMemo, useState } from "react";
import { Skull, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { fetchTimeline } from "../services/api";
import type { TimelineEvent } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { EMPTY } from "../utils/empty";
import { SEVERITY } from "../design/tokens";
import {
  Badge, Button, Card, Drawer, EmptyState, ErrorState, KeyValue, PageHeader, SearchField, Segmented,
  SeverityBadge, SkeletonRows, Table, Th, rowClass,
} from "../components/ui";

type SortKey = "date" | "severity" | "title";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;
const TYPE_LABEL: Record<string, string> = { CVE_EXPLOIT: "CVE exploit", C2_DETECTED: "C2 detected" };

export default function ThreatExplorer() {
  const { data, error, loading, reload } = useAsync(() => fetchTimeline(90), []);
  const events = data?.events ?? EMPTY;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => counts.set(e.type, (counts.get(e.type) ?? 0) + 1));
    return [
      { value: "ALL", label: "All", count: events.length },
      ...Array.from(counts.entries()).map(([t, c]) => ({ value: t, label: TYPE_LABEL[t] ?? t.replace(/_/g, " "), count: c })),
    ];
  }, [events]);

  const filtered = useMemo(() => {
    let result = typeFilter === "ALL" ? events : events.filter((e) => e.type === typeFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          (e.vendor || "").toLowerCase().includes(q) ||
          (e.product || "").toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) => {
      const cmp =
        sortKey === "date"
          ? a.date.localeCompare(b.date)
          : sortKey === "severity"
            ? SEVERITY[a.severity].rank - SEVERITY[b.severity].rank
            : a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [events, typeFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };
  const sortState = (key: SortKey) => (sortKey === key ? sortDir : null);

  return (
    <div>
      <PageHeader
        title="Threat Explorer"
        description="CISA KEV exploited vulnerabilities and Feodo Tracker C2 detections, last 90 days of the dataset."
        meta={
          !loading && !error ? (
            <span className="text-sm text-text-3">
              Showing <span className="num text-ink font-semibold">{filtered.length}</span> of{" "}
              <span className="num">{events.length}</span> events
            </span>
          ) : null
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card pad="none">
          <div className="flex flex-wrap items-center gap-3 p-3 border-b border-line">
            <SearchField
              className="flex-1 min-w-[240px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by title, CVE ID, vendor, product"
              aria-label="Filter events"
            />
            <Segmented
              size="sm"
              ariaLabel="Event type"
              options={typeOptions}
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <SkeletonRows rows={10} cols={4} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th sort={sortState("date")} onSort={() => toggleSort("date")} className="w-32">Date</Th>
                  <Th className="w-40">ID</Th>
                  <Th sort={sortState("title")} onSort={() => toggleSort("title")}>Title</Th>
                  <Th className="w-32">Type</Th>
                  <Th sort={sortState("severity")} onSort={() => toggleSort("severity")} className="w-28">Severity</Th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((event, i) => (
                  <tr
                    key={`${event.id}-${i}`}
                    onClick={() => setSelected(event)}
                    className={`${rowClass} cursor-pointer`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(event)}
                  >
                    <td className="px-4 py-2.5 code text-xs text-text-2 whitespace-nowrap">{event.date}</td>
                    <td className="px-4 py-2.5 code text-xs text-ink whitespace-nowrap">{event.id}</td>
                    <td className="px-4 py-2.5 text-ink">
                      <div className="flex items-center gap-2">
                        {event.ransomware && (
                          <Skull size={13} className="text-sev-critical shrink-0" aria-label="Ransomware-linked" />
                        )}
                        <span className="line-clamp-1">{event.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-text-2 whitespace-nowrap">{TYPE_LABEL[event.type] ?? event.type}</td>
                    <td className="px-4 py-2.5">
                      <SeverityBadge severity={event.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && pageItems.length === 0 && (
            <EmptyState
              icon={<ShieldAlert size={20} />}
              title="No events match these filters"
              description="Clear the search or switch the event type to see more."
              action={
                <Button size="sm" onClick={() => { setSearch(""); setTypeFilter("ALL"); }}>
                  Clear filters
                </Button>
              }
            />
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-line">
              <span className="text-xs text-text-3">
                Page <span className="num text-ink">{page}</span> of <span className="num">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button size="sm" icon={<ChevronLeft size={14} />} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button size="sm" iconRight={<ChevronRight size={14} />} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        subtitle={selected ? <span className="code">{selected.id}</span> : null}
        title={selected?.title}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={selected.severity} />
              {selected.ransomware && <Badge tone="ink" icon={<Skull size={11} />}>Ransomware-linked</Badge>}
            </div>
            <div className="divide-y divide-line">
              <KeyValue label={selected.type === "C2_DETECTED" ? "Placeholder date" : "Date added"} value={selected.date} mono />
              <KeyValue label="Type" value={TYPE_LABEL[selected.type] ?? selected.type} />
              {selected.vendor && <KeyValue label="Vendor" value={selected.vendor} />}
              {selected.product && <KeyValue label="Product" value={selected.product} />}
            </div>
            {selected.type === "C2_DETECTED" && (
              <p className="text-sm text-text-2 rounded-[12px] bg-caution-tint/60 px-3.5 py-3">
                Feodo Tracker publishes no first-seen date for C2 servers. The backend assigns a stable placeholder date
                inside the window, so use this date for ordering only.
              </p>
            )}
            {selected.type === "CVE_EXPLOIT" && (
              <a
                href={`https://nvd.nist.gov/vuln/detail/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-semibold text-accent-ink hover:underline"
              >
                Open {selected.id} in NVD
              </a>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
