import type { ReactNode } from "react";
import { color as C } from "./tokens";

interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
  dataKey?: string | number;
}

/** Glass tooltip matching the e4 overlay level. */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
  labelFormat,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  format?: (v: number | string, item: TooltipPayloadItem) => ReactNode;
  labelFormat?: (l: string | number) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="e4 px-3.5 py-2.5 min-w-[140px] text-sm">
      {label !== undefined && label !== "" && (
        <p className="text-xs font-semibold text-text-2 mb-1.5">{labelFormat ? labelFormat(label) : label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color ?? C.ink2 }} />
            <span className="text-text-2 flex-1">{p.name}</span>
            <span className="num font-semibold text-ink">
              {format ? format(p.value ?? "", p) : typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
