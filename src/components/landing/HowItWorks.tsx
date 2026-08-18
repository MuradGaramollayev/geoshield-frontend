import { Database, Brain, Radar } from "lucide-react";

const STEPS = [
  {
    icon: Database,
    number: "01",
    title: "Collect",
    description:
      "9 live intelligence feeds (CISA KEV, Feodo Tracker, AbuseIPDB, Blocklist.de, Emerging Threats, VirusTotal, GreyNoise, PhishTank, Shodan) continuously stream real threat indicators.",
    color: "#38bdf8",
  },
  {
    icon: Brain,
    number: "02",
    title: "Analyze",
    description:
      "Every indicator is scored using a weighted risk formula that combines frequency, severity, source corroboration, and trend, then mapped against 124 countries and the MITRE ATT&CK framework.",
    color: "#a78bfa",
  },
  {
    icon: Radar,
    number: "03",
    title: "Predict",
    description:
      "Cross-referenced patterns show which regions, vectors, and infrastructure are trending toward the next wave of attacks, before it reaches your perimeter.",
    color: "#34d399",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            From raw signals to actionable forecast
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-sky-500/30 via-violet-500/30 to-emerald-500/30" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center group">
                <div
                  className="relative z-10 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <Icon size={28} style={{ color: step.color }} />
                </div>
                <span className="text-xs font-mono block mb-2" style={{ color: step.color }}>
                  {step.number}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}