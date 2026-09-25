import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useCountUp } from "../../hooks/useCountUp";
import { useMotion } from "../../design/panel";
import { useTheme } from "../../design/themeContext";
import { IconTile } from "./Card";

/** Animated tabular number. Pass `format` for units / separators. */
export function CountUp({
  value,
  decimals = 0,
  format,
  className = "",
  duration = 900,
}: {
  value: number;
  decimals?: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const v = useCountUp(value, duration, decimals);
  const text = format ? format(v) : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span className={`num ${className}`}>{text}</span>;
}

/** Minimal area sparkline. Always fed from real series; renders a flat hairline if all zero. */
export function Sparkline({
  data,
  stroke,
  height = 40,
  id,
}: {
  data: { value: number }[];
  stroke?: string;
  height?: number;
  id: string;
}) {
  const th = useTheme();
  const line = stroke ?? th.c.accent;
  return (
    <div style={{ height }} className="-mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.28} />
              <stop offset="100%" stopColor={line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={line}
            strokeWidth={1.75}
            fill={`url(#spark-${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * KPI tile modelled on the reference stat cards: icon tile + label, big number,
 * hairline, then a footer line. Footer only renders real comparison data.
 */
export function StatTile({
  icon,
  label,
  value,
  decimals = 0,
  format,
  suffix,
  footer,
  badge,
  spark,
  delay = 0,
  valueTone,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
  decimals?: number;
  format?: (n: number) => string;
  suffix?: string;
  footer?: ReactNode;
  badge?: ReactNode;
  spark?: ReactNode;
  delay?: number;
  valueTone?: string;
}) {
  const m = useMotion();
  const enterprise = m.panel === "enterprise";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: m.enter, delay, ease: m.ease }}
      className="e2 interactive p-[var(--pad-card)] flex flex-col"
    >
      <div className="flex items-center gap-3">
        <IconTile size={enterprise ? "md" : "sm"}>{icon}</IconTile>
        <p className={`font-medium text-text-2 ${enterprise ? "text-base" : "text-sm"} leading-tight`}>{label}</p>
      </div>
      <p
        className={`num font-medium tracking-[-0.035em] text-ink ${enterprise ? "text-3xl mt-6 mb-5" : "text-2xl mt-4 mb-3"}`}
        style={valueTone ? { color: valueTone } : undefined}
      >
        {value === null ? (
          <span className="text-text-4">—</span>
        ) : (
          <>
            <CountUp value={value} decimals={decimals} format={format} />
            {suffix && <span className="text-text-3 text-[0.55em] ml-1 tracking-normal">{suffix}</span>}
          </>
        )}
      </p>
      {spark && <div className="mb-3">{spark}</div>}
      {(footer || badge) && (
        <div className="mt-auto pt-3 border-t border-line flex items-center justify-between gap-2">
          <span className="text-xs text-text-3 truncate">{footer}</span>
          {badge}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Segmented half-donut from the reference "Attack Surface" card.
 * Segments are proportional to real values; centre shows a real total.
 */
export function SegmentGauge({
  segments,
  center,
  caption,
  size = 240,
}: {
  segments: { value: number; color: string; label: string }[];
  center: ReactNode;
  caption?: string;
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.52;
  const stroke = size * 0.13;
  const gap = 0.025; // radians between segments
  const sweeps = segments.map((seg) => (seg.value / total) * Math.PI);
  const starts = sweeps.map((_, i) => Math.PI + sweeps.slice(0, i).reduce((s, x) => s + x, 0));
  const arcs = segments.map((seg, i) => {
    const start = starts[i] + (i === 0 ? 0 : gap / 2);
    const end = starts[i] + sweeps[i] - (i === segments.length - 1 ? 0 : gap / 2);
    const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x1, y1] = p(start);
    const [x2, y2] = p(Math.max(start, end));
    const large = end - start > Math.PI ? 1 : 0;
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: seg.color, label: seg.label };
  });
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.6 }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`} role="img" aria-label={caption}>
        {arcs.map((a, i) => (
          <motion.path
            key={a.label}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 text-center" style={{ top: cy - size * 0.13 }}>
        <div className="num text-3xl font-medium tracking-[-0.03em] text-ink leading-none">{center}</div>
        {caption && <p className="text-sm text-text-3 mt-2">{caption}</p>}
      </div>
    </div>
  );
}

/** Horizontal proportion bar used in breakdown rows. */
export function MeterRow({
  label,
  value,
  max,
  color,
  mono = false,
  right,
}: {
  label: ReactNode;
  value: number;
  max: number;
  color?: string;
  mono?: boolean;
  right?: ReactNode;
}) {
  const th = useTheme();
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm text-text-2 w-32 shrink-0 truncate ${mono ? "code" : ""}`}>{label}</span>
      <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color ?? th.c.ink2 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
      <span className="num text-sm text-ink w-12 text-right">{right ?? value.toLocaleString()}</span>
    </div>
  );
}

/** Key/value line used in detail panels. */
export function KeyValue({ label, value, mono = false }: { label: ReactNode; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-text-3 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-ink text-right break-all ${mono ? "code" : "num"}`}>{value}</span>
    </div>
  );
}
