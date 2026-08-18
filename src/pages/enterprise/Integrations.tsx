import { useEffect, useState } from "react";
import { Plug, TrendingUp } from "lucide-react";
import Integrations from "../Integrations";
import { fetchRouting } from "../../services/api";
import type { RoutingConfig } from "../../services/api";

export default function EnterpriseIntegrations() {
  const [routing, setRouting] = useState<RoutingConfig | null>(null);

  useEffect(() => {
    fetchRouting().then(setRouting);
  }, []);

  const connected = routing?.integrations.filter((i) => i.connected).length || 0;
  const total = routing?.integrations.length || 0;
  const healthScore = total > 0 ? Math.round((connected / total) * 100) : 0;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Enterprise-wide connector health</p>
      </div>

      {/* Enterprise-only: Integration Health Score, real from Alert routing config */}
      <div className="card-glow p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `conic-gradient(#38bdf8 ${healthScore * 3.6}deg, rgba(148,163,184,0.1) 0deg)` }}
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
            <span className="text-sm font-bold text-sky-400">{healthScore}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-sky-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Integration Health Score
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {connected} of {total} routing integrations connected
            {" "}(configured in Alert Center → Routing Status)
          </p>
        </div>
      </div>

      <div className="card-glow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Available Connectors</h3>
        </div>
        <Integrations alertCenterPath="/enterprise/alerts" />
      </div>
    </div>
  );
}