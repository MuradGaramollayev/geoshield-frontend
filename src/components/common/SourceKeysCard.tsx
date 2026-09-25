import { KeyRound } from "lucide-react";
import { fetchStatus } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { Badge, Card, CardHeader, Skeleton } from "../ui";

const LABELS: Record<string, { name: string; use: string }> = {
  abuseipdb: { name: "AbuseIPDB", use: "Live IOC lookups" },
  virustotal: { name: "VirusTotal", use: "Live IOC lookups" },
  otx: { name: "AlienVault OTX", use: "Collector enrichment" },
  anthropic: { name: "Anthropic (Claude)", use: "AI Advisor answers" },
};

/** Real API-key status reported by the backend's /api/status. Values are never shown. */
export default function SourceKeysCard() {
  const { data, loading, error } = useAsync(fetchStatus, []);
  return (
    <Card>
      <CardHeader
        title="Backend API keys"
        description="Reported by the backend. Keys are set in its .env file and never sent to the browser."
        icon={<KeyRound size={17} />}
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-sev-critical-text">Status unavailable: {error}</p>
      ) : (
        <ul className="divide-y divide-line">
          {Object.entries(data?.keys ?? {}).map(([k, on]) => (
            <li key={k} className="flex items-center gap-3 py-2.5">
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink">{LABELS[k]?.name ?? k}</span>
                <span className="block text-xs text-text-3">{LABELS[k]?.use}</span>
              </span>
              {on ? <Badge tone="positive">Configured</Badge> : <Badge tone="caution">Not set</Badge>}
            </li>
          ))}
          <li className="flex items-center gap-3 py-2.5">
            <span className="flex-1 text-sm text-text-2">Backend mode</span>
            <span className="code text-xs text-ink">{data?.mode} · {data?.online ? "online" : "offline"}</span>
          </li>
        </ul>
      )}
    </Card>
  );
}
