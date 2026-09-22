import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates a number from its previous value to `target`.
 * With prefers-reduced-motion it returns the target immediately.
 */
export function useCountUp(target: number, durationMs = 900, decimals = 0): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const reduce = prefersReducedMotion();

  useEffect(() => {
    if (reduce || !Number.isFinite(target)) {
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const f = Math.pow(10, decimals);
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round((from + (target - from) * eased) * f) / f);
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, decimals, reduce]);

  return reduce || !Number.isFinite(target) ? target : value;
}
