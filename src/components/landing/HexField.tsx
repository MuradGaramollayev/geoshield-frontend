import { useEffect, useRef } from "react";
import { useTheme } from "../../design/themeContext";

const R = 17;          // hex circumradius in CSS pixels
const LIGHT = 190;     // cursor influence radius

/**
 * The hero's backdrop: a hexagon lattice, the same geometry the risk map uses,
 * that lights up around the cursor and drifts as the page scrolls. Decoration
 * only — it carries no data, so it can never be mistaken for a reading.
 *
 * Frames are driven by input rather than a standing animation loop: once the
 * cursor settles, or the hero leaves the viewport, the page goes idle.
 */
export default function HexField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const th = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const OFF = -1e4;
    const pointer = { x: OFF, y: OFF };
    const eased = { x: OFF, y: OFF };
    let size = { w: 0, h: 0 };
    let drift = 0;
    let onScreen = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: parent.clientWidth, h: parent.clientHeight };
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
      canvas.style.width = `${size.w}px`;
      canvas.style.height = `${size.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const hex = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 30);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // Hairlines on the light surface need more weight than on the dark one.
    const ambient = th.theme === "light" ? 2.6 : 1;

    const draw = () => {
      ctx.clearRect(0, 0, size.w, size.h);
      const stepX = R * Math.sqrt(3);
      const stepY = R * 1.5;
      const rows = Math.ceil(size.h / stepY) + 2;
      const cols = Math.ceil(size.w / stepX) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * stepX + (row % 2 ? stepX / 2 : 0);
          const cy = row * stepY + drift;
          const near = Math.max(0, 1 - Math.hypot(cx - eased.x, cy - eased.y) / LIGHT);
          // Denser towards the top right, where the headline is lightest.
          const bias = (0.035 + 0.05 * (cx / Math.max(size.w, 1)) * (1 - cy / Math.max(size.h, 1))) * ambient;
          ctx.globalAlpha = bias + near * 0.5;
          ctx.strokeStyle = near > 0.15 ? th.c.accent : th.c.lineStrong;
          ctx.lineWidth = 1;
          hex(cx, cy, R - 2.5);
          ctx.stroke();
          if (near > 0.55) {
            ctx.globalAlpha = (near - 0.55) * 0.35;
            ctx.fillStyle = th.c.accent;
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const settled = () =>
      Math.abs(pointer.x - eased.x) < 0.6 && Math.abs(pointer.y - eased.y) < 0.6;

    const schedule = () => {
      if (raf || still || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        eased.x += (pointer.x - eased.x) * 0.14;
        eased.y += (pointer.y - eased.y) * 0.14;
        drift = -((window.scrollY * 0.08) % (R * 3));
        draw();
        if (!settled()) schedule();
      });
    };

    const onPointer = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      schedule();
    };
    const onLeave = () => {
      pointer.x = OFF;
      pointer.y = OFF;
      schedule();
    };
    const onScroll = () => schedule();

    resize();
    draw();

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(parent);

    const visibility = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        if (onScreen) schedule();
      },
      { threshold: 0 },
    );
    visibility.observe(parent);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    parent.addEventListener("pointerleave", onLeave);

    return () => {
      onScreen = false;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [th]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
