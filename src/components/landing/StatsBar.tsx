import { useEffect, useState } from "react";
import { fetchStatus } from "../../services/api";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    let frame: number;

    const animate = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);

  return value;
}

function StatCard({ label, value, suffix, start }: StatItem & { start: boolean }) {
  const count = useCountUp(value, 1800, start);
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-slate-100 tabular-nums">
        {count.toLocaleString()}
        {suffix || ""}
      </p>
      <p className="text-xs text-slate-500 uppercase tracking-wider mt-2">{label}</p>
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<StatItem[] | null>(null);

  useEffect(() => {
    fetchStatus().then((s) => {
      setStats([
        { label: "Countries Monitored", value: s.data.countries },
        { label: "Threat Indicators", value: s.data.total_threats },
        { label: "Live Data Sources", value: s.data.sources },
        { label: "Hour Forecast Window", value: 72 },
      ]);
    });
  }, []);

  if (!stats) return null;

  return (
    <div className="border-y border-slate-800 bg-slate-900/40 py-12">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} start={true} />
        ))}
      </div>
    </div>
  );
}