import { CheckCircle2, Clock, FileCheck2, ShieldAlert } from "lucide-react";
import { computeCriticalHighRatio, computeMeanResponseMinutes, fetchIncidents } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { CardHeader, ErrorState, SkeletonCard, StatTile, Card } from "../ui";

export default function ResponseEfficiencyPanel() {
  const { data, error, loading, reload } = useAsync(fetchIncidents, []);
  if (loading) return <SkeletonCard lines={2} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const incidents = data!.incidents;
  const total = incidents.length;
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
  const mean = computeMeanResponseMinutes(incidents);
  const withEvidence = incidents.filter((i) => i.evidence.length > 0).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <Card level={1} pad="md">
      <CardHeader title="Detection and response efficiency" description={`Derived from ${total} tracked incidents`} className="px-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[var(--gap-grid)]">
        <StatTile icon={<CheckCircle2 size={18} />} label="Resolution rate" value={pct(resolved)} suffix="%" footer={`${resolved} of ${total} resolved`} />
        <StatTile
          icon={<Clock size={18} />}
          label="Mean time to latest update"
          value={mean}
          suffix="min"
          footer={mean === null ? "No incident has moved past New yet" : "Created → most recent status change"}
          delay={0.07}
        />
        <StatTile icon={<ShieldAlert size={18} />} label="Critical or high share" value={computeCriticalHighRatio(incidents)} suffix="%" footer="Of all tracked incidents" delay={0.14} />
        <StatTile icon={<FileCheck2 size={18} />} label="Evidence coverage" value={pct(withEvidence)} suffix="%" footer="Incidents with attached evidence" delay={0.21} />
      </div>
    </Card>
  );
}
