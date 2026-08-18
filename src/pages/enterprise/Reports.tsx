import { useEffect, useState } from "react";
import { FileText, Download, Loader2, CheckCircle2, Calendar, Save, Eye } from "lucide-react";
import {
  downloadReport, fetchReportSchedule, updateReportSchedule,
  fetchStatus, fetchCountries,
} from "../../services/api";
import type { ReportSchedule, StatusData, CountryRisk } from "../../services/api";

function formatTimestamp(ts: string): string {
  const cleaned = ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

export default function EnterpriseReports() {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ name: string; time: string }[]>([]);

  const [schedule, setSchedule] = useState<ReportSchedule | null>(null);
  const [frequency, setFrequency] = useState("weekly");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [status, setStatus] = useState<StatusData | null>(null);
  const [topCountries, setTopCountries] = useState<CountryRisk[]>([]);

  useEffect(() => {
    fetchReportSchedule().then((s) => {
      setSchedule(s);
      if (s.frequency) setFrequency(s.frequency);
      if (s.email) setEmail(s.email);
    });
    fetchStatus().then(setStatus);
    fetchCountries().then((data) => {
      const sorted = [...data.countries].sort((a, b) => b.risk_score - a.risk_score).slice(0, 3);
      setTopCountries(sorted);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      await downloadReport();
      const now = new Date();
      setHistory((prev) => [
        { name: `GeoShield_Executive_Report_${now.toISOString().slice(0, 10).replace(/-/g, "")}.pdf`, time: now.toLocaleString() },
        ...prev,
      ]);
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const updated = await updateReportSchedule({ frequency, email });
      setSchedule(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Executive reporting, on demand and scheduled</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate + Preview + History */}
        <div className="space-y-4">
          <div className="card-glow p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                <FileText size={22} className="text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Executive Threat Briefing
                </h3>
                <p className="text-xs text-slate-500">
                  A board-ready PDF summarizing current global risk, top origins, and key indicators.
                </p>
              </div>
            </div>

            {/* Live report preview */}
            {status && (
              <div className="bg-slate-800/40 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Eye size={12} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Live Preview
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xl font-bold text-slate-100">{status.data.avg_risk}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Global Risk</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-100">{status.data.countries}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Countries</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-100">{status.data.total_threats.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Indicators</p>
                  </div>
                </div>
                {topCountries.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Top Risk Origins</p>
                    {topCountries.map((c) => (
                      <div key={c.code} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{c.name}</span>
                        <span className="font-semibold" style={{ color: RISK_COLOR[c.risk_level] }}>
                          {c.risk_score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {genError && <p className="text-xs text-rose-400 mb-3">Error: {genError}</p>}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Download size={16} /> Generate & Download PDF</>
              )}
            </button>
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

        {/* Schedule */}
        <div className="card-glow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-200">Report Schedule</h3>
            </div>
            {schedule?.configured && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Configured
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Delivery Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@yourcompany.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 text-sm bg-sky-500 text-white font-semibold rounded-lg py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saved ? (
              <><CheckCircle2 size={14} /> Saved</>
            ) : saving ? (
              "Saving..."
            ) : (
              <><Save size={14} /> Save Schedule</>
            )}
          </button>

          {schedule?.next_run && (
            <p className="text-[11px] text-slate-500 mt-3">
              Next scheduled run: {formatTimestamp(schedule.next_run)}
            </p>
          )}

          <p className="text-[11px] text-slate-600 mt-3 pt-3 border-t border-slate-800">
            {schedule?.delivery_active
              ? "Automated email delivery is active."
              : "Schedule is saved. Automated email delivery is not yet wired to an SMTP dispatcher — this is planned for a future phase."}
          </p>
        </div>
      </div>
    </div>
  );
}