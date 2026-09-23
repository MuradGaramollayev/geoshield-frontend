import { useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ban, Check, ClipboardPlus, ScanSearch, TrendingUp } from "lucide-react";
import { createIncident, fetchCountryDetail } from "../../services/api";
import type { CountryDetail } from "../../services/api";
import { toSeverity } from "../../design/tokens";
import { useTheme } from "../../design/themeContext";
import { usePanel } from "../../design/panel";
import { getUser } from "../../utils/auth";
import ResponseModal from "./ResponseModal";
import { SOURCE_LABELS } from "../../design/sources";
import { Button, CountUp, Drawer, ErrorState, MeterRow, SeverityBadge, Skeleton, Sparkline, TrendBadge } from "../ui";


function ScoreRing({ score }: { score: number }) {
  const th = useTheme();
  const r = 38;
  const c = 2 * Math.PI * r;
  const col = th.riskColor(score);
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-sunken)" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp value={score} decimals={1} className="text-xl font-semibold tracking-[-0.03em] text-ink" />
        <span className="text-2xs text-text-3">of 100</span>
      </div>
    </div>
  );
}

/** Country drill-down, shared by both panels. Everything shown comes from /api/countries/{code}. */
export default function CountryDetailPanel({ countryCode, onClose }: { countryCode: string | null; onClose: () => void }) {
  const panel = usePanel();
  const th = useTheme();
  const req = useAsync<CountryDetail | null>(
    () => (countryCode ? fetchCountryDetail(countryCode) : Promise.resolve(null)),
    [countryCode],
  );
  const loading = !!countryCode && req.loading;
  const error = req.error;
  const detail = !loading && req.data?.code === countryCode ? req.data : null;
  const [blocking, setBlocking] = useState(false);
  // Incident-creation state is tracked per country so it resets when another country opens.
  const [incRaw, setIncState] = useState<{ code?: string | null; busy: boolean; id?: string; error?: string }>({ busy: false });
  const incState = incRaw.code === countryCode ? incRaw : { busy: false } as typeof incRaw;

  const sources = detail
    ? Object.entries(detail.sources).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
    : [];
  const maxSource = Math.max(1, ...sources.map(([, v]) => v));
  const sev = detail ? toSeverity(detail.risk_level) : null;

  const raiseIncident = async () => {
    if (!detail) return;
    setIncState({ code: countryCode, busy: true });
    const me = getUser();
    try {
      const inc = await createIncident({
        title: `Elevated threat activity from ${detail.name}`,
        severity: sev ?? "MEDIUM",
        source_country: detail.code,
        source_ip: detail.top_ips[0]?.ip ?? null,
        attack_type: detail.primary_attack,
        assignee: me ? `${me.firstName} ${me.lastName}` : "Unassigned",
        evidence: [
          `Country risk score ${detail.risk_score} (${detail.risk_level})`,
          `${detail.total_threats.toLocaleString()} indicators from ${detail.source_count} sources`,
          ...sources.slice(0, 3).map(([k, v]) => `${SOURCE_LABELS[k] ?? k}: ${v.toLocaleString()}`),
        ],
      });
      setIncState({ code: countryCode, busy: false, id: inc.id });
    } catch (err) {
      setIncState({ code: countryCode, busy: false, error: err instanceof Error ? err.message : String(err) });
    }
  };

  const incidentsPath = panel === "enterprise" ? "/enterprise/alerts" : "/analyst/incidents";

  return (
    <>
      <Drawer
        open={countryCode !== null}
        onClose={onClose}
        width={500}
        subtitle={detail ? <span className="code">{detail.code}</span> : "Country"}
        title={detail?.name ?? (loading ? "Loading…" : "")}
        footer={
          detail && (
            <>
              {incState.id ? (
                <p role="status" className="text-sm text-positive flex items-center gap-2">
                  <Check size={16} /> {incState.id} created.{" "}
                  <Link to={incidentsPath} className="font-semibold underline">Open it</Link>
                </p>
              ) : (
                incState.error && <p role="alert" className="text-sm text-sev-critical-text">Incident not created: {incState.error}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" icon={<ClipboardPlus size={16} />} onClick={raiseIncident} loading={incState.busy} disabled={!!incState.id}>
                  Create incident
                </Button>
                <Button variant="danger" icon={<Ban size={16} />} onClick={() => setBlocking(true)}>
                  Generate country block rules
                </Button>
                {panel === "enterprise" && (
                  <Link to={`/enterprise/forecast?country=${detail.code}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] text-sm font-semibold text-text-2 hover:bg-sunken interactive">
                    <TrendingUp size={16} /> Forecast
                  </Link>
                )}
              </div>
            </>
          )
        }
      >
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4"><Skeleton className="w-24 h-24 rounded-full" /><Skeleton className="h-6 w-40" /></div>
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        )}
        {error && <ErrorState message={error} />}
        {detail && (
          <div className="space-y-7">
            <div className="flex items-center gap-5">
              <ScoreRing score={detail.risk_score} />
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={detail.risk_level} />
                  <TrendBadge trend={detail.trend} days={detail.trend_days}>
                    {detail.trend === "insufficient"
                      ? `${detail.trend_days}d of history`
                      : `${detail.trend_change > 0 ? "+" : ""}${detail.trend_change} pts / ${detail.trend_days}d`}
                  </TrendBadge>
                </div>
                <p className="text-sm text-text-2">
                  Main activity: <span className="font-semibold text-ink">{detail.primary_attack}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="e3 p-4">
                <CountUp value={detail.total_threats} className="text-2xl font-medium tracking-[-0.03em] text-ink" />
                <p className="text-sm text-text-3 mt-0.5">Threat indicators</p>
              </div>
              <div className="e3 p-4">
                <p className="text-2xl font-medium tracking-[-0.03em] text-ink">
                  <CountUp value={detail.source_count} /> <span className="text-text-3 text-md">of 9</span>
                </p>
                <p className="text-sm text-text-3 mt-0.5">Sources reporting</p>
              </div>
            </div>

            {detail.score_history.length > 1 && (
              <section>
                <h3 className="text-sm font-semibold text-ink mb-2">Recorded risk score</h3>
                <Sparkline
                  id={`hist-${detail.code}`}
                  data={detail.score_history.map((p) => ({ value: p.risk_score }))}
                  stroke={th.riskColor(detail.risk_score)}
                  height={56}
                />
                <p className="text-xs text-text-3 mt-1">
                  {detail.score_history.length} daily snapshots, {detail.score_history[0].date} to{" "}
                  {detail.score_history[detail.score_history.length - 1].date}
                </p>
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold text-ink mb-3">Indicators by source</h3>
              <div className="space-y-2.5">
                {sources.map(([k, v]) => (
                  <MeterRow key={k} label={SOURCE_LABELS[k] ?? k} value={v} max={maxSource} color={sev ? th.sev[sev].solid : undefined} />
                ))}
              </div>
              <p className="text-xs text-text-3 mt-2.5">{detail.primary_attack_basis}</p>
              {detail.sources.phishtank > detail.total_threats && (
                <p className="text-xs text-text-3 mt-1">PhishTank counts phishing URLs and is reported separately from the indicator total.</p>
              )}
            </section>

            {detail.top_ips.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ink mb-2">IPs observed here (AbuseIPDB)</h3>
                <ul className="divide-y divide-line">
                  {detail.top_ips.map((ip) => (
                    <li key={ip.ip} className="flex items-center gap-3 py-2.5">
                      <span className="flex-1 min-w-0">
                        <span className="block code text-sm text-ink">{ip.ip}</span>
                        <span className="block text-xs text-text-3 truncate">{[ip.city, ip.isp].filter(Boolean).join(" · ")}</span>
                      </span>
                      {panel === "analyst" && (
                        <Link to={`/analyst/ioc-explorer?ip=${ip.ip}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-ink hover:underline shrink-0">
                          <ScanSearch size={13} /> Look up
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Drawer>

      {blocking && detail && (
        <ResponseModal
          action="block_country"
          target={detail.code}
          reason={`Risk ${detail.risk_score} (${detail.risk_level}): ${detail.primary_attack}`}
          onClose={() => setBlocking(false)}
        />
      )}
    </>
  );
}
