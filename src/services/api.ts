export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Short-lived in-memory cache for read-only GETs that several components
// request on the same screen (status, countries, timeline, MITRE matrix).
// Mutating endpoints are never cached.
const GET_TTL_MS = 60_000;
const getCache = new Map<string, { at: number; promise: Promise<unknown> }>();

async function cachedGet<T>(path: string, ttl = GET_TTL_MS): Promise<T> {
  const hit = getCache.get(path);
  if (hit && Date.now() - hit.at < ttl) return hit.promise as Promise<T>;
  const promise = fetch(`${BASE_URL}${path}`).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
  });
  getCache.set(path, { at: Date.now(), promise });
  promise.catch(() => getCache.delete(path));
  return promise;
}

export interface StatusData {
  mode: string;
  online: boolean;
  keys: Record<string, boolean>;
  data: {
    countries: number;
    total_threats: number;
    avg_risk: number;
    critical: number;
    high: number;
    sources: number;
  };
  /** Reference date of the aggregated dataset (YYYY-MM-DD). */
  as_of?: string;
}

export interface TimelineEvent {
  date: string;
  type: string;
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  vendor: string;
  product: string;
  ransomware: boolean;
}

export interface TimelineData {
  country: string;
  days: number;
  count: number;
  events: TimelineEvent[];
  /** Reference date the backend measures the window from (YYYY-MM-DD). */
  as_of?: string;
}

export async function fetchStatus(): Promise<StatusData> {
  return cachedGet<StatusData>("/api/status");
}

export async function fetchTimeline(days: number = 14): Promise<TimelineData> {
  return cachedGet<TimelineData>(`/api/timeline?days=${days}`);
}

/**
 * Buckets events per day into a fixed-length series (oldest first).
 * `anchor` is the dataset's as-of date from the API; the window counts back
 * from it rather than from the browser clock, so a static dataset never
 * renders as an empty series.
 */
export function buildSparkline(
  events: TimelineEvent[],
  days: number,
  filterFn?: (e: TimelineEvent) => boolean,
  anchor?: string
): { date: string; value: number }[] {
  const filtered = filterFn ? events.filter(filterFn) : events;
  const counts: Record<string, number> = {};

  for (const e of filtered) {
    counts[e.date] = (counts[e.date] || 0) + 1;
  }

  const end = anchor ? new Date(`${anchor}T00:00:00Z`) : new Date();
  const result: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, value: counts[key] || 0 });
  }
  return result;
}

