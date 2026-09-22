import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMotion } from "../../design/panel";
import { IconButton } from "./Button";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

/** Centred glass modal. Glass is reserved for overlays like this one. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 560,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) {
  const m = useMotion();
  useEscape(open, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: m.duration }}
        >
          <div className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="e4 relative w-full max-h-[88vh] flex flex-col overflow-hidden"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: m.duration + 0.05, ease: m.ease }}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-semibold text-ink tracking-[-0.01em]">{title}</h2>}
                  {description && <p className="text-sm text-text-3 mt-0.5">{description}</p>}
                </div>
                <IconButton label="Close" size="sm" onClick={onClose}>
                  <X size={16} />
                </IconButton>
              </div>
            )}
            <div className="overflow-y-auto flex-1">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-line flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Right-hand slide-over for detail views. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 480,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) {
  const m = useMotion();
  useEscape(open, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: m.duration }}
        >
          <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="absolute top-2 right-2 bottom-2 e4 flex flex-col overflow-hidden"
            style={{ width: `min(${width}px, calc(100vw - 16px))` }}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: m.duration + 0.08, ease: m.ease }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
              <div className="min-w-0">
                {subtitle && <div className="text-xs text-text-3 mb-1">{subtitle}</div>}
                {title && <h2 className="text-lg font-semibold text-ink tracking-[-0.01em]">{title}</h2>}
              </div>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <X size={16} />
              </IconButton>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-line flex flex-col gap-2">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
