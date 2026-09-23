import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Archive, Radar, Server, Shield, ShieldAlert } from "lucide-react";
import {
  classifyIp,
  fetchDefenseStats,
  fetchHoneypotActivity,
  fetchQuarantineActivity,
} from "../../services/api";
import type { DefenseClassification, DefenseLogEntry, DefenseStats } from "../../services/api";
import { useTheme } from "../../design/themeContext";
import { useMotion } from "../../design/panel";
import { formatTs } from "../../utils/time";
import {
  Button, Card, CardHeader, CountUp, EmptyState, ErrorState, MethodologyNote, PageHeader, Segmented, SkeletonCard, StatTile,
} from "../../components/ui";

// Visual mapping only: honeypot = highest-risk routing, quarantine = mid, monitoring = low.
const CLASS_SEVERITY = {
  HONEYPOT: "CRITICAL",
  QUARANTINE: "MEDIUM",
  MONITORING: "LOW",
} as const;

const CLASS_LABEL = { HONEYPOT: "Routed to honeypot", QUARANTINE: "Routed to quarantine", MONITORING: "Monitoring only" } as const;

export default function DefenseArchitecture() {
  const th = useTheme();
  const [stats, setStats] = useState<DefenseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ipInput, setIpInput] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState<DefenseClassification | null>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"honeypot" | "quarantine">("honeypot");
  const [honeypotLog, setHoneypotLog] = useState<DefenseLogEntry[]>([]);
  const [quarantineLog, setQuarantineLog] = useState<DefenseLogEntry[]>([]);
  const m = useMotion();

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
    setClassifyError(null);
    try {
      const result = await classifyIp(ipInput.trim());
      setClassifyResult(result);
      loadLogs();
      loadStats();
    } catch (err) {
      setClassifyError(err instanceof Error ? err.message : String(err));
    } finally {
      setClassifying(false);
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Defense Architecture" />
        <ErrorState message={error} onRetry={() => { setError(null); loadStats(); loadLogs(); }} />
      </div>
    );
  }

  const log = activeTab === "honeypot" ? honeypotLog : quarantineLog;
  const tone = classifyResult ? th.sev[CLASS_SEVERITY[classifyResult.classification]] : null;

  return (
    <div>
      <PageHeader
        title="Defense Architecture"
        description="How incoming threat indicators flow through a two-layer model: perimeter blocking, then deception and quarantine."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={0} />)
        ) : (
          <>
            <StatTile icon={<Shield size={18} />} label="Indicators evaluated" value={stats.total_detected} />
            <StatTile icon={<Shield size={18} />} label="Blocked at the perimeter" value={stats.layer1_blocked} delay={0.07} />
            <StatTile icon={<ShieldAlert size={18} />} label="Routed to honeypot" value={stats.honeypot_routed} delay={0.14} />
            <StatTile icon={<Archive size={18} />} label="Routed to quarantine" value={stats.quarantine_routed} delay={0.21} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-[var(--gap-grid)] mb-[var(--gap-grid)]">
        <Card className="xl:col-span-3">
          <CardHeader title="Layered defence flow" description="Indicator counts at each stage" />
          {!stats ? (
            <div className="skeleton h-72 rounded-[16px]" />
          ) : (
            <div className="flex flex-col items-center py-2">
              {[
                { icon: Shield, title: "Layer 1 · Perimeter", sub: <><CountUp value={stats.total_detected} /> indicators evaluated</>, tone: "ink" },
                { icon: Radar, title: "Layer 2 · Deception", sub: <><CountUp value={stats.layer2_escalated} /> escalated</>, tone: "paper" },
              ].map((layer, i) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.title} className="w-full max-w-md flex flex-col items-center">
                    {i > 0 && (
                      <motion.span
                        className="w-px bg-line-strong"
                        initial={{ height: 0 }}
                        animate={{ height: 36 }}
                        transition={{ duration: m.enter, delay: 0.2 }}
                      />
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: m.enter, delay: i * 0.25 }}
                      className={`w-full flex items-center gap-4 rounded-[18px] px-6 py-4 ${
                        layer.tone === "ink" ? "bg-ink-2 text-paper" : "e3"
                      }`}
                    >
                      <Icon size={22} className={layer.tone === "ink" ? "text-accent" : "text-ink"} />
                      <div>
                        <p className="text-base font-semibold">{layer.title}</p>
                        <p className={`text-sm num ${layer.tone === "ink" ? "text-paper/70" : "text-text-3"}`}>{layer.sub}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <motion.span className="w-px bg-line-strong" initial={{ height: 0 }} animate={{ height: 28 }} transition={{ duration: m.enter, delay: 0.5 }} />
              <div className="w-full max-w-md grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldAlert, label: "Honeypot zone", v: stats.honeypot_routed, t: th.sev.CRITICAL },
                  { icon: Archive, label: "Quarantine zone", v: stats.quarantine_routed, t: th.sev.MEDIUM },
                ].map((z, i) => {
                  const Icon = z.icon;
                  return (
                    <motion.div
                      key={z.label}
                      initial={{ opacity: 0, x: i ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: m.enter, delay: 0.6 }}
                      className="rounded-[16px] px-4 py-3.5 flex items-center gap-3"
                      style={{ background: z.t.tint, color: z.t.text }}
                    >
                      <Icon size={20} />
                      <div>
                        <p className="text-sm font-semibold">{z.label}</p>
                        <p className="num text-lg font-medium text-ink"><CountUp value={z.v} /></p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Classify an IP" description="Runs the live classifier and records the result in the activity log" />
          <form
            className="flex gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleClassify();
            }}
          >
            <div className="field flex-1">
              <input
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="e.g. 45.148.10.141"
                aria-label="IP address to classify"
                className="code"
                spellCheck={false}
              />
            </div>
            <Button type="submit" variant="primary" loading={classifying}>Classify</Button>
          </form>
          {classifyError && <p role="alert" className="text-sm text-sev-critical-text mb-3">Classification failed: {classifyError}</p>}
          {classifyResult && tone && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: m.duration + 0.1 }}
              className="rounded-[16px] p-5"
              style={{ background: tone.tint }}
            >
              <p className="code text-md font-semibold text-ink mb-1">{classifyResult.ip}</p>
              <p className="text-lg font-semibold mb-3" style={{ color: tone.text }}>{CLASS_LABEL[classifyResult.classification]}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="num text-2xl font-medium text-ink">{classifyResult.risk_score}</p>
                  <p className="text-sm text-text-2">Risk score</p>
                </div>
                <div>
                  <p className="num text-2xl font-medium text-ink">{classifyResult.source_hits}</p>
                  <p className="text-sm text-text-2">Confirming sources</p>
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </div>

      <Card pad="none" className="mb-[var(--gap-grid)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-[var(--pad-card)] pt-[var(--pad-card)] pb-4">
          <h3 className="text-md font-semibold text-ink">Routing activity</h3>
          <Segmented
            ariaLabel="Activity log"
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "honeypot", label: "Honeypot", count: honeypotLog.length },
              { value: "quarantine", label: "Quarantine", count: quarantineLog.length },
            ]}
          />
        </div>
        {log.length === 0 ? (
          <EmptyState icon={<Server size={20} />} title="No routing activity yet" description="Classify an IP above to create the first entry." />
        ) : (
          <ul className="divide-y divide-line max-h-80 overflow-y-auto">
            {log.map((entry) => (
              <li key={entry.log_id} className="flex items-center gap-4 px-[var(--pad-card)] py-3">
                <Server size={16} className="text-text-3" />
                <span className="code text-base text-ink flex-1">{entry.ip}</span>
                <span className="text-sm text-text-3 hidden md:block">{entry.reason}</span>
                <span className="text-sm text-text-3">{formatTs(entry.timestamp)}</span>
                <span className="num text-sm font-semibold text-ink w-16 text-right">Risk {entry.risk_score}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {stats && (
        <MethodologyNote>
          <p>{stats.methodology}</p>
        </MethodologyNote>
      )}
    </div>
  );
}
