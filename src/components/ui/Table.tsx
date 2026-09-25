import type { ReactNode, ThHTMLAttributes } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

/** Table shell with consistent header styling. Rows supply their own cells. */
export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function Th({
  children,
  sort,
  onSort,
  align = "left",
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & {
  sort?: "asc" | "desc" | null;
  onSort?: () => void;
  align?: "left" | "right";
}) {
  const content = onSort ? (
    <button
      onClick={onSort}
      className={`inline-flex items-center gap-1 hover:text-ink interactive ${sort ? "text-ink" : ""}`}
    >
      {children}
      {sort === "asc" ? <ArrowUp size={12} /> : sort === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-50" />}
    </button>
  ) : (
    children
  );
  return (
    <th
      scope="col"
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
      className={`px-4 py-2.5 text-xs font-semibold text-text-3 border-b border-line whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
      {...rest}
    >
      {content}
    </th>
  );
}

export const rowClass =
  "border-b border-line/70 last:border-0 hover:bg-paper/70 interactive";
