import { useEffect, useRef, useState } from "react";

/**
 * Reveals a section the first time it scrolls into view. Elements start hidden
 * only when the observer is available and motion is allowed, so the page is
 * fully readable without JavaScript animation and for reduced-motion users.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(() =>
    typeof window === "undefined" ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    let answered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        answered = true;
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    // Fail open: if the observer never reports at all — a hidden or throttled
    // window, a blocked API — the content is shown rather than left invisible.
    const failsafe = window.setTimeout(() => {
      if (!answered) setShown(true);
    }, 1500);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [shown, threshold]);

  return { ref, shown };
}

/** Inline style for a revealed block, with an optional stagger index. */
export function revealStyle(shown: boolean, index = 0): React.CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(18px)",
    transition: `opacity 620ms cubic-bezier(.2,.7,.2,1) ${index * 70}ms, transform 620ms cubic-bezier(.2,.7,.2,1) ${index * 70}ms`,
  };
}