/** "14 Jul 2026" style label for an as-of date. */
export function formatAsOf(asOf?: string): string {
  if (!asOf) return "";
  const d = new Date(`${asOf}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
/** Direction of a country's risk score, measured from daily snapshots. */
export type TrendDirection = "up" | "down" | "stable" | "insufficient";

export interface CountryRisk {
  code: string;
  name: string;
  total_threats: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Derived from the country's own source breakdown (backend vectors.py). */
  primary_attack: string;
  primary_attack_source: string | null;
  primary_attack_share: number;
  primary_attack_basis: string;
  trend: TrendDirection;
  /** Points of risk score gained or lost across the recorded window. */
  trend_change: number;
  /** How many daily snapshots the trend rests on. */
  trend_days: number;
}

export interface CountriesData {
  count: number;
  countries: CountryRisk[];
  trend_days: number;
}

export async function fetchCountries(): Promise<CountriesData> {
  return cachedGet<CountriesData>("/api/countries");
}
/** A correlation between two countries, from shared hosting or shared malware family. */
export interface ThreatFlowLink {
  source: string;
  target: string;
  kind: "hosting" | "malware";
  weight: number;
  shared: string[];
  detail: string;
}

export async function fetchThreatFlows(limit = 40): Promise<{ count: number; links: ThreatFlowLink[]; methodology: string }> {
  return cachedGet(`/api/threat-flows?limit=${limit}`);
}

export interface CountryDetail {
  code: string;
  name: string;
  total_threats: number;
  risk_score: number;
  risk_level: string;
  primary_attack: string;
  primary_attack_source: string | null;
  primary_attack_share: number;
  primary_attack_basis: string;
  trend: TrendDirection;
  trend_change: number;
  trend_days: number;
  score_history: { date: string; risk_score: number }[];
  source_count: number;
  sources: Record<string, number>;
  top_ips: { ip: string; city: string; isp: string }[];
}

export async function fetchCountryDetail(code: string): Promise<CountryDetail> {
  const res = await fetch(`${BASE_URL}/api/countries/${code}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface AbuseIPDBData {
  score?: number;
  country?: string;
  isp?: string;
  domain?: string;
  usageType?: string;
  totalReports?: number;
  lastReported?: string;
  categories?: string[];
}

export interface VirusTotalData {
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  reputation?: number;
  as_owner?: string;
  network?: string;
}

export interface ShodanData {
  country?: string;
  city?: string;
  org?: string;
  os?: string;
  ports?: string[];
  port_count?: number;
  vuln_count?: number;
  cves?: string[];
  last_update?: string;
}

export interface GreyNoiseData {
  classification?: string;
  name?: string;
  noise?: boolean;
  riot?: boolean;
  last_seen?: string;
  link?: string;
}

/** Where one source's numbers came from. Nothing is ever synthesised. */
export type SourceOrigin =
  | "live"            // fetched from the vendor just now
  | "cached"          // genuine earlier response, inside the cache TTL
  | "cached_stale"    // vendor unreachable now; last genuine response shown
  | "local_dataset"   // from the bundled Shodan / GreyNoise data
  | "rate_limited"
  | "auth_error"
  | "not_found"
  | "no_key"
  | "offline"
  | "quota_guard"     // public demo budget: no vendor was contacted
  | "error";

export interface SourceStatus {
  source: SourceOrigin;
  fetched_at?: string;
  age_hours?: number;
  detail?: string;
}

/** How much of the public demo's live-call budget is left. */
export interface PublicLimit {
  allow_request: boolean;
  allow_live: boolean;
  live_remaining_today: number;
  live_remaining_for_you: number;
  requests_remaining_for_you: number;
  reason: string;
}

export interface IocLookupResult {
  ip: string;
  /** live = at least one vendor answered now; cache = shown from cache; unavailable = no vendor data. */
  mode: "live" | "cache" | "unavailable";
  found?: boolean;
  message?: string;
  rate_limited?: boolean;
  sources: Record<string, SourceStatus>;
  abuseipdb: AbuseIPDBData;
  virustotal: VirusTotalData;
  shodan?: ShodanData;
  greynoise?: GreyNoiseData;
  risk_level: string;
  recommendation: string;
  /** Present only on the public (landing page) endpoint. */
  public_limit?: PublicLimit;
}

export async function lookupIoc(ip: string, refresh = false): Promise<IocLookupResult> {
  const res = await fetch(`${BASE_URL}/api/ioc/lookup?ip=${encodeURIComponent(ip)}${refresh ? "&refresh=true" : ""}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface IocCacheEntry {
  ip: string;
  vendors: string[];
  fetched_at: string | null;
  age_hours: number | null;
}

/** Which IPs have genuine cached vendor responses (used for demo preparation). */
/**
 * The landing page's lookup. Same data as lookupIoc, but the backend budgets
 * how many live vendor calls public traffic may spend, so a visitor cannot
 * drain the quota the live demo depends on. A refusal still returns a body:
 * it is an honest "no data", not an error to hide.
 */
export async function lookupIocPublic(ip: string): Promise<IocLookupResult> {
  const res = await fetch(`${BASE_URL}/api/ioc/public-lookup?ip=${encodeURIComponent(ip)}`);
  if (!res.ok && res.status !== 429) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchIocCache(): Promise<{ count: number; ttl_hours: number; entries: IocCacheEntry[] }> {
  const res = await fetch(`${BASE_URL}/api/ioc/cache/list`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface MitreTechnique {
  id: string;
  name: string;
  our_count: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface MitreTactic {
  id: string;
  name: string;
  techniques: MitreTechnique[];
}

export interface MitreMatrix {
  tactics: MitreTactic[];
  total_mapped: number;
  coverage: string;
  mode: string;
}

export async function fetchMitreMatrix(): Promise<MitreMatrix> {
  return cachedGet<MitreMatrix>("/api/mitre/matrix");
}

export interface MitreTechniqueDetail {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

export async function fetchMitreTechnique(id: string): Promise<MitreTechniqueDetail> {
  const res = await fetch(`${BASE_URL}/api/mitre/technique/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface IncidentNote {
  timestamp: string;
  author: string;
  text: string;
}

export interface IncidentTimelineEntry {
  time: string;
  event: string;
}

export interface Incident {
  id: string;
  title: string;
  status: "NEW" | "ASSIGNED" | "INVESTIGATING" | "RESOLVED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee: string;
  source_ip: string;
  source_country: string;
  attack_type: string;
  created_at: string;
  updated_at: string;
  notes: IncidentNote[];
  evidence: string[];
  timeline: IncidentTimelineEntry[];
  resolution: string | null;
}

export interface IncidentsData {
  count: number;
  incidents: Incident[];
}

export async function fetchIncidents(): Promise<IncidentsData> {
  const res = await fetch(`${BASE_URL}/api/incidents`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createIncident(body: {
  title: string;
  severity: Incident["severity"];
  source_ip?: string | null;
  source_country?: string | null;
  attack_type?: string | null;
  assignee?: string;
  evidence?: string[];
}): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateIncident(
  id: string,
  updates: Partial<Pick<Incident, "status" | "assignee" | "resolution">> & { note?: string }
): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface ResponseActionResult {
  action: string;
  target: string;
  reason: string;
  rules: Record<string, string>;
  timestamp: string;
  status: string;
}

export async function generateResponseAction(
  action: string,
  target: string,
  reason: string
): Promise<ResponseActionResult> {
  const res = await fetch(`${BASE_URL}/api/response/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, target, reason }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface EscalationPolicy {
  configured: boolean;
  critical_notify_minutes: number | null;
  high_notify_minutes: number | null;
  notify_email: string | null;
  updated_at: string | null;
}

export interface RoutingIntegration {
  name: string;
  connected: boolean;
  endpoint: string | null;
}

export interface RoutingConfig {
  integrations: RoutingIntegration[];
  updated_at: string | null;
}

export async function fetchEscalation(): Promise<EscalationPolicy> {
  const res = await fetch(`${BASE_URL}/api/alerts/escalation`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateEscalation(
  updates: Partial<Pick<EscalationPolicy, "critical_notify_minutes" | "high_notify_minutes" | "notify_email">>
): Promise<EscalationPolicy> {
  const res = await fetch(`${BASE_URL}/api/alerts/escalation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchRouting(): Promise<RoutingConfig> {
  const res = await fetch(`${BASE_URL}/api/alerts/routing`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function toggleRouting(name: string, connected: boolean): Promise<RoutingConfig> {
  const res = await fetch(`${BASE_URL}/api/alerts/routing`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, connected }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface CopilotResponse {
  answer: string;
  mode: string;
  confidence: number;
}

export async function askCopilot(question: string, forceOffline: boolean = true): Promise<CopilotResponse> {
  const res = await fetch(`${BASE_URL}/api/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, force_offline: forceOffline }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchCopilotSuggestions(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/copilot/suggestions`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.suggestions;
}
export async function downloadReport(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/report/generate?format=pdf`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const disposition = res.headers.get("content-disposition");
  const match = disposition?.match(/filename="(.+)"/);
  a.download = match ? match[1] : "GeoShield_Report.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
// ── Enterprise-specific derived metrics (computed from real Incident data) ──
export function computeMeanResponseMinutes(incidents: Incident[]): number | null {
  const resolved = incidents.filter(
    (i) => i.status !== "NEW" && i.updated_at && i.created_at
  );
  if (resolved.length === 0) return null;

  const clean = (ts: string) => ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1");
  const diffs = resolved
    .map((i) => {
      const start = new Date(clean(i.created_at)).getTime();
      const end = new Date(clean(i.updated_at)).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return null;
      return (end - start) / 60000; // minutes
    })
    .filter((v): v is number => v !== null);

  if (diffs.length === 0) return null;
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  return Math.round(avg);
}

export function computeCriticalHighRatio(incidents: Incident[]): number {
  if (incidents.length === 0) return 0;
  const criticalHigh = incidents.filter(
    (i) => i.severity === "CRITICAL" || i.severity === "HIGH"
  ).length;
  return Math.round((criticalHigh / incidents.length) * 100);
}
// ── Enterprise Advanced Analytics helpers (all derived from real data) ──

export interface HeatmapCell {
  week: number; // 0 = most recent week
  day: number;  // 0 = Sunday .. 6 = Saturday
  count: number;
}

export function buildHeatmapData(events: TimelineEvent[], weeks: number = 4, anchor?: string): HeatmapCell[] {
  const today = anchor ? new Date(`${anchor}T23:59:59Z`) : new Date();
  const cells: HeatmapCell[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) cells.push({ week: w, day: d, count: 0 });
  }
  const cellIndex = (w: number, d: number) => w * 7 + d;

  for (const e of events) {
    const eventDate = new Date(e.date);
    if (isNaN(eventDate.getTime())) continue;
    const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / 86400000);
    const week = Math.floor(diffDays / 7);
    if (week < 0 || week >= weeks) continue;
    const day = eventDate.getUTCDay(); // dates are UTC "YYYY-MM-DD"
    cells[cellIndex(week, day)].count += 1;
  }
  return cells;
}

export interface RadarCategory {
  category: string;
  thisWeek: number;
  lastWeek: number;
}

export function buildRadarData(events: TimelineEvent[], anchor?: string): RadarCategory[] {
  const today = anchor ? new Date(`${anchor}T23:59:59Z`) : new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 86400000);

  const categories: Record<string, { thisWeek: number; lastWeek: number }> = {
    "CVE Exploit": { thisWeek: 0, lastWeek: 0 },
    "C2 Activity": { thisWeek: 0, lastWeek: 0 },
    "Critical Sev.": { thisWeek: 0, lastWeek: 0 },
    "High Sev.": { thisWeek: 0, lastWeek: 0 },
    "Ransomware": { thisWeek: 0, lastWeek: 0 },
  };

  for (const e of events) {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) continue;
    const isThisWeek = d >= oneWeekAgo && d <= today;
    const isLastWeek = d >= twoWeeksAgo && d < oneWeekAgo;
    if (!isThisWeek && !isLastWeek) continue;
    const key = isThisWeek ? "thisWeek" : "lastWeek";

    if (e.type === "CVE_EXPLOIT") categories["CVE Exploit"][key] += 1;
    if (e.type === "C2") categories["C2 Activity"][key] += 1;
    if (e.severity === "CRITICAL") categories["Critical Sev."][key] += 1;
    if (e.severity === "HIGH") categories["High Sev."][key] += 1;
    if (e.ransomware) categories["Ransomware"][key] += 1;
  }

  return Object.entries(categories).map(([category, v]) => ({ category, ...v }));
}
export interface ReportSchedule {
  configured: boolean;
  frequency: string | null;
  email: string | null;
  next_run: string | null;
  delivery_active: boolean;
  updated_at: string | null;
}

export async function fetchReportSchedule(): Promise<ReportSchedule> {
  const res = await fetch(`${BASE_URL}/api/reports/schedule`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateReportSchedule(
  updates: Partial<Pick<ReportSchedule, "frequency" | "email">>
): Promise<ReportSchedule> {
  const res = await fetch(`${BASE_URL}/api/reports/schedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  invited_at: string;
  status: string;
}

export async function fetchTeam(): Promise<{ count: number; members: TeamMember[] }> {
  const res = await fetch(`${BASE_URL}/api/team`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function addTeamMember(name: string, email: string, role: string): Promise<TeamMember> {
  const res = await fetch(`${BASE_URL}/api/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, role }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function removeTeamMember(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/team/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
export async function askCopilotWithRole(
  question: string,
  forceOffline: boolean,
  role: "analyst" | "executive"
): Promise<CopilotResponse> {
  const res = await fetch(`${BASE_URL}/api/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, force_offline: forceOffline, role }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchCopilotSuggestionsWithRole(role: "analyst" | "executive"): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/copilot/suggestions?role=${role}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.suggestions;
}
export interface DefenseStats {
  total_detected: number;
  layer1_blocked: number;
  layer2_escalated: number;
  honeypot_routed: number;
  quarantine_routed: number;
  top_honeypot_countries: { name: string; code: string; risk_score: number; source_count: number }[];
  methodology: string;
}

export async function fetchDefenseStats(): Promise<DefenseStats> {
  const res = await fetch(`${BASE_URL}/api/defense/architecture-stats`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface DefenseClassification {
  ip: string;
  classification: "HONEYPOT" | "QUARANTINE" | "MONITORING";
  risk_score: number;
  source_hits: number;
  log_entry: { log_id: string; ip: string; timestamp: string; risk_score: number; source_count: number; reason: string } | null;
}

export async function classifyIp(ip: string): Promise<DefenseClassification> {
  const res = await fetch(`${BASE_URL}/api/defense/classify-ip/${encodeURIComponent(ip)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface DefenseLogEntry {
  log_id: string;
  ip: string;
  timestamp: string;
  risk_score: number;
  source_count: number;
  reason: string;
}

export async function fetchHoneypotActivity(): Promise<{ count: number; entries: DefenseLogEntry[] }> {
  const res = await fetch(`${BASE_URL}/api/defense/honeypot-activity`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchQuarantineActivity(): Promise<{ count: number; entries: DefenseLogEntry[] }> {
  const res = await fetch(`${BASE_URL}/api/defense/quarantine-activity`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface ForecastHistoryPoint {
  date: string;
  count: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResult {
  history: ForecastHistoryPoint[];
  forecast: ForecastPoint[];
  trend: "up" | "down" | "stable";
  slope_per_day: number;
  expected_change_percent: number;
  low_data_warning: boolean;
  methodology: string;
  scope: string;
  country_name?: string;
}

export async function fetchGlobalForecast(): Promise<ForecastResult> {
  const res = await fetch(`${BASE_URL}/api/forecast/global`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchCountryForecast(code: string): Promise<ForecastResult> {
  const res = await fetch(`${BASE_URL}/api/forecast/country/${code}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
export interface SupplyChainVendor {
  name: string;
  cve_count: number;
}

export async function fetchSupplyChainVendors(): Promise<{ count: number; vendors: SupplyChainVendor[] }> {
  const res = await fetch(`${BASE_URL}/api/supply-chain/vendors`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface SupplyChainMatch {
  cve_id: string;
  vendor: string;
  product: string;
  name: string;
  date_added: string;
  ransomware: string;
  due_date: string;
}

export interface SupplyChainAnalysis {
  matched_cve_count: number;
  ransomware_count: number;
  affected_vendors: { vendor: string; cve_count: number }[];
  matches: SupplyChainMatch[];
  methodology?: string;
}

export async function analyzeSupplyChain(vendors: string[]): Promise<SupplyChainAnalysis> {
  const res = await fetch(`${BASE_URL}/api/supply-chain/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendors }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}