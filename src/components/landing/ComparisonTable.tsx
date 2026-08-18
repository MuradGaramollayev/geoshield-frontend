import { Check, X, Minus } from "lucide-react";

type CellValue = true | false | "partial";

interface ComparisonRow {
  feature: string;
  geoshield: CellValue;
  siem: CellValue;
}

const ROWS: ComparisonRow[] = [
  { feature: "Setup time", geoshield: true, siem: false },
  { feature: "Predictive risk scoring (72h window)", geoshield: true, siem: false },
  { feature: "Pre-aggregated from 9 live sources", geoshield: true, siem: "partial" },
  { feature: "Country-level risk visualization", geoshield: true, siem: false },
  { feature: "Built-in MITRE ATT&CK mapping", geoshield: true, siem: "partial" },
  { feature: "AI-powered natural language queries", geoshield: true, siem: false },
  { feature: "Requires dedicated infrastructure", geoshield: false, siem: true },
  { feature: "Steep learning curve", geoshield: false, siem: true },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Check size={14} className="text-emerald-400" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center">
          <X size={14} className="text-rose-400" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center">
        <Minus size={14} className="text-amber-400" />
      </div>
    </div>
  );
}

export default function ComparisonTable() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            Comparison
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            GeoShield vs. traditional SIEM
          </h2>
        </div>

        <div className="card-glow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="p-4 text-center">
                  <span className="text-sm font-bold text-emerald-400">GeoShield</span>
                </th>
                <th className="p-4 text-center">
                  <span className="text-sm font-semibold text-slate-500">Traditional SIEM</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-300">{row.feature}</td>
                  <td className="p-4"><Cell value={row.geoshield} /></td>
                  <td className="p-4"><Cell value={row.siem} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}