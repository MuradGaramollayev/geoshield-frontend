import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe2, Radar, ScanSearch, Server, ShieldCheck, ShieldAlert, Bug } from "lucide-react";
import { lookupIoc } from "../services/api";
import type { IocLookupResult } from "../services/api";
import { SEVERITY, toSeverity } from "../design/tokens";
import { useMotion } from "../design/panel";
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, KeyValue, MethodologyNote, PageHeader, SeverityBadge, Skeleton,
} from "../components/ui";

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/;

function SourceCard({
  icon,
  title,
  present,
  emptyNote,
  children,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  present: boolean;
  emptyNote: string;
  children?: React.ReactNode;
  delay: number;
}) {
  const m = useMotion();
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: m.enter, delay, ease: m.ease }}>
      <Card className="h-full">
        <CardHeader title={title} icon={icon} actions={present ? <Badge tone="positive">Data returned</Badge> : <Badge>No data</Badge>} className="mb-2" />
        {present ? <div className="divide-y divide-line">{children}</div> : <p className="text-sm text-text-3 py-3">{emptyNote}</p>}
      </Card>
    </motion.div>
  );
}

export default function IocExplorer() {
  // The IP being looked up lives in the URL (?ip=), so deep links and Ctrl K work.
  const [params, setParams] = useSearchParams();
  const query = params.get("ip");
  const [ip, setIp] = useState(query ?? "");
  const [inputError, setInputError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(query ? [query] : []);
  const lookup = useAsync<IocLookupResult | null>(() => (query ? lookupIoc(query) : Promise.resolve(null)), [query]);
  const loading = !!query && lookup.loading;
  const error = lookup.error;
  const result = loading ? null : lookup.data;

  const search = (target?: string) => {
    const q = (target ?? ip).trim();
    if (!q) return;
    if (!IPV4.test(q) && !(q.includes(":") && IPV6.test(q))) {
      setInputError("Enter a valid IPv4 or IPv6 address, e.g. 45.148.10.141");
      return;
    }
    setInputError(null);
    setHistory((prev) => [q, ...prev.filter((h) => h !== q)].slice(0, 6));
    if (q === query) lookup.reload();
    else setParams({ ip: q }, { replace: true });
  };

  const sev = result ? toSeverity(result.risk_level) : null;
  const tone = sev ? SEVERITY[sev] : null;
  const vt = result?.virustotal;
  const vtTotal = vt ? (vt.malicious ?? 0) + (vt.suspicious ?? 0) + (vt.harmless ?? 0) : 0;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="IOC Lookup"
        description="IP reputation across AbuseIPDB, VirusTotal, Shodan and GreyNoise, with a combined verdict."
      />

      <Card className="mb-[var(--gap-grid)]">
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <div className={`field flex-1 ${inputError ? "shadow-[0_0_0_1px_var(--color-sev-critical)]" : ""}`}>
            <ScanSearch size={17} className="text-text-3 shrink-0" />
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter an IP address, e.g. 45.148.10.141"
              aria-label="IP address"
              aria-invalid={!!inputError}
              className="code"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="primary" loading={loading}>
            Look up
          </Button>
        </form>
        {inputError && <p className="text-sm text-sev-critical-text mt-2">{inputError}</p>}
        {history.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-text-3">Recent</span>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setIp(h);
                  search(h);
                }}
                className="code text-xs text-ink bg-sunken hover:bg-well rounded-[8px] px-2 py-1 interactive"
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </Card>

      {error && <ErrorState message={error} onRetry={lookup.reload} className="mb-[var(--gap-grid)]" />}

      {loading && (
        <div className="grid md:grid-cols-2 gap-[var(--gap-grid)]">
          <Skeleton className="h-36 rounded-[20px] md:col-span-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-[20px]" />
          ))}
        </div>
      )}

      {!loading && result && (
        <div className="space-y-[var(--gap-grid)]">
          <Card className="relative overflow-hidden">
            {tone && <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: tone.solid }} aria-hidden="true" />}
            <div className="flex flex-wrap items-center gap-5 pl-2">
              <span
                className="w-14 h-14 rounded-[16px] inline-flex items-center justify-center shrink-0"
                style={{ background: tone?.tint ?? "var(--color-sunken)", color: tone?.text ?? "var(--color-text-2)" }}
              >
                {sev === "LOW" || !sev ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
              </span>
              <div className="flex-1 min-w-[240px]">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="code text-xl font-semibold text-ink">{result.ip}</span>
                  {sev ? <SeverityBadge severity={sev} /> : <Badge>Unknown</Badge>}
                  {result.mode === "online" ? (
                    <Badge tone="positive">Live vendor lookup</Badge>
                  ) : (
                    <span title="Served from the backend's offline cache, not a live vendor response.">
                      <Badge tone="caution">Offline cache</Badge>
                    </span>
                  )}
                </div>
                <p className="text-base text-text-2">{result.message ?? result.recommendation}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--gap-grid)]">
            <SourceCard
              icon={<Globe2 size={17} />}
              title="AbuseIPDB"
              present={result.abuseipdb?.score !== undefined}
              emptyNote="No report returned. The IP may be unreported, or the API rate limit was hit."
              delay={0}
            >
              <KeyValue
                label="Abuse confidence"
                value={
                  <span style={{ color: (result.abuseipdb.score ?? 0) >= 50 ? SEVERITY.CRITICAL.text : undefined }}>
                    {result.abuseipdb.score}%
                  </span>
                }
              />
              <KeyValue label="Country" value={result.abuseipdb.country || "—"} />
              <KeyValue label="ISP" value={result.abuseipdb.isp || "—"} />
              <KeyValue label="Usage type" value={result.abuseipdb.usageType || "—"} />
              <KeyValue label="Total reports" value={result.abuseipdb.totalReports?.toLocaleString() ?? "—"} />
              {!!result.abuseipdb.categories?.length && (
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {result.abuseipdb.categories.map((c) => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                </div>
              )}
            </SourceCard>

            <SourceCard
              icon={<Bug size={17} />}
              title="VirusTotal"
              present={vt?.malicious !== undefined}
              emptyNote="No analysis returned. The IP may be unscanned, or the API rate limit was hit."
              delay={0.04}
            >
              {vtTotal > 0 && (
                <div className="py-3">
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-sunken">
                    <span style={{ width: `${((vt?.malicious ?? 0) / vtTotal) * 100}%`, background: SEVERITY.CRITICAL.solid }} />
                    <span style={{ width: `${((vt?.suspicious ?? 0) / vtTotal) * 100}%`, background: SEVERITY.MEDIUM.solid }} />
                    <span style={{ width: `${((vt?.harmless ?? 0) / vtTotal) * 100}%`, background: SEVERITY.LOW.solid }} />
                  </div>
                  <p className="text-xs text-text-3 mt-1.5">
                    <span className="num text-ink font-semibold">{vt?.malicious}</span> of <span className="num">{vtTotal}</span> engines flag this IP as malicious
                  </p>
                </div>
              )}
              <KeyValue label="Malicious" value={vt?.malicious ?? "—"} />
              <KeyValue label="Suspicious" value={vt?.suspicious ?? "—"} />
              <KeyValue label="Harmless" value={vt?.harmless ?? "—"} />
              <KeyValue label="Reputation" value={vt?.reputation ?? "—"} />
              <KeyValue label="AS owner" value={vt?.as_owner || "—"} />
              {vt?.network && <KeyValue label="Network" value={vt.network} mono />}
            </SourceCard>

            <SourceCard
              icon={<Server size={17} />}
              title="Shodan"
              present={!!result.shodan}
              emptyNote="This IP isn't in the Shodan enrichment set."
              delay={0.08}
            >
              {result.shodan && (
                <>
                  <KeyValue label="Location" value={[result.shodan.city, result.shodan.country].filter(Boolean).join(", ") || "—"} />
                  <KeyValue label="Organisation" value={result.shodan.org || "—"} />
                  {result.shodan.os && <KeyValue label="OS" value={result.shodan.os} />}
                  <KeyValue label="Open ports" value={result.shodan.port_count ?? "—"} />
                  {!!result.shodan.ports?.length && (
                    <div className="flex flex-wrap gap-1.5 py-2.5">
                      {result.shodan.ports.slice(0, 12).map((p) => (
                        <span key={p} className="code text-xs bg-sunken text-ink rounded-[6px] px-1.5 py-0.5">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <KeyValue
                    label="Exposed CVEs"
                    value={
                      <span style={{ color: (result.shodan.vuln_count ?? 0) > 0 ? SEVERITY.CRITICAL.text : undefined }}>
                        {result.shodan.vuln_count ?? 0}
                      </span>
                    }
                  />
                  {!!result.shodan.cves?.length && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {result.shodan.cves.slice(0, 8).map((c) => (
                        <a
                          key={c}
                          href={`https://nvd.nist.gov/vuln/detail/${c}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="code text-xs rounded-[6px] px-1.5 py-0.5 hover:underline"
                          style={{ background: SEVERITY.CRITICAL.tint, color: SEVERITY.CRITICAL.text }}
                        >
                          {c}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </SourceCard>

            <SourceCard
              icon={<Radar size={17} />}
              title="GreyNoise"
              present={!!result.greynoise}
              emptyNote="This IP isn't in the GreyNoise enrichment set."
              delay={0.12}
            >
              {result.greynoise && (
                <>
                  <KeyValue label="Classification" value={<span className="capitalize">{result.greynoise.classification || "—"}</span>} />
                  <KeyValue label="Actor" value={result.greynoise.name || "—"} />
                  <KeyValue label="Internet noise" value={result.greynoise.noise ? "Yes" : "No"} />
                  <KeyValue label="Known benign (RIOT)" value={result.greynoise.riot ? "Yes" : "No"} />
                  {result.greynoise.last_seen && <KeyValue label="Last seen" value={result.greynoise.last_seen} mono />}
                </>
              )}
            </SourceCard>
          </div>

          <MethodologyNote>
            <p>
              The verdict starts from AbuseIPDB confidence and VirusTotal malicious-engine count:
              score = max(abuse confidence, malicious engines × 6). Critical at score ≥ 80 or ≥ 10 engines, High at ≥ 50
              or ≥ 4, Medium at ≥ 20 or ≥ 1, otherwise Low.
            </p>
            <p>
              Shodan and GreyNoise can only raise the verdict: a GreyNoise “malicious” classification lifts it to at least
              High, “suspicious” to at least Medium, 1–9 exposed CVEs to at least High, and 10+ exposed CVEs to Critical.
            </p>
            <p>
              <strong className="text-ink">Live vendor lookup</strong> means the backend queried AbuseIPDB and VirusTotal
              just now. <strong className="text-ink">Offline cache</strong> means it answered from its local cache instead.
            </p>
          </MethodologyNote>
        </div>
      )}

      {!loading && !result && !error && (
        <Card>
          <EmptyState
            icon={<ScanSearch size={20} />}
            title="Look up an IP to see its reputation"
            description="Paste any IPv4 or IPv6 address. Ctrl K also jumps here with an IP."
          />
        </Card>
      )}
    </div>
  );
}
