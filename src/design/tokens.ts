/**
 * JS mirror of the design tokens in index.css, for places CSS variables can't
 * reach (Recharts props, MapLibre paint expressions, canvas). Keep in sync.
 */

export const color = {
  canvas: "#DDDBDC",
  surface: "#F1F1F1",
  sunken: "#E7E7E7",
  well: "#DDDDDD",
  paper: "#FFFFFF",
  line: "#E3E3E3",
  lineStrong: "#D2D2D2",
  ink: "#161616",
  ink2: "#1C1C1C",
  text2: "#5E5E5E",
  text3: "#767676",
  text4: "#A3A3A3",
  accent: "#FC582A",
  accentStrong: "#E4461A",
  accentInk: "#B93A12",
  accent300: "#F6A48E",
  accent200: "#F3D2C9",
  accent100: "#F6E7DF",
  positive: "#2E8B6A",
  info: "#1D7F8C",
  violet: "#7A4BB2",
} as const;

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface SeverityStyle {
  label: string;
  solid: string;
  on: string;
  tint: string;
  text: string;
  rank: number;
}

/** The single severity mapping for the whole product. */
export const SEVERITY: Record<Severity, SeverityStyle> = {
  CRITICAL: { label: "Critical", solid: "#B3122E", on: "#FFFFFF", tint: "#F7DCE0", text: "#9E0F28", rank: 3 },
  HIGH:     { label: "High",     solid: "#FC582A", on: "#1A0A04", tint: "#FFE3D8", text: "#B3380F", rank: 2 },
  MEDIUM:   { label: "Medium",   solid: "#EFA532", on: "#1F1405", tint: "#FBEBCF", text: "#875806", rank: 1 },
  LOW:      { label: "Low",      solid: "#23845F", on: "#FFFFFF", tint: "#D3EEE2", text: "#1B6B4D", rank: 0 },
};

export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export function toSeverity(value: string | null | undefined): Severity | null {
  const v = (value ?? "").toUpperCase();
  return v === "CRITICAL" || v === "HIGH" || v === "MEDIUM" || v === "LOW" ? v : null;
}

/**
 * Risk-score bands, matching the backend's scoring bands documented in Docs:
 * LOW 0–29, MEDIUM 30–44, HIGH 45–64, CRITICAL 65+.
 */
export function severityForScore(score: number): Severity {
  if (score >= 65) return "CRITICAL";
  if (score >= 45) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

/**
 * Continuous risk ramp. Stops pass through each severity colour at the middle
 * of its band, so a country's map colour always agrees with its severity badge.
 * Low-risk countries sit on pale tints so high-risk ones carry the attention.
 */
export const RISK_RAMP: [number, string][] = [
  [0, "#DCEBE3"],
  [18, "#8CC4AA"],
  [30, "#EFD08A"],
  [37, "#EFA532"],
  [45, "#F98A45"],
  [55, "#FC582A"],
  [65, "#D5301F"],
  [80, "#B3122E"],
  [100, "#7E0A1F"],
];

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function riskColor(score: number): string {
  const s = Math.max(0, Math.min(100, score));
  for (let i = 1; i < RISK_RAMP.length; i++) {
    const [s1, c1] = RISK_RAMP[i];
    if (s <= s1) {
      const [s0, c0] = RISK_RAMP[i - 1];
      const t = (s - s0) / (s1 - s0 || 1);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      const mix = a.map((x, k) => Math.round(x + (b[k] - x) * t));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return RISK_RAMP[RISK_RAMP.length - 1][1];
}

export function riskRampCss(direction = "to right"): string {
  return `linear-gradient(${direction}, ${RISK_RAMP.map(([s, c]) => `${c} ${s}%`).join(", ")})`;
}

/** Categorical series colours for charts (warm family from the reference donut, plus ink). */
export const SERIES = ["#FC582A", "#1C1C1C", "#F6A48E", "#8C8C8C", "#F3D2C9", "#1D7F8C"] as const;
