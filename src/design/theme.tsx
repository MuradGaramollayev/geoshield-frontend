import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PALETTES, RAMP_BY_THEME, SERIES_BY_THEME, SEVERITY_BY_THEME, rampCssOn, riskColorOn } from "./tokens";
import type { Theme } from "./tokens";
import { ThemeContext, chartStyles } from "./themeContext";
import type { ThemeValue } from "./themeContext";
import { getPrefs, savePrefs } from "../utils/prefs";
import { DEFAULT_THEME } from "./panel";
import type { Panel } from "./panel";

/**
 * Applies the theme to <html> (so portalled overlays inherit it too) and
 * remembers the choice per panel, since Analyst and Enterprise default
 * differently.
 */
export function ThemeProvider({ panel, children }: { panel: Panel; children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getPrefs().theme?.[panel] ?? DEFAULT_THEME[panel]);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
      else root.removeAttribute("data-theme");
    };
  }, [theme]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      savePrefs({ theme: { ...getPrefs().theme, [panel]: t } });
    },
    [panel],
  );

  const value = useMemo<ThemeValue>(() => {
    const ramp = RAMP_BY_THEME[theme];
    return {
      theme,
      setTheme,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
      c: PALETTES[theme],
      sev: SEVERITY_BY_THEME[theme],
      series: SERIES_BY_THEME[theme],
      riskColor: (score: number) => riskColorOn(ramp, score),
      rampCss: (direction?: string) => rampCssOn(ramp, direction),
      chart: chartStyles(PALETTES[theme]),
    };
  }, [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
