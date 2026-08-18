import { useEffect, useState } from "react";
import { fetchTimeline, buildHeatmapData } from "../../services/api";
import type { HeatmapCell } from "../../services/api";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKS = 4;

function interpolate(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export default function AttackHeatmap() {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  useEffect(() => {
    fetchTimeline(WEEKS * 7 + 7)
      .then((data) => setCells(buildHeatmapData(data.events, WEEKS)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card-glow p-6 text-slate-500 text-sm">Loading heatmap...</div>;
  if (error) return <div className="card-glow p-6 text-rose-400 text-sm">Error: {error}</div>;

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  const intensityColor = (count: number) => {
    if (count === 0) return "rgba(148,163,184,0.06)";
    const t = count / maxCount;
    if (t < 0.5) {
      const localT = t / 0.5;
      return interpolate("#0f766e", "#f59e0b", localT);
    }
    return interpolate("#f59e0b", "#f43f5e", (t - 0.5) / 0.5);
  };

  return (
    <div className="card-glow p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Attack Intensity Heatmap</h3>
          <p className="text-xs text-slate-500 mt-0.5">Event density by day, last {WEEKS} weeks</p>
        </div>
        {hoveredCell && (
          <div className="text-xs text-slate-400">
            Week {WEEKS - hoveredCell.week} · {DAY_LABELS[hoveredCell.day]}:{" "}
            <span className="font-semibold text-slate-200">{hoveredCell.count} events</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col justify-between py-1 shrink-0">
          {Array.from({ length: WEEKS }).map((_, w) => (
            <span key={w} className="text-[10px] text-slate-600 h-8 flex items-center">
              W{WEEKS - w}
            </span>
          ))}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d) => (
              <span key={d} className="text-[10px] text-slate-600 text-center">{d}</span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: WEEKS }).map((_, w) => (
              <div key={w} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, d) => {
                  const cell = cells.find((c) => c.week === w && c.day === d);
                  const count = cell?.count || 0;
                  return (
                    <div
                      key={d}
                      onMouseEnter={() => setHoveredCell(cell || null)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="h-8 rounded-md cursor-pointer transition-transform hover:scale-105"
                      style={{ background: intensityColor(count) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-[10px] text-slate-600">Less</span>
        <div className="flex gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="w-3 h-3 rounded-sm"
              style={{ background: intensityColor(t * maxCount) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </div>
  );
}