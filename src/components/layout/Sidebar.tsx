import { Home, Shield, BarChart3, Search, Grid, Clock, ClipboardList, FileText, Bell, Plug, Settings, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/analyst' },
  { icon: Shield, label: 'Threats', path: '/analyst/threats' },
  { icon: BarChart3, label: 'Analytics', path: '/analyst/analytics' },
  { icon: Search, label: 'IOC Explorer', path: '/analyst/ioc-explorer' },
  { icon: Grid, label: 'MITRE ATT&CK', path: '/analyst/mitre' },
  { icon: Clock, label: 'Timeline', path: '/analyst/timeline' },
  { icon: ClipboardList, label: 'Incidents', path: '/analyst/incidents' },
  { icon: FileText, label: 'Reports', path: '/analyst/reports' },
  { icon: Bell, label: 'Alerts', path: '/analyst/alerts' },
  { icon: Plug, label: 'Integrations', path: '/analyst/integrations' },
  { icon: Settings, label: 'Settings', path: '/analyst/settings' },
  { icon: BookOpen, label: 'Docs', path: '/analyst/docs' },
];

export default function Sidebar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-16 bg-surface border-r border-gray-700 flex flex-col items-center py-4 gap-1">
      {navItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="relative w-full flex justify-center"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <NavLink
              to={item.path}
              end={item.path === "/analyst"}
              className={({ isActive }) => `
                relative w-10 h-10 rounded-lg flex items-center justify-center
                transition-all duration-150
                ${isActive
                  ? 'bg-emerald/10 text-emerald'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald rounded-r" />
                  )}
                  <Icon size={20} />
                </>
              )}
            </NavLink>

            {hoveredIndex === index && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-panel border border-gray-700 px-3 py-1.5 rounded-md text-sm text-white whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}