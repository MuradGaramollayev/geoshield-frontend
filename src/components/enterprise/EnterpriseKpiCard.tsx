import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface EnterpriseKpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  sparklineData?: { value: number }[];
  accentColor?: string;
  delay?: number;
}

export default function EnterpriseKpiCard({
  label, value, icon: Icon, trend, trendLabel,
  sparklineData, accentColor = "#38bdf8", delay = 0,
}: EnterpriseKpiCardProps) {
  const hasTrend = typeof trend === "number";
  const isPositive = hasTrend && trend! >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-glow p-6 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5 rounded-lg"
          style={{ background: `${accentColor}1a` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend!)}%
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-slate-100 mb-1 tabular-nums tracking-tight">
        {value}
      </p>
      <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">{label}</p>

      {sparklineData && sparklineData.length > 1 && (
        <div className="h-8 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendLabel && <p className="text-[10px] text-slate-600 mt-2">{trendLabel}</p>}
    </motion.div>
  );
}