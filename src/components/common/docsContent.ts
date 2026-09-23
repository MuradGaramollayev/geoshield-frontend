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
        { q: "What does the risk map show?", a: "Every country is drawn as a grid of hexagons, coloured on a continuous scale from its risk score. Hover for the score, the dominant attack vector and the trend; click for the full country profile and response actions." },
        { q: "Why are some countries grey?", a: `Only the ${countries} countries with indicators from at least one source are scored. Grey means no data, not "safe" — a country with no coverage is deliberately shown differently from a low-risk one.` },
        { q: "What is the Threat flow overlay?", a: "Arcs between two countries that share real infrastructure: abusive addresses registered to the same network operator, or command-and-control servers of the same malware family. Pairs with nothing in common are not drawn." },
      ],
    },
    {
      title: "IOC lookup",
      items: [
        { q: "Which sources does a lookup use?", a: "Live AbuseIPDB and VirusTotal queries, enriched with local Shodan (exposed ports and CVEs) and GreyNoise (scanner classification) data." },
        { q: "What do the source labels on a result mean?", a: "Each source says where its numbers came from: a live vendor call, a genuine cached response, the last genuine response when the vendor is unreachable, or no data at all. Nothing is ever synthesised to fill a gap — a rate-limited lookup with nothing cached reports “data unavailable”." },
        { q: "Why does the landing page demo sometimes say data unavailable?", a: "The public demo budgets how many live vendor calls it may make, so visitors cannot spend the free-tier quota. Cached addresses always resolve; an uncached address with no budget left honestly reports that there is nothing to show." },
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
      title: "Analysis modules",
      items: [
        { q: "What is peer benchmarking?", a: `A country is compared with the other countries carrying a similar volume of indicators, not with a world average. Countries are split into four bands by indicator volume, and the page reports the percentile, rank and gap to the peer median, plus the indicator mix against peer medians.` },
        { q: "What does infrastructure correlation show?", a: "Network operators whose listed addresses appear in several countries, with their reach and how concentrated they are, and malware families whose C2 servers cross borders. Every row can be opened down to the individual listed addresses." },
        { q: "How do alert rules work?", a: "A rule is a threshold on a real per-country field. It is re-evaluated against the current dataset every time the page loads, and a firing rule names the countries that match and the value that made each one match. Rules are configuration only; nothing sends a notification yet." },
        { q: "What goes into the audit trail?", a: "Reports generated, incidents raised, block rules exported, alert rules changed, escalation and routing edited. Entries are appended after the action succeeds and are never edited or removed, so an empty trail means nothing has been done yet." },
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

