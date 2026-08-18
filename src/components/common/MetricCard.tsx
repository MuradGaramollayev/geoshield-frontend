import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  sparklineData: { value: number }[];
  accentColor?: string;
  delay?: number;
}

export default function MetricCard({
  label, value, icon: Icon, trend, trendLabel = "son 24 saat",
  sparklineData, accentColor = "#38bdf8", delay = 0,
}: MetricCardProps) {
  const hasTrend = typeof trend === "number";
  const isPositive = hasTrend && trend! >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-glow p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: `${accentColor}1a` }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? "text-rose-400 bg-rose-500/10"
                : "text-emerald-400 bg-emerald-500/10"
            }`}
          >
            {isPositive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(trend!)}%
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-100 mb-1 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-slate-500 mb-3">{label}</p>

      <div className="h-10 -mx-1">
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

      <p className="text-[10px] text-slate-600 mt-2">{trendLabel}</p>
    </motion.div>
  );
}