/**
 * The hero's hexagon motif, carried into later sections as a still texture.
 *
 * The whole lattice is one <path>, generated once at module load, and the fade
 * is a CSS mask — so this costs a single composited element per use, with no
 * script running after mount.
 */

const R = 16;                       // circumradius
const VIEW_W = 520;
const VIEW_H = 320;

function hexPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    points.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

const LATTICE = (() => {
  const stepX = R * Math.sqrt(3);
  const stepY = R * 1.5;
  const parts: string[] = [];
  for (let row = -1; row * stepY < VIEW_H + stepY; row++) {
    for (let col = -1; col * stepX < VIEW_W + stepX; col++) {
      parts.push(hexPath(col * stepX + (row % 2 ? stepX / 2 : 0), row * stepY, R - 2.5));
    }
  }
  return parts.join("");
})();

type Corner = "top-right" | "bottom-left";

const PLACEMENT: Record<Corner, { box: string; mask: string }> = {
  "top-right": {
    box: "top-0 right-0 w-[min(560px,60%)] h-[min(340px,55%)]",
    mask: "radial-gradient(120% 120% at 100% 0%, #000 8%, transparent 68%)",
  },
  "bottom-left": {
    box: "bottom-0 left-0 w-[min(520px,55%)] h-[min(320px,50%)]",
    mask: "radial-gradient(120% 120% at 0% 100%, #000 8%, transparent 68%)",
  },
};

export default function HexVeil({ corner = "top-right" }: { corner?: Corner }) {
  const { box, mask } = PLACEMENT[corner];
  return (
    <svg
      aria-hidden
      className={`hex-veil ${box}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      <path d={LATTICE} fill="none" stroke="currentColor" strokeWidth={1} />
    </svg>
  );
}
