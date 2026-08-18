import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";

const TYPING_WORDS: string[] = [
  "cyberattacks.",
  "data breaches.",
  "ransomware.",
  "nation-state threats.",
];

const RADAR_POINTS: { angle: number; dist: number; label: string }[] = [
  { angle: 15, dist: 0.7, label: "CN" },
  { angle: 60, dist: 0.5, label: "US" },
  { angle: 110, dist: 0.85, label: "RU" },
  { angle: 160, dist: 0.4, label: "SG" },
  { angle: 210, dist: 0.65, label: "GB" },
  { angle: 260, dist: 0.55, label: "VN" },
  { angle: 305, dist: 0.75, label: "IN" },
  { angle: 340, dist: 0.35, label: "NL" },
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const [flashPoint, setFlashPoint] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);

  useEffect(() => {
    const current = TYPING_WORDS[wordIndex];
    const speed = deleting ? 40 : 80;
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayedText.length < current.length) {
          setDisplayedText(current.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1500);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(current.slice(0, displayedText.length - 1));
        } else {
          setDeleting(false);
          setWordIndex((wordIndex + 1) % TYPING_WORDS.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayedText, deleting, wordIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prevAngle) => {
        const next = (prevAngle + 2) % 360;
        for (let i = 0; i < RADAR_POINTS.length; i++) {
          if (Math.abs(next - RADAR_POINTS[i].angle) < 2) {
            setFlashPoint(i);
            setTimeout(() => setFlashPoint(-1), 600);
          }
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
      setMouseY(e.clientY - rect.top);
    };

    node.addEventListener("mousemove", handleMove);
    return () => node.removeEventListener("mousemove", handleMove);
  }, []);

  const sweepX = 210 + 180 * Math.cos(((sweepAngle - 90) * Math.PI) / 180);
  const sweepY = 210 + 180 * Math.sin(((sweepAngle - 90) * Math.PI) / 180);
  const trailX = 210 + 180 * Math.cos(((sweepAngle - 120) * Math.PI) / 180);
  const trailY = 210 + 180 * Math.sin(((sweepAngle - 120) * Math.PI) / 180);
  const pathD =
    "M 210 210 L " + trailX + " " + trailY + " A 180 180 0 0 1 " + sweepX + " " + sweepY + " Z";

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)",
          left: mouseX - 192,
          top: mouseY - 192,
        }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald/10 border border-emerald/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">LIVE - 9 threat intel sources</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight mb-6">
            A weather forecast for{" "}
            <span className="text-emerald-400 inline-block min-w-[280px]">
              {displayedText}
              <span className="animate-pulse">_</span>
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-xl">
            GeoShield aggregates real-time threat intelligence from 9 live sources across
            124 countries, predicting where the next attack originates before it lands.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 bg-emerald text-navy font-semibold px-6 py-3.5 rounded-lg hover:opacity-90 transition-all hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
<a
              href="#try-it"
              className="flex items-center gap-2 text-slate-300 hover:text-white px-6 py-3.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
            >
              <PlayCircle size={18} />
              <span>Try Live Demo</span>
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <svg width="420" height="420" viewBox="0 0 420 420" className="max-w-full">
            <circle cx="210" cy="210" r="45" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
            <circle cx="210" cy="210" r="90" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
            <circle cx="210" cy="210" r="135" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
            <circle cx="210" cy="210" r="180" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />

            <line x1="210" y1="30" x2="210" y2="390" stroke="rgba(16,185,129,0.1)" strokeWidth="1" />
            <line x1="30" y1="210" x2="390" y2="210" stroke="rgba(16,185,129,0.1)" strokeWidth="1" />

            <line
              x1="210"
              y1="210"
              x2={sweepX}
              y2={sweepY}
              stroke="#34d399"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.8))" }}
            />

            <path d={pathD} fill="rgba(52,211,153,0.08)" />

            {RADAR_POINTS.map((p, i) => {
              const r = p.dist * 180;
              const x = 210 + r * Math.cos(((p.angle - 90) * Math.PI) / 180);
              const y = 210 + r * Math.sin(((p.angle - 90) * Math.PI) / 180);
              const isFlashing = flashPoint === i;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isFlashing ? 6 : 3}
                    fill={isFlashing ? "#f43f5e" : "#38bdf8"}
                    style={{
                      transition: "r 0.2s, fill 0.2s",
                      filter: isFlashing ? "drop-shadow(0 0 8px rgba(244,63,94,0.9))" : "none",
                    }}
                  />
                  {isFlashing ? (
                    <text x={x + 10} y={y + 4} fill="#e2e8f0" fontSize="11" fontFamily="monospace">
                      {p.label}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <circle cx="210" cy="210" r="4" fill="#34d399" />
          </svg>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-slate-500 font-mono">SCANNING GLOBAL THREAT SURFACE</p>
          </div>
        </div>
      </div>
    </div>
  );
}