import { formatAsOf } from "../../services/api";
import type { StatusData } from "../../services/api";

export interface DocSection {
  title: string;
  items: { q: string; a: string }[];
}

/** Numbers in the docs come from /api/status so they can't drift from the data. */
export function coreSections(s: StatusData | null): DocSection[] {
  const countries = s?.data.countries ?? "—";
  const indicators = s ? s.data.total_threats.toLocaleString() : "—";
  const asOf = s?.as_of ? formatAsOf(s.as_of) : "the dataset date";
  return [
    {
      title: "Getting started",
      items: [
        {
          q: "What is GeoShield?",
          a: `GeoShield aggregates threat intelligence from 9 sources (CISA KEV, Feodo Tracker, AbuseIPDB, Blocklist.de, Emerging Threats, VirusTotal, GreyNoise, PhishTank, Shodan) into a country-level risk view. The current dataset covers ${countries} countries and ${indicators} indicators, as of ${asOf}.`,
        },
        {
          q: "How current is the data?",
          a: `Country scores and the timeline come from an aggregated dataset dated ${asOf}. IOC lookups query AbuseIPDB and VirusTotal live whenever the backend is online; the status pill in the top bar shows which mode it's in.`,
        },
        {
          q: "How is the risk score calculated?",
          a: "Each country's 0–100 score blends indicator volume relative to the top country, a volume-severity band, cross-source corroboration, the average VirusTotal malicious-engine count and the number of contributing sources. Bands: Low 0–29, Medium 30–44, High 45–64, Critical 65+.",
        },
      ],
    },
    {
      title: "Dashboard and map",
      items: [
        { q: "What does the world map show?", a: "Each monitored country is coloured by its risk score. Click a country for its source breakdown, sample IPs seen there and response actions." },
        { q: "Why do some countries show no colour?", a: `Only the ${countries} countries with indicators from at least one source are scored. An uncoloured country means no data, not "safe".` },
      ],
    },
    {
      title: "IOC lookup",
      items: [
        { q: "Which sources does a lookup use?", a: "Live AbuseIPDB and VirusTotal queries, enriched with local Shodan (exposed ports and CVEs) and GreyNoise (scanner classification) data." },
        { q: "What does “Offline cache” on a result mean?", a: "The backend answered from its local cache instead of querying the vendors, either because it's offline or because both live calls failed (for example on a rate limit)." },
      ],
    },
    {
      title: "Incidents and alerts",
      items: [
        { q: "How does the incident queue work?", a: "Drag a card between New, Assigned, Investigating and Resolved. Each move is saved to the backend and recorded in the incident's activity log." },
        { q: "What is the escalation policy?", a: "Per-severity notification deadlines and a contact email. The policy is stored by the backend; outbound delivery to that contact isn't wired up yet." },
      ],
    },
    {
      title: "AI assistants",
      items: [
        { q: "Where do Copilot's answers come from?", a: "The Analyst Copilot answers offline from the GeoShield dataset using keyword-matched briefings, and shows how well your question matched." },
        { q: "How is the AI Advisor different?", a: "The Enterprise AI Advisor sends your question plus a summary of the live dashboard to Claude when the backend has an Anthropic key, and falls back to the offline answers otherwise. Each answer says which path produced it." },
      ],
    },
  ];
}

