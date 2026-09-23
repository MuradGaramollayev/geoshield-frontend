import { Check, Minus, X } from "lucide-react";
import { revealStyle, useReveal } from "./reveal";

type Cell = true | false | "partial";

const ROWS: { feature: string; geoshield: Cell; siem: Cell }[] = [
  { feature: "Useful on the first day", geoshield: true, siem: false },
  { feature: "Country-level risk scoring", geoshield: true, siem: false },
  { feature: "Pre-aggregated from nine public feeds", geoshield: true, siem: "partial" },
  { feature: "Built-in MITRE ATT&CK mapping", geoshield: true, siem: "partial" },
  { feature: "Natural-language questions over your data", geoshield: true, siem: false },
  { feature: "Ingests your own logs", geoshield: false, siem: true },
  { feature: "Needs dedicated infrastructure", geoshield: false, siem: true },
];

function Mark({ value }: { value: Cell }) {
  const base = "inline-flex h-6 w-6 items-center justify-center rounded-full";
  if (value === true) return <span className={`${base} bg-sev-low-tint text-sev-low-text`}><Check size={14} /></span>;
  if (value === false) return <span className={`${base} bg-well text-text-3`}><X size={14} /></span>;
  return <span className={`${base} bg-sev-medium-tint text-sev-medium-text`}><Minus size={14} /></span>;
}

/** Where GeoShield fits next to a SIEM — including what it deliberately is not. */
export default function Comparison() {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="e2 overflow-hidden rounded-[18px]" style={revealStyle(shown)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            <th className="p-4 text-left text-2xs font-semibold uppercase tracking-[0.12em] text-text-3">Capability</th>
            <th className="p-4 text-center text-2xs font-semibold uppercase tracking-[0.12em] text-accent-ink">GeoShield</th>
            <th className="p-4 text-center text-2xs font-semibold uppercase tracking-[0.12em] text-text-3">Traditional SIEM</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.feature} className="border-b border-line last:border-0 hover:bg-sunken">
              <td className="p-4 text-sm text-ink">{r.feature}</td>
              <td className="p-4 text-center"><Mark value={r.geoshield} /></td>
              <td className="p-4 text-center"><Mark value={r.siem} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-3 text-xs text-text-3">
        GeoShield is external intelligence, not a log platform. It answers where risk is
        concentrating; a SIEM answers what happened inside your estate.
      </p>
    </div>
  );
}
