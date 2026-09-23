import { createContext, useContext } from "react";

export type Panel = "analyst" | "enterprise" | "public";

/** Theme defaults: the Analyst console is dark, Enterprise and public pages light. */
export const DEFAULT_THEME: Record<Panel, "light" | "dark"> = {
  analyst: "dark",
  enterprise: "light",
  public: "light",
};

export const PanelContext = createContext<Panel>("public");

export function usePanel(): Panel {
  return useContext(PanelContext);
}

/** Motion timings per panel: Analyst is snappy, Enterprise is deliberate. */
export function useMotion() {
  const panel = usePanel();
  const enterprise = panel === "enterprise";
  return {
    panel,
    duration: enterprise ? 0.28 : panel === "analyst" ? 0.15 : 0.2,
    enter: enterprise ? 0.45 : panel === "analyst" ? 0.2 : 0.35,
    stagger: enterprise ? 0.07 : 0.03,
    ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number],
  };
}
