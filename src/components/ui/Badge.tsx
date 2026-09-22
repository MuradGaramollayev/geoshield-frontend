import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { SEVERITY, toSeverity } from "../../design/tokens";
import { usePanel } from "../../design/panel";

/**
 * Severity chip. Analyst panel uses solid, high-saturation chips so triage-by-colour
 * is instant; Enterprise uses the same hues as tints. Colours come only from SEVERITY.
 */
export function SeverityBadge({
  severity,
  variant,
  size = "sm",
}: {
  severity: string;
  variant?: "solid" | "tint";
  size?: "xs" | "sm";
}) {
  const panel = usePanel();
  const sev = toSeverity(severity);
  if (!sev) {
    return (
      <span className="inline-flex items-center rounded-full bg-sunken text-text-2 px-2 py-0.5 text-2xs font-semibold">
        {severity || "Unknown"}
      </span>
    );
  }
  const s = SEVERITY[sev];
  const mode = variant ?? (panel === "enterprise" ? "tint" : "solid");
  const style = mode === "solid" ? { background: s.solid, color: s.on } : { background: s.tint, color: s.text };
  const pad = size === "xs" ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-2xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide ${pad} ${panel === "analyst" ? "code uppercase" : ""}`}
      style={style}
    >
      {panel === "analyst" ? sev : s.label}
    </span>
  );
}

/** Small coloured dot used in legends and dense rows. */
export function SeverityDot({ severity, className = "" }: { severity: string; className?: string }) {
  const sev = toSeverity(severity);
  const bg = sev ? SEVERITY[sev].solid : "#A3A3A3";
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${className}`} style={{ background: bg }} />;
}

type Tone = "neutral" | "positive" | "caution" | "accent" | "info" | "violet" | "ink";

const TONE: Record<Tone, string> = {
  neutral: "bg-sunken text-text-2",
  positive: "bg-positive-tint text-positive",
  caution: "bg-caution-tint text-caution",
  accent: "bg-accent-100 text-accent-ink",
  info: "bg-info-tint text-info",
  violet: "bg-violet-tint text-violet",
  ink: "bg-ink-2 text-paper",
};

export function Badge({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold whitespace-nowrap ${TONE[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

/**
 * Direction-of-risk badge. For threat metrics "up" is bad, so it is tinted
 * with the accent; "down" is positive.
 */
export function TrendBadge({ trend, children }: { trend: string; children?: ReactNode }) {
  const t = trend?.toLowerCase();
  if (t === "up")
    return <Badge tone="accent" icon={<ArrowUpRight size={11} strokeWidth={2.5} />}>{children ?? "Rising"}</Badge>;
  if (t === "down")
    return <Badge tone="positive" icon={<ArrowDownRight size={11} strokeWidth={2.5} />}>{children ?? "Falling"}</Badge>;
  return <Badge tone="neutral" icon={<Minus size={11} strokeWidth={2.5} />}>{children ?? "Stable"}</Badge>;
}
