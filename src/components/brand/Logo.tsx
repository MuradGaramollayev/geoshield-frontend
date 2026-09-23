import { useId } from "react";
import { useTheme } from "../../design/themeContext";

/**
 * GeoShield mark.
 *
 * A faceted, gem-cut shield: two flat top facets meeting at a shallow peak,
 * straight sides tapering to a sharp point. Inside it a minimal geo-grid —
 * a wide flat ellipse (equator), a narrow tall one (meridian) and a faint
 * full circle — with one precision detection node: a short vector from the
 * centre out to a ringed dot, marking a located threat. The node is the
 * signature detail; it is never dropped except in the smallest icon, where
 * it is what everything else makes room for.
 */

// 48×48 grid. Shield: peak, two top facets, straight tapering sides, sharp point.
const SHIELD = "M24 3.2 L43 10.6 L40.8 27.4 L24 44.8 L7.2 27.4 L5 10.6 Z";
const GLOBE = { cx: 24, cy: 21.5, r: 10.2 };
const NODE = { x: 31.4, y: 15.2 };

export type MarkVariant = "color" | "white" | "black" | "bold";

interface MarkProps {
  size?: number;
  variant?: MarkVariant;
  className?: string;
  title?: string;
}

/** The icon on its own. */
export function LogoMark({ size = 32, variant = "color", className = "", title }: MarkProps) {
  const id = useId();
  const th = useTheme();
  const accent = variant === "color" ? th.c.accent : variant === "white" ? "#FFFFFF" : variant === "black" ? "#000000" : th.c.accent;
  const bold = variant === "bold";
  const stroke = bold ? 3.4 : 2.2;
  const grid = bold ? 2.2 : 1.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      {/* miter joins keep the facets crisp and the bottom point sharp */}
      <path d={SHIELD} stroke={accent} strokeWidth={stroke} strokeLinejoin="miter" strokeMiterlimit={8} />
      {/* faint sphere outline — dropped at icon sizes so the node stays readable */}
      {!bold && (
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} stroke={accent} strokeWidth={grid} opacity={0.3} />
      )}
      {/* equator + meridian; the icon variant drops them so the node stays readable at 16px */}
      {!bold && (
        <>
          <ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx={GLOBE.r} ry={3.5} stroke={accent} strokeWidth={grid} opacity={0.62} />
          <ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx={4.1} ry={GLOBE.r} stroke={accent} strokeWidth={grid} opacity={0.62} />
        </>
      )}
      {/* precision detection node: the signature detail */}
      <g key={id}>
        {bold ? (
          <>
            <ellipse cx={GLOBE.cx} cy={GLOBE.cy + 1} rx={9.4} ry={3.4} stroke={accent} strokeWidth={grid} opacity={0.8} />
            <circle cx={GLOBE.cx + 4.6} cy={GLOBE.cy - 4.6} r={5.4} stroke={accent} strokeWidth={3.2} />
            <circle cx={GLOBE.cx + 4.6} cy={GLOBE.cy - 4.6} r={2} fill={accent} />
          </>
        ) : (
          <>
            {/* the leader stops short of the ring so the pair reads as a plotted point */}
            <path d={`M${GLOBE.cx} ${GLOBE.cy} L28.3 17.9`} stroke={accent} strokeWidth={1.9} strokeLinecap="round" />
            <circle cx={NODE.x} cy={NODE.y} r={3.3} stroke={accent} strokeWidth={1.9} />
            <circle cx={NODE.x} cy={NODE.y} r={1.25} fill={accent} />
          </>
        )}
      </g>
    </svg>
  );
}

/** Icon + wordmark. The icon carries the accent; the wordmark stays monochrome. */
export function LogoLockup({
  size = 30,
  variant = "color",
  compact = false,
  className = "",
}: {
  size?: number;
  variant?: MarkVariant;
  compact?: boolean;
  className?: string;
}) {
  if (compact) return <LogoTile size={34} />;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="GeoShield">
      <LogoMark size={size} variant={variant} />
      <span
        className={`font-bold tracking-[-0.035em] leading-none ${
          variant === "white" ? "text-white" : variant === "black" ? "text-black" : "text-ink"
        }`}
        style={{ fontSize: size * 0.62 }}
      >
        GeoShield
      </span>
    </span>
  );
}

/** Dark rounded tile holding the mark, for compact rails and app icons. */
export function LogoTile({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center bg-ink-2 rounded-[10px] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.7)]"
      style={{ width: size, height: size }}
      aria-label="GeoShield"
    >
      <LogoMark size={size * 0.68} variant="color" />
    </span>
  );
}
