import type { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Card-shaped placeholder that matches the real card's footprint. */
export function SkeletonCard({ lines = 3, className = "", tall = false }: { lines?: number; className?: string; tall?: boolean }) {
  return (
    <div className={`e2 p-[var(--pad-card)] ${className}`} aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-10 h-10 rounded-[12px]" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
      {tall && <Skeleton className="h-40 w-full mb-4 rounded-[14px]" />}
      <Skeleton className="h-8 w-1/2 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 mb-2 ${i % 2 ? "w-2/3" : "w-5/6"}`} />
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 px-4 py-3.5">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={`h-3 ${c === 1 ? "flex-1" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      {icon && (
        <span className="w-12 h-12 rounded-[14px] bg-paper shadow-[var(--shadow-e3)] text-text-2 inline-flex items-center justify-center mb-4">
          {icon}
        </span>
      )}
      <p className="text-md font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-text-3 mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Error block: says what failed and how to recover. Never apologises. */
export function ErrorState({
  title = "Couldn't reach the GeoShield API",
  message,
  onRetry,
  className = "",
}: {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`e2 p-6 flex items-start gap-4 ${className}`} role="alert">
      <span className="w-10 h-10 rounded-[12px] bg-sev-critical-tint text-sev-critical-text inline-flex items-center justify-center shrink-0">
        <AlertTriangle size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-text-2 mt-1">
          {message ? <span className="code text-xs">{message}</span> : null}
          {message ? " · " : ""}Check that the backend is running, then retry.
        </p>
      </div>
      {onRetry && (
        <Button size="sm" onClick={onRetry} icon={<RotateCcw size={14} />}>
          Retry
        </Button>
      )}
    </div>
  );
}
