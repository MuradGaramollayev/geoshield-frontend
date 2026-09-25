import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink-2 text-paper hover:bg-black hover:-translate-y-px shadow-[0_1px_2px_rgba(0,0,0,0.2),0_6px_16px_-8px_rgba(0,0,0,0.5)]",
  accent:
    "bg-accent text-sev-high-on hover:bg-accent-strong hover:-translate-y-px shadow-[0_6px_16px_-8px_rgba(252,88,42,0.8)]",
  secondary:
    "bg-paper text-ink shadow-[var(--shadow-e3)] hover:shadow-[var(--shadow-e2-hover)] hover:-translate-y-px",
  ghost: "bg-transparent text-text-2 hover:bg-sunken hover:text-ink",
  danger:
    "bg-sev-critical-tint text-sev-critical-text hover:bg-sev-critical hover:text-sev-critical-on",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-[10px]",
  md: "h-10 px-4 text-base gap-2 rounded-[12px]",
  lg: "h-12 px-5 text-md gap-2 rounded-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading = false, icon, iconRight, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap select-none interactive
        disabled:opacity-45 disabled:pointer-events-none active:translate-y-0
        ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "ghost" | "secondary" | "primary";
  size?: "sm" | "md";
}

export function IconButton({ label, variant = "ghost", size = "md", className = "", children, ...rest }: IconButtonProps) {
  const dims = size === "sm" ? "w-8 h-8 rounded-[10px]" : "w-10 h-10 rounded-[12px]";
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center interactive ${dims} ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
