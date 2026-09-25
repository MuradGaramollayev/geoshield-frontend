import { useState } from "react";
import { CalendarClock, CheckCircle2, Download, FileText } from "lucide-react";
import {
  downloadReport, fetchCountries, fetchReportSchedule, fetchStatus, formatAsOf, updateReportSchedule,
} from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import type { ReportSchedule } from "../../services/api";
import { formatTs } from "../../utils/time";
import {
  Badge, Button, Card, CardHeader, IconTile, PageHeader, SelectField, SeverityBadge, Skeleton, TextField,
} from "../../components/ui";

export default function EnterpriseReports() {
  const preview = useAsync(() => Promise.all([fetchStatus(), fetchCountries()]), []);
  const sched = useAsync(fetchReportSchedule, []);
  const [status, countries] = preview.data ?? [null, null];
  const top = [...(countries?.countries ?? [])].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ name: string; time: string }[]>([]);

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      await downloadReport();
      const now = new Date();
      setHistory((h) => [{ name: `GeoShield_Board_Briefing_${now.toISOString().slice(0, 10)}.pdf`, time: now.toLocaleString("en-GB") }, ...h]);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Board Reports" description="A board-ready threat briefing, generated from the current dataset on demand or on a schedule." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[var(--gap-grid)] items-start">
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <IconTile size="lg" tone="ink"><FileText size={20} /></IconTile>
            <div>
              <p className="text-lg font-semibold text-ink">Executive threat briefing</p>
              <p className="text-sm text-text-3">PDF · about 6 pages · figures below are what it will contain</p>
            </div>
          </div>

          {preview.loading ? (
            <Skeleton className="h-56 rounded-[16px] mb-6" />
          ) : status ? (
            <div className="e3 p-6 mb-6">
              <p className="text-xs text-text-3 mb-4">Data as of {formatAsOf(status.as_of)}</p>
              <div className="grid grid-cols-3 gap-4 pb-5 mb-5 border-b border-line">
                {[
                  { v: status.data.avg_risk, l: "Global risk index" },
                  { v: status.data.countries, l: "Countries monitored" },
                  { v: status.data.total_threats.toLocaleString(), l: "Threat indicators" },
                ].map((k) => (
                  <div key={k.l}>
                    <p className="num text-2xl font-medium tracking-[-0.03em] text-ink">{k.v}</p>
                    <p className="text-sm text-text-3 mt-1">{k.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-ink mb-3">Highest exposure</p>
              <ul className="space-y-2.5">
                {top.map((c) => (
                  <li key={c.code} className="flex items-center gap-3">
                    <span className="flex-1 text-base text-text-2">{c.name}</span>
                    <span className="num text-base font-semibold text-ink">{c.risk_score}</span>
                    <SeverityBadge severity={c.risk_level} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {genError && <p role="alert" className="text-sm text-sev-critical-text mb-3">The briefing wasn't generated ({genError}). Try again once the backend is reachable.</p>}
          <Button variant="primary" size="lg" icon={<Download size={17} />} onClick={generate} loading={generating}>
            {generating ? "Generating briefing" : "Generate and download briefing"}
          </Button>

          {history.length > 0 && (
            <ul className="mt-6 space-y-2">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={16} className="text-positive" />
                  <span className="code text-ink flex-1 truncate">{h.name}</span>
                  <span className="text-text-3">{h.time}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Schedule"
            description="Recurring briefing for leadership"
            icon={<CalendarClock size={17} />}
            actions={sched.data?.configured ? <Badge tone="positive">Configured</Badge> : <Badge>Not set</Badge>}
          />
          {sched.loading ? (
            <div className="space-y-3"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
          ) : (
            <ScheduleForm key={sched.data?.updated_at ?? "unset"} schedule={sched.data} onSaved={sched.setData} />
          )}
        </Card>
      </div>
    </div>
  );
}

function ScheduleForm({ schedule, onSaved }: { schedule: ReportSchedule | null; onSaved: (s: ReportSchedule) => void }) {
  const [frequency, setFrequency] = useState(schedule?.frequency ?? "weekly");
  const [email, setEmail] = useState(schedule?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      onSaved(await updateReportSchedule({ frequency, email }));
    } catch (err) {
      setError(`Not saved: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <SelectField label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </SelectField>
      <TextField label="Deliver to" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ciso@yourcompany.com" />
      <Button type="submit" variant="primary" className="w-full" loading={saving}>Save schedule</Button>
      {error && <p role="alert" className="text-sm text-sev-critical-text">{error}</p>}
      {schedule?.updated_at && <p role="status" className="text-sm text-positive">Schedule saved {formatTs(schedule.updated_at)}</p>}
      {schedule?.next_run && <p className="text-sm text-text-2">Next run: <span className="num">{formatTs(schedule.next_run)}</span></p>}
      <p className="text-sm text-text-3 pt-4 border-t border-line leading-relaxed">
        {schedule?.delivery_active
          ? "Automated email delivery is active."
          : "The schedule is saved. Automatic email delivery isn't connected to a mail server yet, so generate the briefing manually for now."}
      </p>
    </form>
  );
}
