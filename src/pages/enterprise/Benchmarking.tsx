import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Gauge, Layers, Minus, Users } from "lucide-react";
import { fetchBenchmark, fetchCountries, fetchPeerBands } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import {
  Card, CardHeader, CountUp, ErrorState, KeyValue, MeterRow, MethodologyNote, PageHeader,
  SelectField, SeverityBadge, Skeleton, StatTile, Table, Th, rowClass,
} from "../../components/ui";

/** Signed delta, coloured by direction: above the peer median is worse. */
function Delta({ value, suffix }: { value: number; suffix: string }) {
  const th = useTheme();
  const flat = Math.abs(value) < 0.05;
  const tone = flat ? th.c.text3 : value > 0 ? th.sev.HIGH.text : th.sev.LOW.text;
  const Icon = flat ? Minus : value > 0 ? ArrowUp : ArrowDown;
  return (
    <span className="num inline-flex items-center gap-1 text-sm font-semibold" style={{ color: tone }}>
      <Icon size={13} />
      {flat ? "0" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`} {suffix}
    </span>
  );
}

/**
 * Peer benchmarking: one country against the countries carrying a comparable
 * volume of indicators, rather than against a world average that flatters
 * anyone small.
 */
export default function Benchmarking() {
  const th = useTheme();
  const countries = useAsync(fetchCountries, []);
  const bands = useAsync(fetchPeerBands, []);
  const [code, setCode] = useState("");

  const options = useMemo(
    () => [...(countries.data?.countries ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [countries.data],
  );
  const selected = code || countries.data?.countries[0]?.code || "";
  const bench = useAsync(() => (selected ? fetchBenchmark(selected) : Promise.resolve(null)), [selected]);

  const d = bench.data;
  const maxShare = Math.max(10, ...(d?.vectors ?? []).map((v) => Math.max(v.share, v.peer_median_share)));

  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader
        title="Peer benchmarking"
        description="How this country's exposure compares with the countries carrying a similar volume of indicators."
        actions={
          <SelectField
            aria-label="Country to benchmark"
            value={selected}
            onChange={(e) => setCode(e.target.value)}
            className="min-w-[220px]"
          >
            {options.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </SelectField>
        }
      />

      {bench.error ? (
        <ErrorState message={bench.error} onRetry={bench.reload} />
      ) : !d ? (
        <div className="grid gap-[var(--gap-grid)] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-[16px]" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-[var(--gap-grid)] sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={<Gauge size={18} />}
              label="Risk score"
              value={d.country.risk_score}
              decimals={1}
              badge={<SeverityBadge severity={d.country.risk_level} size="xs" />}
              footer={`${d.country.total_threats.toLocaleString()} indicators from ${d.country.source_count} sources`}
            />
            <StatTile
              icon={<Users size={18} />}
              label="Percentile among peers"
              value={d.position.peer_percentile}
              decimals={1}
              suffix="%"
              footer={`At or above ${d.position.peer_percentile}% of its ${Math.max(0, d.band.size - 1)} peers`}
            />
            <StatTile
              icon={<Layers size={18} />}
              label="Rank in peer band"
              value={d.position.rank_in_band}
              footer={`of ${d.band.size} in this band · ${d.position.rank_global} of ${d.position.countries_total} globally`}
            />
            <StatTile
              icon={<ArrowUp size={18} />}
              label="Gap to peer median"
              value={d.position.gap_to_peer_median}
              decimals={1}
              valueTone={d.position.gap_to_peer_median > 0 ? th.sev.HIGH.text : th.sev.LOW.text}
              footer={`Peer median ${d.position.peer_median} · global median ${d.position.global_median}`}
            />
          </div>

          <div className="grid gap-[var(--gap-grid)] 2xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
            <Card>
              <CardHeader
                title="Indicator mix against peers"
                description="Each counted source as a share of this country's own indicator total, next to the median share across its peers."
              />
              <div className="space-y-5">
                {d.vectors.map((v) => (
                  <div key={v.source}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-ink">{v.label}</span>
                      <Delta value={v.delta} suffix="pts vs peers" />
                    </div>
                    <MeterRow
                      label="This country"
                      value={v.share}
                      max={maxShare}
                      color={th.c.accent}
                      right={<span className="num text-sm text-ink">{v.share.toFixed(1)}%</span>}
                    />
                    <div className="mt-1.5">
                      <MeterRow
                        label="Peer median"
                        value={v.peer_median_share}
                        max={maxShare}
                        color={th.c.text4}
                        right={<span className="num text-sm text-text-3">{v.peer_median_share.toFixed(1)}%</span>}
                      />
                    </div>
                    <p className="num mt-1.5 text-2xs text-text-3">{v.count.toLocaleString()} indicators</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-[var(--gap-grid)]">
              <Card>
                <CardHeader
                  title="Peer group"
                  description={`${d.band.name}: ${d.band.volume_range[0].toLocaleString()}-${d.band.volume_range[1].toLocaleString()} indicators`}
                />
                <Table>
                  <thead>
                    <tr>
                      <Th>Closest peers</Th>
                      <Th align="right">Score</Th>
                      <Th align="right">Indicators</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.nearest_peers.map((p) => (
                      <tr key={p.code} className={rowClass}>
                        <td className="px-4 py-2.5 text-sm text-ink">
                          <span className="code mr-2 text-2xs text-text-3">{p.code}</span>
                          {p.name}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-sm text-ink">{p.risk_score.toFixed(1)}</td>
                        <td className="num px-4 py-2.5 text-right text-sm text-text-2">{p.total_threats.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>

              <Card>
                <CardHeader
                  title="Signals outside the indicator total"
                  description="Real, but counted differently, so they are shown as counts rather than shares."
                />
                <div>
                  {d.additional_signals.map((sig) => (
                    <KeyValue
                      key={sig.source}
                      label={sig.label}
                      value={
                        <>
                          <CountUp value={sig.count} />
                          <span className="ml-2 text-2xs font-normal text-text-3">
                            vs {sig.peer_median_count.toLocaleString()} peer median
                          </span>
                        </>
                      }
                    />
                  ))}
                </div>
              </Card>

              {bands.data && (
                <Card>
                  <CardHeader title="How the bands split" description="Every country falls in exactly one." />
                  <div>
                    {bands.data.bands.map((b) => (
                      <KeyValue
                        key={b.band}
                        label={b.band === d.band.index ? `${b.name} · this country` : b.name}
                        value={`${b.countries} countries · median ${b.median_risk}`}
                      />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          <MethodologyNote title="How peer benchmarking is computed">{d.methodology}</MethodologyNote>
        </>
      )}
    </div>
  );
}
