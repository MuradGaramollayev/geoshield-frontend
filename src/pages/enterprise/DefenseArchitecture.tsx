import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, Radar, Archive, Search, Info, Server } from "lucide-react";
import {
  fetchDefenseStats,
  classifyIp,
  fetchHoneypotActivity,
  fetchQuarantineActivity,
} from "../../services/api";
import type { DefenseStats, DefenseClassification, DefenseLogEntry } from "../../services/api";

function formatTimestamp(ts: string): string {
  const cleaned = ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export default function DefenseArchitecture() {
  const [stats, setStats] = useState<DefenseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ipInput, setIpInput] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState<DefenseClassification | null>(null);

  const [activeTab, setActiveTab] = useState<"honeypot" | "quarantine">("honeypot");
  const [honeypotLog, setHoneypotLog] = useState<DefenseLogEntry[]>([]);
  const [quarantineLog, setQuarantineLog] = useState<DefenseLogEntry[]>([]);

  const loadStats = () => {
    fetchDefenseStats().then(setStats).catch((err) => setError(err.message));
  };

  const loadLogs = () => {
    fetchHoneypotActivity().then((d) => setHoneypotLog(d.entries));
    fetchQuarantineActivity().then((d) => setQuarantineLog(d.entries));
  };

  useEffect(() => {
    loadStats();
    loadLogs();
  }, []);

  const handleClassify = async () => {
    if (!ipInput.trim()) return;
    setClassifying(true);
    setClassifyResult(null);
    try {
      const result = await classifyIp(ipInput.trim());
      setClassifyResult(result);
      loadLogs();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClassifying(false);
    }
  };

  if (error) return <div className="p-8 text-rose-400 text-sm">Error: {error}</div>;
  if (!stats) return <div className="p-8 text-slate-400 text-sm">Loading defense architecture...</div>;

  const classColor = classifyResult?.classification === "HONEYPOT" ? "#f43f5e"
    : classifyResult?.classification === "QUARANTINE" ? "#fbbf24" : "#34d399";

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Defense Architecture</h1>
        <p className="text-sm text-slate-500 mt-1">Layered deception and traffic classification model</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-glow p-5">
          <p className="text-2xl font-bold text-slate-100">{stats.total_detected.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Detected</p>
        </div>
        <div className="card-glow p-5">
          <p className="text-2xl font-bold text-sky-400">{stats.layer1_blocked.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Layer 1 Blocked</p>
        </div>
        <div className="card-glow p-5">
          <p className="text-2xl font-bold text-rose-400">{stats.honeypot_routed.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Honeypot Routed</p>
        </div>
        <div className="card-glow p-5">
          <p className="text-2xl font-bold text-amber-400">{stats.quarantine_routed.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Quarantine Routed</p>
        </div>
      </div>

      {/* Animated 2-layer diagram */}
      <div className="card-glow p-8">
        <h3 className="text-sm font-semibold text-slate-200 mb-6">Layered Defense Flow</h3>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-slate-800 border border-sky-500/30 rounded-xl px-6 py-4 w-full max-w-sm justify-center"
          >
            <Shield size={20} className="text-sky-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-100">Layer 1: Perimeter</p>
              <p className="text-xs text-slate-500">{stats.total_detected.toLocaleString()} indicators evaluated</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 32 }}
            transition={{ delay: 0.2 }}
            className="w-px bg-slate-700"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 bg-slate-800 border border-violet-500/30 rounded-xl px-6 py-4 w-full max-w-sm justify-center"
          >
            <Radar size={20} className="text-violet-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-100">Layer 2: Deception</p>
              <p className="text-xs text-slate-500">{stats.layer2_escalated.toLocaleString()} escalated</p>
            </div>
          </motion.div>

          <div className="flex gap-8 mt-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-5 py-3"
            >
              <ShieldAlert size={18} className="text-rose-400" />
              <div>
                <p className="text-xs font-semibold text-rose-400">Honeypot Zone</p>
                <p className="text-xs text-slate-500">{stats.honeypot_routed.toLocaleString()}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3"
            >
              <Archive size={18} className="text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-400">Quarantine Zone</p>
                <p className="text-xs text-slate-500">{stats.quarantine_routed.toLocaleString()}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Live classifier */}
      <div className="card-glow p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Test IP Classification</h3>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1 mb-4">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClassify()}
            placeholder="Enter an IP address to classify"
            className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-slate-600"
          />
          <button
            onClick={handleClassify}
            disabled={classifying}
            className="bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {classifying ? "Classifying..." : "Classify"}
          </button>
        </div>

        {classifyResult && (
          <div className="bg-slate-800/40 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-200">{classifyResult.ip}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: classColor, background: `${classColor}22` }}
              >
                {classifyResult.classification}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Risk score: {classifyResult.risk_score} · Confirmed by {classifyResult.source_hits} sources
            </p>
          </div>
        )}
      </div>

      {/* Activity logs */}
      <div className="card-glow overflow-hidden">
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab("honeypot")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "honeypot" ? "text-rose-400 border-b-2 border-rose-400" : "text-slate-500"
            }`}
          >
            Honeypot Activity ({honeypotLog.length})
          </button>
          <button
            onClick={() => setActiveTab("quarantine")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "quarantine" ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-500"
            }`}
          >
            Quarantine Activity ({quarantineLog.length})
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          {(activeTab === "honeypot" ? honeypotLog : quarantineLog).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No activity yet. Classify an IP above.</p>
          ) : (
            (activeTab === "honeypot" ? honeypotLog : quarantineLog).map((entry) => (
              <div key={entry.log_id} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <Server size={14} className="text-slate-500" />
                  <div>
                    <p className="text-sm font-mono text-slate-200">{entry.ip}</p>
                    <p className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Risk {entry.risk_score}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Methodology note */}
      <div className="card-glow p-4 flex items-start gap-3">
        <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">{stats.methodology}</p>
      </div>
    </div>
  );
}