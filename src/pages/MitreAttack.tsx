import { useState } from "react";
import { Grid3x3, Layers, ShieldAlert, Database } from "lucide-react";
import { fetchMitreMatrix, fetchMitreTechnique } from "../services/api";
import type { MitreTechnique } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { SEVERITY, toSeverity } from "../design/tokens";
import {
  Card, ErrorState, MethodologyNote, Modal, PageHeader, SeverityBadge, Skeleton, SkeletonCard, StatTile,
} from "../components/ui";

export default function MitreAttack() {
  const { data: matrix, error, loading, reload } = useAsync(fetchMitreMatrix, []);
  const [selected, setSelected] = useState<MitreTechnique | null>(null);
  const detail = useAsync(
    () => (selected ? fetchMitreTechnique(selected.id) : Promise.resolve(null)),
    [selected?.id],
  );

  const totalTechniques = matrix?.tactics.reduce((s, t) => s + t.techniques.length, 0) ?? 0;
  const highSev =
    matrix?.tactics.reduce(
      (s, t) => s + t.techniques.filter((x) => x.severity === "HIGH" || x.severity === "CRITICAL").length,
      0,
    ) ?? 0;

  return (
    <div>
      <PageHeader
        title="MITRE ATT&CK Matrix"
        description={matrix ? `${matrix.coverage} · ${matrix.total_mapped.toLocaleString()} indicators attributed` : "Threat types mapped onto ATT&CK techniques"}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
            {loading || !matrix ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={0} />)
            ) : (
              <>
                <StatTile icon={<Layers size={16} />} label="Tactics covered" value={matrix.tactics.length} />
                <StatTile icon={<Grid3x3 size={16} />} label="Techniques mapped" value={totalTechniques} delay={0.03} />
                <StatTile
                  icon={<ShieldAlert size={16} />}
                  label="High or critical techniques"
                  value={highSev}
                  valueTone={highSev > 0 ? SEVERITY.CRITICAL.text : undefined}
                  delay={0.06}
                />
                <StatTile icon={<Database size={16} />} label="Indicators attributed" value={matrix.total_mapped} delay={0.09} />
              </>
            )}
          </div>

          <Card pad="sm" className="mb-[var(--gap-grid)]">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3 min-w-max">
                {loading || !matrix
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="w-60 space-y-2">
                        <Skeleton className="h-14 rounded-[14px]" />
                        <Skeleton className="h-24 rounded-[14px]" />
                        <Skeleton className="h-24 rounded-[14px]" />
                      </div>
                    ))
                  : matrix.tactics.map((tactic) => (
                      <div key={tactic.id} className="w-60 shrink-0">
                        <div className="px-3 py-2.5 mb-2 rounded-[12px] bg-ink-2 text-paper">
                          <p className="code text-2xs opacity-60">{tactic.id}</p>
                          <h3 className="text-sm font-semibold leading-tight">{tactic.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {tactic.techniques.map((tech) => {
                            const sev = toSeverity(tech.severity);
                            return (
                              <button
                                key={tech.id}
                                onClick={() => setSelected(tech)}
                                className="relative w-full text-left e3 interactive hover:-translate-y-px hover:shadow-[var(--shadow-e2-hover)] p-3 pl-4 overflow-hidden"
                              >
                                <span
                                  className="absolute left-0 top-0 bottom-0 w-[4px]"
                                  style={{ background: sev ? SEVERITY[sev].solid : undefined }}
                                  aria-hidden="true"
                                />
                                <p className="code text-2xs text-text-3 mb-0.5">{tech.id}</p>
                                <p className="text-sm font-semibold text-ink mb-2.5 leading-snug">{tech.name}</p>
                                <div className="flex items-center justify-between">
                                  <SeverityBadge severity={tech.severity} size="xs" />
                                  <span className="text-xs text-text-3">
                                    <span className="num text-ink font-semibold">{tech.our_count.toLocaleString()}</span> attributed
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </Card>

          <MethodologyNote>
            <p>
              Every country in the dataset has a primary attack type (Phishing, Port Scan, BruteForce, DDoS, Spam,
              Malware C2, Botnet). Its indicator count is attributed to that type, and each type is mapped to one or
              two ATT&CK techniques. When a type maps to two techniques, its count is split evenly between them.
            </p>
            <p>
              These are attributions, not per-technique detections. Severity reflects attributed volume: Critical ≥ 800,
              High ≥ 300, Medium ≥ 80, otherwise Low. Descriptions come from MITRE's enterprise-attack STIX bundle.
            </p>
          </MethodologyNote>
        </>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        description={selected ? <span className="code">{selected.id}</span> : null}
      >
        {selected && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <SeverityBadge severity={selected.severity} />
              <span className="text-sm text-text-2">
                <span className="num font-semibold text-ink">{selected.our_count.toLocaleString()}</span> indicators attributed
              </span>
            </div>
            {detail.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ) : detail.data?.description ? (
              <p className="text-base text-text-2 leading-relaxed max-w-[70ch]">{detail.data.description}</p>
            ) : (
              <p className="text-sm text-text-3">MITRE has no cached description for this technique.</p>
            )}
            <a
              href={`https://attack.mitre.org/techniques/${selected.id.replace(".", "/")}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-accent-ink hover:underline"
            >
              Open {selected.id} on attack.mitre.org
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
