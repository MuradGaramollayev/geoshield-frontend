import { createContext, useContext } from "react";
import { PALETTES, RAMP_BY_THEME, SERIES_BY_THEME, SEVERITY_BY_THEME, rampCssOn, riskColorOn } from "./tokens";
import type { Palette, Severity, SeverityStyle, Theme } from "./tokens";

export interface ThemeValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** Active palette (same keys in both themes). */
  c: Palette;
  /** Active severity styles. */
  sev: Record<Severity, SeverityStyle>;
  series: string[];
  riskColor: (score: number) => string;
  rampCss: (direction?: string) => string;
  /** Shared Recharts styling so every chart reads as one system. */
  chart: {
    axisTick: { fill: string; fontSize: number; fontFamily: string };
    axisTickMono: { fill: string; fontSize: number; fontFamily: string };
    gridStroke: string;
    cursor: string;
  };
}

export function chartStyles(c: Palette) {
  return {
    axisTick: { fill: c.text3, fontSize: 11, fontFamily: "Manrope Variable, Manrope, sans-serif" },
    axisTickMono: { fill: c.text2, fontSize: 11, fontFamily: "JetBrains Mono Variable, monospace" },
    gridStroke: c.grid,
    cursor: c.cursor,
  };
}


export const ThemeContext = createContext<ThemeValue | null>(null);

const FALLBACK: ThemeValue = {
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
  c: PALETTES.light,
  sev: SEVERITY_BY_THEME.light,
  series: SERIES_BY_THEME.light,
  riskColor: (score: number) => riskColorOn(RAMP_BY_THEME.light, score),
  rampCss: (direction?: string) => rampCssOn(RAMP_BY_THEME.light, direction),
  chart: chartStyles(PALETTES.light),
};

/** Active theme. Outside a ThemeProvider this falls back to the light palette. */
export function useTheme(): ThemeValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
