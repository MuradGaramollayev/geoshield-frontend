import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3, Bell, BookOpen, ClipboardList, Clock, FileText, Grid3x3, Home, Plug, ScanSearch, Settings, ShieldAlert, Network,
} from "lucide-react";
import { PanelContext } from "../../design/panel";
import { ThemeProvider } from "../../design/theme";
import { LogoLockup } from "../brand/Logo";
import CopilotPanel from "../common/CopilotPanel";
import { CommandPalette } from "./CommandPalette";
import { usePaletteHotkey } from "../../hooks/usePaletteHotkey";
import type { PaletteNavItem } from "./CommandPalette";
import { AlertsBell, SearchTrigger, StatusPill, UserChip } from "./TopbarStatus";
import { ThemeToggle } from "./ThemeToggle";
import { ShellDataProvider } from "./ShellDataProvider";

const ANALYST_NAV: PaletteNavItem[] = [
  { icon: Home, label: "Dashboard", path: "/analyst", group: "Monitor" },
  { icon: ShieldAlert, label: "Threat Explorer", path: "/analyst/threats", group: "Monitor" },
  { icon: Clock, label: "Threat Timeline", path: "/analyst/timeline", group: "Monitor" },
  { icon: BarChart3, label: "Analytics", path: "/analyst/analytics", group: "Monitor" },
  { icon: ScanSearch, label: "IOC Explorer", path: "/analyst/ioc-explorer", group: "Investigate" },
  { icon: Grid3x3, label: "MITRE ATT&CK", path: "/analyst/mitre", group: "Investigate" },
  { icon: Network, label: "Correlation", path: "/analyst/correlation", group: "Investigate" },
  { icon: ClipboardList, label: "Incident Queue", path: "/analyst/incidents", group: "Respond" },
  { icon: Bell, label: "Alert Center", path: "/analyst/alerts", group: "Respond" },
  { icon: FileText, label: "Reports", path: "/analyst/reports", group: "Respond" },
  { icon: Plug, label: "Integrations", path: "/analyst/integrations", group: "Workspace" },
  { icon: Settings, label: "Settings", path: "/analyst/settings", group: "Workspace" },
  { icon: BookOpen, label: "Docs", path: "/analyst/docs", group: "Workspace" },
];

function Rail() {
  const groups = Array.from(new Set(ANALYST_NAV.map((n) => n.group)));
  return (
    <nav aria-label="Analyst navigation" className="w-[68px] shrink-0 flex flex-col items-center py-3 gap-1 overflow-y-auto overflow-x-visible">
      {groups.map((g, gi) => (
        <div key={g} className="flex flex-col items-center gap-1 w-full">
          {gi > 0 && <span className="w-6 h-px bg-line-strong my-2" aria-hidden="true" />}
          {ANALYST_NAV.filter((n) => n.group === g).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/analyst"}
                aria-label={item.label}
                className={({ isActive }) =>
                  `group relative w-11 h-11 rounded-[12px] inline-flex items-center justify-center interactive ${
                    isActive ? "bg-paper text-ink shadow-[var(--shadow-e3)]" : "text-text-3 hover:text-ink hover:bg-sunken"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute -left-[12px] w-[3px] h-5 rounded-r bg-accent" aria-hidden="true" />}
                    <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-[8px] bg-ink-2 text-paper text-xs font-semibold px-2.5 py-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition-all duration-[120ms]"
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function AnalystShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  usePaletteHotkey(setPaletteOpen);

  return (
    <PanelContext.Provider value="analyst">
      <ThemeProvider panel="analyst">
      <ShellDataProvider>
        <div data-panel="analyst" className="h-screen bg-canvas p-1.5 flex">
          <div className="flex-1 min-w-0 flex flex-col rounded-[20px] bg-surface shadow-[var(--shadow-e1)] overflow-hidden">
            <header className="h-14 shrink-0 flex items-center gap-4 px-4 border-b border-line">
              <div className="w-[52px] -ml-1 flex justify-center">
                <LogoLockup compact />
              </div>
              <span className="text-sm font-semibold text-text-3 hidden md:inline">Analyst console</span>
              <div className="flex-1 flex justify-center px-2">
                <div className="w-full max-w-xl">
                  <SearchTrigger wide onOpen={() => setPaletteOpen(true)} placeholder="Search pages, countries, or paste an IP" />
                </div>
              </div>
              <StatusPill />
              <ThemeToggle />
              <AlertsBell to="/analyst/alerts" />
              <UserChip settingsPath="/analyst/settings" />
            </header>
            <div className="flex flex-1 min-h-0">
              <Rail />
              <main className="flex-1 min-w-0 overflow-y-auto px-5 py-5 lg:px-6">
                <Outlet />
              </main>
            </div>
          </div>
          <CopilotPanel />
          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            nav={ANALYST_NAV}
            iocPath="/analyst/ioc-explorer"
            countryPath="/analyst"
          />
        </div>
      </ShellDataProvider>
      </ThemeProvider>
    </PanelContext.Provider>
  );
}
