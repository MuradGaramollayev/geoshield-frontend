export default function DashboardPreview() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
            See It In Action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Your real-time threat intelligence dashboard
          </h2>
        </div>

        <div
          className="relative rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
          style={{ boxShadow: "0 0 60px -12px rgba(16,185,129,0.15)" }}
        >
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 mx-4 bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-500 font-mono">
              app.geoshield.io/dashboard
            </div>
          </div>

          <img
            src="/dashboard-preview.png"
            alt="GeoShield Dashboard"
            className="w-full block"
          />
        </div>
      </div>
    </div>
  );
}