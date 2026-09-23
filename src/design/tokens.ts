/**
 * JS mirror of the design tokens in index.css, for places CSS variables can't
 * reach (Recharts props, SVG paint, canvas). Both themes share one token set;
 * only the values differ. Components read the active palette from useTheme().
 */

export type Theme = "light" | "dark";

export interface Palette {
  canvas: string;
  surface: string;
  sunken: string;
  well: string;
  paper: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  text2: string;
  text3: string;
  text4: string;
  accent: string;
  accentStrong: string;
  accentInk: string;
  accent300: string;
  accent200: string;
  accent100: string;
  positive: string;
  info: string;
  violet: string;
  /** Countries with no data on the map. */
  noData: string;
  /** Chart gridlines and hover cursor fill. */
  grid: string;
  cursor: string;
}

export const LIGHT: Palette = {
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
  noData: "#E4E2E0",
  grid: "rgba(22,22,22,0.07)",
  cursor: "rgba(22,22,22,0.04)",
};

/** Dark theme: same roles, same accent family, tuned for a dark console. */
export const DARK: Palette = {
  canvas: "#080C0F",
  surface: "#121619",
  sunken: "#1B2024",
  well: "#252B30",
  paper: "#1E2428",
  line: "#2A3136",
  lineStrong: "#3A4248",
  ink: "#F4F5F5",
  ink2: "#FFFFFF",
  text2: "#B7BEC3",
  text3: "#8D969C",
  text4: "#666E74",
  accent: "#FF6A3D",
  accentStrong: "#FF854F",
  accentInk: "#FF9068",
  accent300: "#C2603F",
  accent200: "#6A3526",
  accent100: "#39211A",
  positive: "#47B98C",
  info: "#3FA9B8",
  violet: "#A177DB",
  noData: "#242A2E",
  grid: "rgba(255,255,255,0.07)",
  cursor: "rgba(255,255,255,0.05)",
};

export const PALETTES: Record<Theme, Palette> = { light: LIGHT, dark: DARK };

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface SeverityStyle {
  label: string;
  solid: string;
  on: string;
  tint: string;
  text: string;
  rank: number;
}

const SEVERITY_LIGHT: Record<Severity, SeverityStyle> = {
  CRITICAL: { label: "Critical", solid: "#B3122E", on: "#FFFFFF", tint: "#F7DCE0", text: "#9E0F28", rank: 3 },
  HIGH: { label: "High", solid: "#FC582A", on: "#1A0A04", tint: "#FFE3D8", text: "#B3380F", rank: 2 },
  MEDIUM: { label: "Medium", solid: "#EFA532", on: "#1F1405", tint: "#FBEBCF", text: "#875806", rank: 1 },
  LOW: { label: "Low", solid: "#23845F", on: "#FFFFFF", tint: "#D3EEE2", text: "#1B6B4D", rank: 0 },
};

/** Same hues, lifted so chips and text stay legible on a dark surface. */
const SEVERITY_DARK: Record<Severity, SeverityStyle> = {
  CRITICAL: { label: "Critical", solid: "#E03755", on: "#FFFFFF", tint: "#3A1420", text: "#FF8098", rank: 3 },
  HIGH: { label: "High", solid: "#FF6A3D", on: "#1A0A04", tint: "#3B1D12", text: "#FF9A72", rank: 2 },
  MEDIUM: { label: "Medium", solid: "#F0AE43", on: "#1F1405", tint: "#35280F", text: "#F3C173", rank: 1 },
  LOW: { label: "Low", solid: "#35A97C", on: "#04120C", tint: "#123024", text: "#5FC79B", rank: 0 },
};

export const SEVERITY_BY_THEME: Record<Theme, Record<Severity, SeverityStyle>> = {
  light: SEVERITY_LIGHT,
  dark: SEVERITY_DARK,
};

export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

/** Theme-independent ordering, for sorting and comparisons. */
export const SEVERITY_RANK: Record<Severity, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

export const SEVERITY_LABEL: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function toSeverity(value: string | null | undefined): Severity | null {
  const v = (value ?? "").toUpperCase();
  return v === "CRITICAL" || v === "HIGH" || v === "MEDIUM" || v === "LOW" ? v : null;
}

/**
 * Risk-score bands, matching the backend's scoring bands:
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
 */
const RAMP_LIGHT: [number, string][] = [
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

const RAMP_DARK: [number, string][] = [
  [0, "#1C3A2E"],
  [18, "#2F7A5B"],
  [30, "#B3862E"],
  [37, "#F0AE43"],
  [45, "#F58B4B"],
  [55, "#FF6A3D"],
  [65, "#E8453F"],
  [80, "#E03755"],
  [100, "#B01235"],
];

export const RAMP_BY_THEME: Record<Theme, [number, string][]> = { light: RAMP_LIGHT, dark: RAMP_DARK };

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function riskColorOn(ramp: [number, string][], score: number): string {
  const s = Math.max(0, Math.min(100, score));
  for (let i = 1; i < ramp.length; i++) {
    const [s1, c1] = ramp[i];
    if (s <= s1) {
      const [s0, c0] = ramp[i - 1];
      const t = (s - s0) / (s1 - s0 || 1);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      const mix = a.map((x, k) => Math.round(x + (b[k] - x) * t));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return ramp[ramp.length - 1][1];
}

export function rampCssOn(ramp: [number, string][], direction = "to right"): string {
  return `linear-gradient(${direction}, ${ramp.map(([s, c]) => `${c} ${s}%`).join(", ")})`;
}

/** Categorical series colours (warm family from the reference donut, plus ink). */
export const SERIES_BY_THEME: Record<Theme, string[]> = {
  light: ["#FC582A", "#1C1C1C", "#F6A48E", "#8C8C8C", "#F3D2C9", "#1D7F8C"],
  dark: ["#FF6A3D", "#F4F5F5", "#C2603F", "#8D969C", "#6A3526", "#3FA9B8"],
};
