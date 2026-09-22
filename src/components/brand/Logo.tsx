/**
 * Placeholder wordmark used during Section 1 (design system).
 * Replaced by the full logo system in Section 2.
 */
export function LogoLockup({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  if (compact) return <LogoTile size={32} />;
  return (
    <span className={`inline-flex items-center gap-2.5 font-bold tracking-[-0.03em] text-ink text-md ${className}`}>
      <LogoTile size={36} />
      GeoShield
    </span>
  );
}

export function LogoTile({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center bg-ink-2 text-paper font-bold rounded-[10px] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label="GeoShield"
    >
      G
    </span>
  );
}
