import { Plug, Check } from "lucide-react";

const INTEGRATIONS = [
  { name: "Slack", desc: "Send alerts and notifications to a Slack channel", category: "Communication" },
  { name: "PagerDuty", desc: "Route critical incidents to on-call engineers", category: "Incident Response" },
  { name: "Jira", desc: "Auto-create tickets from incidents", category: "Ticketing" },
  { name: "Splunk", desc: "Forward threat indicators to your SIEM", category: "SIEM" },
  { name: "CrowdStrike", desc: "Cross-reference IOCs with endpoint telemetry", category: "EDR" },
  { name: "Microsoft Sentinel", desc: "Sync incidents with Azure Sentinel workspace", category: "SIEM" },
];

interface IntegrationsProps {
  alertCenterPath?: string;
}

export default function Integrations({ alertCenterPath = "/alerts" }: IntegrationsProps) {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Integrations</h1>
        <p className="text-sm text-slate-500">
          Connect GeoShield to your existing security stack
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integ) => (
          <div key={integ.name} className="card-glow p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Plug size={18} className="text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
                {integ.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">{integ.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{integ.desc}</p>
            <button className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded-lg py-2 hover:bg-slate-700 transition-colors">
              Not connected — set up
            </button>
          </div>
        ))}
      </div>

      <div className="card-glow p-4 flex items-start gap-3">
        <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          The Alert Center's Escalation Policy already supports Slack routing —
          configure it from{" "}
          <a href={alertCenterPath} className="text-emerald-400 hover:underline">
            Alert Center
          </a>
          . Other integrations shown here are planned for a future phase.
        </p>
      </div>
    </div>
  );
}