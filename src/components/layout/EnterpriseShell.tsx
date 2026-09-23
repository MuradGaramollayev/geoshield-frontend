import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3, Bell, BookOpen, FileText, LayoutDashboard, Package, Plug, Settings, ShieldCheck, TrendingUp, Users,
} from "lucide-react";
import { PanelContext } from "../../design/panel";
import { ThemeProvider } from "../../design/theme";
import { LogoLockup } from "../brand/Logo";
import EnterpriseAdvisorPanel from "../enterprise/EnterpriseAdvisorPanel";
import { CommandPalette } from "./CommandPalette";
import { usePaletteHotkey } from "../../hooks/usePaletteHotkey";
import type { PaletteNavItem } from "./CommandPalette";
import { AlertsBell, SearchTrigger, StatusPill, UserChip } from "./TopbarStatus";
import { ThemeToggle } from "./ThemeToggle";
import { ShellDataProvider } from "./ShellDataProvider";

const ENTERPRISE_NAV: PaletteNavItem[] = [
  { icon: LayoutDashboard, label: "Strategic Overview", path: "/enterprise", group: "Overview" },
  { icon: BarChart3, label: "Advanced Analytics", path: "/enterprise/analytics", group: "Overview" },
  { icon: TrendingUp, label: "Risk Forecast", path: "/enterprise/forecast", group: "Risk exposure" },
  { icon: Package, label: "Supply Chain Risk", path: "/enterprise/supply-chain", group: "Risk exposure" },
  { icon: ShieldCheck, label: "Defense Architecture", path: "/enterprise/defense", group: "Risk exposure" },
  { icon: FileText, label: "Board Reports", path: "/enterprise/reports", group: "Governance" },
  { icon: Bell, label: "Alert Overview", path: "/enterprise/alerts", group: "Governance" },
  { icon: Plug, label: "Integrations", path: "/enterprise/integrations", group: "Workspace" },
  { icon: Users, label: "Team", path: "/enterprise/team", group: "Workspace" },
  { icon: Settings, label: "Settings", path: "/enterprise/settings", group: "Workspace" },
  { icon: BookOpen, label: "Docs", path: "/enterprise/docs", group: "Workspace" },
];

function Sidebar() {
  const groups = Array.from(new Set(ENTERPRISE_NAV.map((n) => n.group)));
  return (
    <aside className="w-[252px] shrink-0 flex flex-col px-4 pt-6 pb-5 overflow-y-auto [scrollbar-width:none]">
      <div className="px-2 mb-8">
        <LogoLockup />
      </div>
      <nav aria-label="Enterprise navigation" className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g}>
            <p className="px-3 mb-2 text-sm font-semibold text-ink">{g}</p>
            <ul className="relative ml-3 pl-3 border-l border-line-strong/70 flex flex-col gap-1">
              {ENTERPRISE_NAV.filter((n) => n.group === g).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/enterprise"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-10 px-3 rounded-[12px] text-sm interactive ${
                          isActive
                            ? "bg-paper text-ink font-semibold shadow-[var(--shadow-e3)]"
                            : "text-text-2 hover:text-ink hover:bg-sunken"
                        }`
                      }
                    >
                      <Icon size={16} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function EnterpriseShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  usePaletteHotkey(setPaletteOpen);

  return (
    <PanelContext.Provider value="enterprise">
      <ThemeProvider panel="enterprise">
      <ShellDataProvider>
        <div data-panel="enterprise" className="h-screen bg-canvas p-2.5 flex">
          <div className="flex-1 min-w-0 flex rounded-[28px] bg-surface shadow-[var(--shadow-e1)] overflow-hidden">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <header className="h-[76px] shrink-0 flex items-center justify-end gap-3 px-8">
                <SearchTrigger onOpen={() => setPaletteOpen(true)} placeholder="Search reports, countries…" />
                <StatusPill />
                <ThemeToggle />
                <AlertsBell to="/enterprise/alerts" />
                <UserChip settingsPath="/enterprise/settings" />
              </header>
              <main className="flex-1 min-h-0 overflow-y-auto px-8 pb-10">
                <div className="max-w-[1320px] mx-auto">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
          <EnterpriseAdvisorPanel />
          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            nav={ENTERPRISE_NAV}
            countryPath="/enterprise"
          />
        </div>
      </ShellDataProvider>
      </ThemeProvider>
    </PanelContext.Provider>
  );
}
