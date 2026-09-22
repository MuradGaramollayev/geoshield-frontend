import type { ElementType, HTMLAttributes, ReactNode } from "react";

type Level = 1 | 2 | 3;

interface CardProps extends HTMLAttributes<HTMLElement> {
  level?: Level;
  /** "panel" follows the panel density token; "none" leaves padding to children. */
  pad?: "panel" | "sm" | "md" | "lg" | "none";
  interactive?: boolean;
  as?: ElementType;
}

const PAD: Record<NonNullable<CardProps["pad"]>, string> = {
  panel: "p-[var(--pad-card)]",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
  none: "",
};

/** Elevation-aware surface. Level 1 = grouping well, 2 = card, 3 = white paper. */
export function Card({
  level = 2,
  pad = "panel",
  interactive = false,
  as: Tag = "section",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`e${level} ${PAD[pad]} ${interactive ? "interactive cursor-pointer" : "interactive"} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, icon, actions, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && <IconTile>{icon}</IconTile>}
        <div className="min-w-0">
          <h3 className="text-md font-semibold text-ink leading-tight">{title}</h3>
          {description && <p className="text-sm text-text-3 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** White rounded tile that holds an icon (from the reference KPI cards). */
export function IconTile({
  children,
  size = "md",
  tone = "paper",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "paper" | "ink" | "accent";
}) {
  const dims = size === "sm" ? "w-8 h-8 rounded-[9px]" : size === "lg" ? "w-12 h-12 rounded-[14px]" : "w-10 h-10 rounded-[12px]";
  const toneCls =
    tone === "ink"
      ? "bg-ink-2 text-paper"
      : tone === "accent"
        ? "bg-accent text-sev-high-on"
        : "bg-paper text-ink shadow-[var(--shadow-e3)]";
  return <span className={`${dims} ${toneCls} inline-flex items-center justify-center shrink-0`}>{children}</span>;
}
