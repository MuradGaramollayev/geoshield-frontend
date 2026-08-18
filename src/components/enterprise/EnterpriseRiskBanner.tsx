import { motion } from "framer-motion";
import { ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";

interface EnterpriseRiskBannerProps {
  score: number;
  level: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
  trendPercent?: number;
  countriesTracked: number;
}

const levelConfig = {
  LOW:      { color: "#34d399", label: "Low Risk" },
  MODERATE: { color: "#38bdf8", label: "Moderate Risk" },
  ELEVATED: { color: "#fbbf24", label: "Elevated Risk" },
  HIGH:     { color: "#fb923c", label: "High Risk" },
  CRITICAL: { color: "#f43f5e", label: "Critical Risk" },
};

export default function EnterpriseRiskBanner({
  score, level, trendPercent, countriesTracked,
}: EnterpriseRiskBannerProps) {
  const cfg = levelConfig[level];
  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference * (1 - score / 100);
  const hasTrend = typeof trendPercent === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-glow relative overflow-hidden p-8 flex items-center gap-10"
      style={{ borderColor: `${cfg.color}33` }}
    >
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: cfg.color }}
      />

      <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="50" fill="none"
            stroke="rgba(148,163,184,0.08)" strokeWidth="6" />
          <motion.circle
            cx="64" cy="64" r="50" fill="none"
            stroke={cfg.color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            transform="rotate(-90 64 64)"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold tracking-tight leading-none" style={{ color: cfg.color }}>
            {score}
          </span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1.5 text-center leading-tight px-2">
            Risk Index
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={16} className="text-slate-500" />
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
            Strategic Risk Summary
          </span>
        </div>
        <p className="text-3xl font-bold mb-3" style={{ color: cfg.color }}>
          {cfg.label}
        </p>
        {hasTrend ? (
          <div className="flex items-center gap-2">
            {trendPercent! >= 0 ? (
              <TrendingUp size={16} className="text-rose-400" />
            ) : (
              <TrendingDown size={16} className="text-emerald-400" />
            )}
            <span className={`text-sm font-medium ${trendPercent! >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {trendPercent! >= 0 ? "+" : ""}{trendPercent}%
            </span>
            <span className="text-sm text-slate-500">vs. last 30 days</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Monitoring {countriesTracked} countries in real time</p>
        )}
      </div>

      <div className="hidden lg:block text-right shrink-0">
        <p className="text-4xl font-bold text-slate-100">{countriesTracked}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Countries Tracked</p>
      </div>
    </motion.div>
  );
}