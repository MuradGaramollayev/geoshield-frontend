import { useState } from "react";
import { Link } from "react-router-dom";
import { Bug, Globe2, Network, Server } from "lucide-react";
import { fetchMalwareSpread, fetchOperator, fetchOperators } from "../services/api";
import type { OperatorRow } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useTheme } from "../design/themeContext";
import {
  Badge, Card, CardHeader, Drawer, EmptyState, ErrorState, KeyValue, MethodologyNote,
  PageHeader, Segmented, Skeleton, StatTile, Table, Th, rowClass,
} from "../components/ui";

const REACH_OPTIONS = [
  { value: "2", label: "2+ countries" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

/** Country chips, truncated with a count so a wide row stays readable. */
function Countries({ codes, max = 6 }: { codes: { code: string; addresses: number }[]; max?: number }) {
  const shown = codes.slice(0, max);
  const rest = codes.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {shown.map((c) => (
        <span key={c.code} className="code rounded-[6px] bg-sunken px-1.5 py-0.5 text-2xs text-text-2">
          {c.code} {c.addresses}
        </span>
      ))}
      {rest > 0 && <span className="text-2xs text-text-3">+{rest}</span>}
    </span>
  );
}

/**
 * The evidence behind the map's threat-flow arcs: network operators whose
 * listed addresses span borders, and malware families whose C2 servers do the
 * same. Every row is a count of listed addresses, and the addresses behind it
 * can be opened.
 */
export default function InfrastructureCorrelation() {
  const th = useTheme();
  const [reach, setReach] = useState("2");
  const [open, setOpen] = useState<string | null>(null);

  const ops = useAsync(() => fetchOperators(Number(reach), 40), [reach]);
  const malware = useAsync(fetchMalwareSpread, []);
  const detail = useAsync(() => (open ? fetchOperator(open) : Promise.resolve(null)), [open]);

  const d = ops.data;
  const crossBorderShare =
    d && d.addresses_listed > 0
      ? Math.round((d.addresses_in_cross_border_operators / d.addresses_listed) * 100)
      : 0;

  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader
        title="Infrastructure correlation"
        description="Network operators and malware families whose listed infrastructure appears in more than one country."
        actions={
          <Segmented
            options={REACH_OPTIONS}
            value={reach}
            onChange={setReach}
            size="sm"
            ariaLabel="Minimum country reach"
          />
        }
      />

      {ops.error ? (
        <ErrorState message={ops.error} onRetry={ops.reload} />
      ) : !d ? (
        <div className="grid gap-[var(--gap-grid)] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[16px]" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-[var(--gap-grid)] sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={<Server size={16} />}
              label="Addresses listed"
              value={d.addresses_listed}
              footer="AbuseIPDB geolocated feed"
            />
            <StatTile
              icon={<Network size={16} />}
              label="Operators represented"
              value={d.total_operators}
              footer="Distinct networks in the feed"
            />
            <StatTile
              icon={<Globe2 size={16} />}
              label={`Operators in ${reach}+ countries`}
              value={d.cross_border_operators}
              footer={`${d.addresses_in_cross_border_operators} of ${d.addresses_listed} addresses`}
            />
            <StatTile
              icon={<Globe2 size={16} />}
              label="Share of addresses"
              value={crossBorderShare}
              suffix="%"
              footer="Sitting with a cross-border operator"
            />
          </div>

          <div className="grid gap-[var(--gap-grid)] 2xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
            <Card>
              <CardHeader
                title="Cross-border operators"
                description="Reach is the number of countries the operator's listed addresses fall in; concentration is the share sitting in its largest one."
              />
              {d.operators.length === 0 ? (
                <EmptyState icon={<Network size={20} />} title="No operator spans that many countries" />
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Operator</Th>
                      <Th align="right">Reach</Th>
                      <Th align="right">Addresses</Th>
                      <Th align="right">Concentration</Th>
                      <Th>Countries</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.operators.map((o: OperatorRow) => (
                      <tr
                        key={o.operator}
                        className={`${rowClass} cursor-pointer`}
                        onClick={() => setOpen(o.operator)}
                      >
                        <td className="px-4 py-2.5 text-sm text-ink">{o.operator}</td>
                        <td className="num px-4 py-2.5 text-right text-sm font-semibold text-ink">
                          {o.country_count}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-sm text-text-2">{o.addresses}</td>
                        <td className="num px-4 py-2.5 text-right text-sm text-text-2">{o.concentration}%</td>
                        <td className="px-4 py-2.5"><Countries codes={o.countries} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Malware families across borders"
                description={malware.data ? `${malware.data.servers_listed} C2 servers listed by Feodo Tracker` : "Feodo Tracker"}
              />
              {malware.error ? (
                <ErrorState message={malware.error} onRetry={malware.reload} />
              ) : !malware.data ? (
                <Skeleton className="h-32 rounded-[12px]" />
              ) : malware.data.families.length === 0 ? (
                <EmptyState icon={<Bug size={20} />} title="No C2 servers currently listed" />
              ) : (
                <div className="space-y-4">
                  {malware.data.families.map((f) => (
                    <div key={f.family}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">{f.family}</span>
                        <Badge tone={f.country_count > 1 ? "accent" : "neutral"}>
                          {f.country_count === 1 ? "1 country" : `${f.country_count} countries`}
                        </Badge>
                      </div>
                      <p className="num mt-1 text-2xs text-text-3">{f.servers} C2 servers</p>
                      <div className="mt-1.5">
                        <Countries codes={f.countries.map((c) => ({ code: c.code, addresses: c.servers }))} />
                      </div>
                    </div>
                  ))}
                  <p className="border-t border-line pt-3 text-2xs text-text-3">
                    {malware.data.methodology}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <MethodologyNote title="How correlation is computed">{d.methodology}</MethodologyNote>
        </>
      )}

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ?? ""}
        subtitle={detail.data ? `${detail.data.addresses} listed addresses across ${detail.data.country_count} countries` : "Loading"}
        width={520}
      >
        {detail.loading || !detail.data ? (
          <Skeleton className="h-40 rounded-[12px]" />
        ) : (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">By country</p>
              {detail.data.countries.map((c) => (
                <KeyValue key={c.code} label={c.code} value={`${c.addresses} addresses`} />
              ))}
            </div>

            {detail.data.cities.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Where they sit</p>
                {detail.data.cities.map((c) => (
                  <KeyValue key={c.city} label={c.city} value={`${c.addresses}`} />
                ))}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Listed addresses
                <span className="ml-2 text-2xs font-normal text-text-3">
                  the rows this grouping rests on
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detail.data.sample_addresses.map((ip) => (
                  <Link
                    key={ip}
                    to={`/analyst/ioc-explorer?ip=${encodeURIComponent(ip)}`}
                    className="code rounded-[6px] bg-sunken px-2 py-1 text-2xs text-text-2 interactive hover:bg-well hover:text-ink"
                    style={{ borderColor: th.c.line }}
                  >
                    {ip}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
