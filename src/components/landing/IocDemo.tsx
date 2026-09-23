import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { lookupIoc } from "../../services/api";
import type { IocLookupResult, SourceOrigin } from "../../services/api";
import { useTheme } from "../../design/themeContext";
import { Button, MethodologyNote, TextField } from "../ui";

/** Addresses the demo warms in the cache, so they resolve from real vendor data. */
const SAMPLES = ["50.16.16.211", "14.103.120.124", "185.220.101.1"];

const ORIGIN_LABEL: Record<SourceOrigin, string> = {
  live: "live vendor call",
  cached: "cached vendor response",
  cached_stale: "last genuine response",
  local_dataset: "bundled dataset",
  rate_limited: "rate limited",
  auth_error: "key rejected",
  not_found: "no record",
  no_key: "no key configured",
  offline: "vendor unreachable",
  error: "lookup failed",
};

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-text-2">{label}</span>
      <span className="text-right">
        <span className="num text-sm font-semibold text-ink">{value}</span>
        {note && <span className="code ml-2 text-2xs text-text-3">{note}</span>}
      </span>
    </div>
  );
}

/**
 * A working IOC lookup on the landing page. It calls the same endpoint the
 * product uses, and reports where each number came from: a live vendor call, a
 * cached genuine response, or no data at all. Nothing is ever invented to fill
 * a gap, so a rate-limited lookup honestly says so.
 */
export default function IocDemo() {
  const th = useTheme();
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<IocLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (value: string) => {
    const target = value.trim();
    if (!IPV4.test(target)) {
      setError("Enter an IPv4 address, for example 50.16.16.211");
      setResult(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setResult(await lookupIoc(target));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  const abuse = result?.abuseipdb ?? {};
  const vt = result?.virustotal ?? {};
  const unavailable = result?.mode === "unavailable";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div>
        <p className="text-lg leading-relaxed text-text-2">
          Paste any IPv4 address. The lookup runs against AbuseIPDB, VirusTotal, Shodan and
          GreyNoise through the same endpoint the console uses.
        </p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(ip);
          }}
        >
          <TextField
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="93.184.216.34"
            mono
            aria-label="IP address to look up"
            className="flex-1"
          />
          <Button type="submit" variant="accent" loading={busy} icon={<Search size={16} />}>
            Look up
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-2xs text-text-3">Try:</span>
          {SAMPLES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setIp(s);
                void run(s);
              }}
              className="code rounded-full bg-sunken px-2.5 py-1 text-2xs text-text-2 interactive hover:bg-well hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>

        <MethodologyNote className="mt-6">
          Free vendor tiers are rate limited. When a limit is hit and nothing genuine is
          cached, the lookup returns "data unavailable" rather than a number we made up.
        </MethodologyNote>
      </div>

      <div className="e2 min-h-[320px] rounded-[16px] p-6">
        {!result && !error && (
          <div className="flex h-full min-h-[268px] flex-col items-center justify-center text-center">
            <Search size={22} className="text-text-4" />
            <p className="mt-3 text-sm text-text-3">Run a lookup to see a real vendor response.</p>
          </div>
        )}

        {error && <p className="text-sm text-sev-critical-text">{error}</p>}

        {result && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="code text-lg font-semibold text-ink">{result.ip}</p>
              <span
                className="rounded-full px-2.5 py-1 text-2xs font-semibold"
                style={{
                  background: unavailable ? th.c.well : result.mode === "live" ? th.sev.LOW.tint : th.c.accent100,
                  color: unavailable ? th.c.text2 : result.mode === "live" ? th.sev.LOW.text : th.c.accentInk,
                }}
              >
                {unavailable ? "data unavailable" : result.mode === "live" ? "live vendor call" : "from cache"}
              </span>
            </div>

            {unavailable ? (
              <p className="mt-5 text-sm leading-relaxed text-text-2">
                {result.message ??
                  "No vendor returned data for this address and nothing genuine is cached, so there is nothing to show."}
                {result.rate_limited && " The free-tier limit is currently exhausted."}
              </p>
            ) : (
              <div className="mt-4">
                <Row label="AbuseIPDB confidence" value={abuse.score !== undefined ? `${abuse.score}%` : "—"} />
                <Row label="Reports" value={abuse.totalReports?.toLocaleString() ?? "—"} />
                <Row label="Network" value={abuse.isp ?? vt.as_owner ?? "—"} />
                <Row label="VirusTotal malicious" value={vt.malicious !== undefined ? `${vt.malicious}` : "—"} />
                <Row label="Assessment" value={result.risk_level} />
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-1.5">
              {Object.entries(result.sources ?? {}).map(([name, s]) => (
                <span
                  key={name}
                  className="code rounded-full bg-sunken px-2 py-1 text-2xs text-text-2"
                  title={s.detail ?? ORIGIN_LABEL[s.source]}
                >
                  {name}: {ORIGIN_LABEL[s.source] ?? s.source}
                </span>
              ))}
            </div>

            <Link
              to="/analyst/ioc"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline"
            >
              Full enrichment in the console <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
