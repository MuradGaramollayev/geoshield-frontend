import { motion } from "framer-motion";
import { ShieldAlert, TrendingUp, Globe, Activity } from "lucide-react";

interface RiskBannerProps {
  score: number;
  level: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
  trend?: number;
  topCountry: string;
  activeIndicators: number;
}

const levelConfig = {
  LOW:      { color: "#34d399", label: "Low Risk" },
  MODERATE: { color: "#38bdf8", label: "Moderate Risk" },
  ELEVATED: { color: "#fbbf24", label: "Elevated Risk" },
  HIGH:     { color: "#fb923c", label: "High Risk" },
  CRITICAL: { color: "#f43f5e", label: "Critical Risk" },
};

export default function RiskBanner({
  score, level, trend, topCountry, activeIndicators,
}: RiskBannerProps) {
  const cfg = levelConfig[level];
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference * (1 - score / 100);
  const hasTrend = typeof trend === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-glow relative overflow-hidden p-6 flex items-center gap-8"
      style={{ borderColor: `${cfg.color}33` }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: cfg.color }}
      />

      <div className="relative shrink-0">
        <svg width="112" height="112" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="44" fill="none"
            stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
          <motion.circle
            cx="56" cy="56" r="44" fill="none"
            stroke={cfg.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 56 56)"
            style={{ filter: `drop-shadow(0 0 6px ${cfg.color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: cfg.color }}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={18} style={{ color: cfg.color }} />
          <h2 className="text-lg font-semibold text-slate-100">
            Global Cyber Risk Level
          </h2>
        </div>
        <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>
          {cfg.label}
        </p>
        <p className="text-sm text-slate-400">
          {hasTrend ? (
            <>
              Risk score changed{" "}
              <span className={trend! >= 0 ? "text-rose-400" : "text-emerald-400"}>
                {trend! >= 0 ? "+" : ""}{trend}%
              </span>{" "}
              in the last 24 hours
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Live monitoring active
            </span>
          )}
        </p>
      </div>

      <div className="hidden lg:flex flex-col gap-3 shrink-0 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Globe size={15} className="text-sky-400" />
          Highest risk region: <span className="font-semibold text-slate-100">{topCountry}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Activity size={15} className="text-sky-400" />
          Active indicators: <span className="font-semibold text-slate-100">
            {activeIndicators.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <TrendingUp size={15} className="text-sky-400" />
          Sources: <span className="font-semibold text-slate-100">9 live feeds</span>
        </div>
      </div>
    </motion.div>
  );
}