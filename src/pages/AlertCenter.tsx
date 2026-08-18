import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Ban, Plus, Globe, Clock, Check } from "lucide-react";
import {
  fetchIncidents,
  fetchEscalation,
  updateEscalation,
  fetchRouting,
  toggleRouting,
} from "../services/api";
import type { Incident, EscalationPolicy, RoutingConfig } from "../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

function formatTimestamp(ts: string): string {
  const cleaned = ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export default function AlertCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [escalation, setEscalation] = useState<EscalationPolicy | null>(null);
  const [critMin, setCritMin] = useState("");
  const [highMin, setHighMin] = useState("");
  const [email, setEmail] = useState("");
  const [savingEscalation, setSavingEscalation] = useState(false);
  const [savedEscalation, setSavedEscalation] = useState(false);

  const [routing, setRouting] = useState<RoutingConfig | null>(null);
  const [togglingName, setTogglingName] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data.incidents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetchEscalation().then((data) => {
      setEscalation(data);
      setCritMin(data.critical_notify_minutes?.toString() || "");
      setHighMin(data.high_notify_minutes?.toString() || "");
      setEmail(data.notify_email || "");
    });

    fetchRouting().then(setRouting);
  }, []);

  const handleSaveEscalation = async () => {
    setSavingEscalation(true);
    try {
      const updated = await updateEscalation({
        critical_notify_minutes: critMin ? parseInt(critMin, 10) : undefined,
        high_notify_minutes: highMin ? parseInt(highMin, 10) : undefined,
        notify_email: email || undefined,
      });
      setEscalation(updated);
      setSavedEscalation(true);
      setTimeout(() => setSavedEscalation(false), 2000);
    } catch (err) {
      // silently fail — could add error state here
    } finally {
      setSavingEscalation(false);
    }
  };

  const handleToggleRouting = async (name: string, currentlyConnected: boolean) => {
    setTogglingName(name);
    try {
      const updated = await toggleRouting(name, !currentlyConnected);
      setRouting(updated);
    } finally {
      setTogglingName(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;
  }

  const counts = {
    CRITICAL: incidents.filter((i) => i.severity === "CRITICAL").length,
    HIGH: incidents.filter((i) => i.severity === "HIGH").length,
    MEDIUM: incidents.filter((i) => i.severity === "MEDIUM").length,
    LOW: incidents.filter((i) => i.severity === "LOW").length,
  };

  const sorted = [...incidents].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Alert Center</h1>
        <p className="text-sm text-slate-500">{incidents.length} active alerts, derived from open incidents</p>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="card-glow p-4">
            <p className="text-2xl font-bold" style={{ color: SEVERITY_COLOR[sev] }}>
              {counts[sev]}
            </p>
            <p className="text-xs text-slate-500 mt-1">{sev}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h3>
          {sorted.length === 0 ? (
            <div className="card-glow p-8 text-center text-slate-500 text-sm">No active alerts</div>
          ) : (
            sorted.map((incident) => {
              const color = SEVERITY_COLOR[incident.severity] || SEVERITY_COLOR.MEDIUM;
              return (
                <div key={incident.id} className="card-glow p-4" style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell size={14} style={{ color }} />
                      <span className="text-xs font-mono text-slate-500">{incident.id}</span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color, background: `${color}1a` }}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mb-2">{incident.title}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Globe size={11} /> {incident.source_country || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatTimestamp(incident.created_at)}
                    </span>
                    <span>{incident.attack_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded px-2 py-1 hover:bg-rose-500/20 transition-colors">
                      <Ban size={11} /> Respond
                    </button>
                    <button className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 transition-colors">
                      <AlertTriangle size={11} /> Escalate
                    </button>
                    <button className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 transition-colors">
                      <Plus size={11} /> Acknowledge
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Escalation Policy */}
          <div className="card-glow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Escalation Policy
              </h3>
              {escalation?.configured && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Configured
                </span>
              )}
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Critical — notify within (min)</label>
                <input
                  type="number"
                  value={critMin}
                  onChange={(e) => setCritMin(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">High — notify within (min)</label>
                <input
                  type="number"
                  value={highMin}
                  onChange={(e) => setHighMin(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Notify email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="soc@yourcompany.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald/50"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEscalation}
              disabled={savingEscalation}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-emerald text-navy font-semibold rounded-lg py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {savedEscalation ? (
                <><Check size={13} /> Saved</>
              ) : savingEscalation ? (
                "Saving..."
              ) : (
                "Save Escalation Rules"
              )}
            </button>

            {escalation?.updated_at && (
              <p className="text-[10px] text-slate-600 mt-2">
                Last updated: {formatTimestamp(escalation.updated_at)}
              </p>
            )}
          </div>

          {/* Routing Status */}
          <div className="card-glow p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Routing Status
            </h3>
            <div className="space-y-2">
              {routing?.integrations.map((integ) => (
                <div key={integ.name} className="flex items-center justify-between py-1">
                  <span className="text-sm text-slate-300">{integ.name}</span>
                  <button
                    onClick={() => handleToggleRouting(integ.name, integ.connected)}
                    disabled={togglingName === integ.name}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                      integ.connected
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {togglingName === integ.name ? "..." : integ.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
            {routing?.updated_at && (
              <p className="text-[10px] text-slate-600 mt-3">
                Last updated: {formatTimestamp(routing.updated_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}