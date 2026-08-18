import { Home, BarChart3, FileText, Bell, Plug, Settings, BookOpen, Shield, TrendingUp, Package } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/enterprise' },
  { icon: BarChart3, label: 'Advanced Analytics', path: '/enterprise/analytics' },
  { icon: Shield, label: 'Defense Architecture', path: '/enterprise/defense' },
  { icon: TrendingUp, label: 'Risk Forecast', path: '/enterprise/forecast' },
  { icon: Package, label: 'Supply Chain Risk', path: '/enterprise/supply-chain' },
  { icon: FileText, label: 'Reports', path: '/enterprise/reports' },
  { icon: Bell, label: 'Alert Overview', path: '/enterprise/alerts' },
  { icon: Plug, label: 'Integrations', path: '/enterprise/integrations' },
  { icon: Settings, label: 'Settings', path: '/enterprise/settings' },
  { icon: BookOpen, label: 'Docs', path: '/enterprise/docs' },
];

export default function EnterpriseSidebar() {
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
              end={item.path === "/enterprise"}
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