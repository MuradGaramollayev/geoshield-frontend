import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FlaskConical } from "lucide-react";
import { useMotion } from "../../design/panel";

/**
 * "How this is computed" disclosure. Every derived number in the product
 * should sit next to one of these, stating the real inputs and the formula.
 */
export function MethodologyNote({
  children,
  title = "How this is computed",
  defaultOpen = false,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const m = useMotion();
  return (
    <div className={`rounded-[14px] bg-sunken/70 ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-text-2 hover:text-ink interactive"
      >
        <FlaskConical size={15} className="text-accent-ink shrink-0" />
        <span className="flex-1">{title}</span>
        <ChevronDown size={15} className={`transition-transform duration-[var(--dur)] ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: m.duration, ease: m.ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-text-2 leading-relaxed space-y-2 max-w-[75ch]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
