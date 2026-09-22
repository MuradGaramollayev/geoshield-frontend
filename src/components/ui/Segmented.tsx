import { motion } from "framer-motion";
import { useId } from "react";
import { useMotion } from "../../design/panel";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Segmented control from the reference ("All / Open / Close"). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const id = useId();
  const m = useMotion();
  const h = size === "sm" ? "h-7 text-xs px-2.5" : "h-9 text-sm px-3.5";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 p-1 rounded-[12px] bg-sunken"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative ${h} rounded-[9px] font-semibold whitespace-nowrap interactive ${
              active ? "text-ink" : "text-text-3 hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[9px] bg-paper shadow-[var(--shadow-e3)]"
                transition={{ duration: m.duration, ease: m.ease }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {o.label}
              {typeof o.count === "number" && (
                <span className={`num text-2xs ${active ? "text-text-2" : "text-text-3"}`}>{o.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
