import { motion } from "framer-motion";
import { severityForScore } from "../../design/tokens";
import { useTheme } from "../../design/themeContext";
import { useMotion } from "../../design/panel";
import { formatAsOf } from "../../services/api";
import type { StatusData } from "../../services/api";
import { CountUp, SeverityBadge } from "../ui";

/**
 * Global risk index hero. The index is the backend's volume-weighted mean of
 * country scores; the band uses the same thresholds as country severity.
 */
export default function RiskIndexCard({ status }: { status: StatusData }) {
  const th = useTheme();
  const m = useMotion();
  const enterprise = m.panel === "enterprise";
  const score = status.data.avg_risk;
  const sev = severityForScore(score);
  const size = enterprise ? 168 : 128;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: m.enter, ease: m.ease }}
      className={`e2 relative overflow-hidden flex flex-wrap items-center ${enterprise ? "gap-10 p-9" : "gap-6 p-5"}`}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sunken)" strokeWidth={enterprise ? 12 : 10} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={th.riskColor(score)} strokeWidth={enterprise ? 12 : 10} strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CountUp value={score} className={`${enterprise ? "text-4xl" : "text-3xl"} font-medium tracking-[-0.04em] text-ink`} />
          <span className="text-xs text-text-3">of 100</span>
        </div>
      </div>

      <div className="flex-1 min-w-[240px]">
        <p className={`text-text-2 ${enterprise ? "text-md" : "text-sm"} mb-1`}>{enterprise ? "Global risk exposure" : "Global cyber risk index"}</p>
        <p className={`font-semibold tracking-[-0.02em] ${enterprise ? "text-3xl" : "text-2xl"}`} style={{ color: th.sev[sev].text }}>
          {th.sev[sev].label} risk
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SeverityBadge severity={sev} />
          <span className="text-sm text-text-3">
            Volume-weighted across {status.data.countries} countries · data as of {formatAsOf(status.as_of)}
          </span>
        </div>
      </div>

      <dl className={`grid grid-cols-2 ${enterprise ? "gap-x-10 gap-y-5" : "gap-x-8 gap-y-3"} shrink-0`}>
        {[
          { v: status.data.total_threats, l: "Threat indicators" },
          { v: status.data.countries, l: "Countries monitored" },
          { v: status.data.critical, l: "Critical countries", tone: th.sev.CRITICAL.text },
          { v: status.data.high, l: "High-risk countries", tone: th.sev.HIGH.text },
        ].map((k) => (
          <div key={k.l}>
            <dd className={`num font-medium tracking-[-0.03em] ${enterprise ? "text-2xl" : "text-xl"}`} style={{ color: k.tone ?? "var(--color-ink)" }}>
              <CountUp value={k.v} />
            </dd>
            <dt className="text-sm text-text-3">{k.l}</dt>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}
