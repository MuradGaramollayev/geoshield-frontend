import { Search, Bell, Circle } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-14 bg-surface border-b border-gray-700 flex items-center justify-between px-6">

      <div className="flex items-center gap-2">
        <span
          className="font-mono font-bold text-white tracking-wider text-base"
          style={{ textShadow: "0 0 12px rgba(16, 185, 129, 0.35)" }}
        >
          GEOSHIELD
        </span>
      </div>

      <div className="flex-1 max-w-3xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
          <input
            type="text"
            placeholder="Search countries, IPs, threats, incidents..."
            className="w-full bg-panel border border-gray-700 rounded-lg pl-10 pr-16 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">
            Ctrl K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-emerald/10 border border-emerald/20 rounded-full px-3 py-1">
          <Circle className="text-emerald fill-emerald animate-pulse" size={8} />
          <span className="text-xs font-mono text-emerald">LIVE FEED</span>
        </div>

        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center text-white">
            3
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-cyan flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          MG
        </div>
      </div>
    </div>
  );
}