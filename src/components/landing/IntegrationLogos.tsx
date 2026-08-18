const INTEGRATIONS = [
  "Slack", "Splunk", "CrowdStrike", "PagerDuty", "Jira",
  "AWS GuardDuty", "Microsoft Sentinel", "AlienVault OTX",
];

const COLORS = ["#38bdf8", "#a78bfa", "#f43f5e", "#34d399", "#fbbf24", "#fb923c", "#06b6d4", "#818cf8"];

export default function IntegrationLogos() {
  const loopItems = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <div className="py-16 border-y border-slate-800 bg-slate-900/30 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />

      <p className="text-center text-xs font-mono text-slate-500 uppercase tracking-wider mb-10">
        Built to integrate with your existing stack
      </p>

      <div className="flex gap-16 animate-marquee-slow whitespace-nowrap">
        {loopItems.map((name, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <div
              key={i}
              className="flex items-center gap-2 shrink-0 group cursor-default"
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300 group-hover:w-2.5 group-hover:h-2.5"
                style={{ background: color, opacity: 0.5 }}
              />
              <span
                className="text-lg font-semibold text-slate-600 transition-colors duration-300"
                style={{ color: undefined }}
                onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}