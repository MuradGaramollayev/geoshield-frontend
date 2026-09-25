import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMotion } from "../../design/panel";

/**
 * Page title block. Enterprise pages get a larger, calmer title; Analyst pages a
 * compact one so the working area starts higher on screen.
 */
export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  const m = useMotion();
  const enterprise = m.panel === "enterprise";
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: m.enter, ease: m.ease }}
      className={`flex flex-wrap items-end justify-between gap-4 ${enterprise ? "mb-8" : "mb-5"}`}
    >
      <div className="min-w-0 max-w-3xl">
        <h1
          className={`font-semibold text-ink tracking-[-0.02em] ${
            enterprise ? "text-2xl" : "text-xl"
          }`}
        >
          {title}
        </h1>
        {description && (
          <p className={`text-text-2 mt-1 ${enterprise ? "text-md" : "text-sm"}`}>{description}</p>
        )}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
