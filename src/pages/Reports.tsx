import { useState } from "react";
import { FileText, Download, Loader2, CheckCircle2 } from "lucide-react";
import { downloadReport } from "../services/api";

export default function Reports() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ name: string; time: string }[]>([]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await downloadReport();
      const now = new Date();
      setHistory((prev) => [
        { name: `GeoShield_Executive_Report_${now.toISOString().slice(0, 10).replace(/-/g, "")}.pdf`, time: now.toLocaleString() },
        ...prev,
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Reports</h1>
        <p className="text-sm text-slate-500">Generate executive PDF reports from live threat data</p>
      </div>

      <div className="card-glow p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              GeoShield Executive Report
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              A PDF summary of current global risk, top threat origins, and key indicators —
              generated fresh from the live dataset each time.
            </p>
            {error && (
              <p className="text-xs text-rose-400 mb-3">Error: {error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-emerald text-navy font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Download size={16} /> Generate & Download PDF</>
              )}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Report History (this session)
          </h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="card-glow px-4 py-3 flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{h.name}</p>
                  <p className="text-xs text-slate-500">{h.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}