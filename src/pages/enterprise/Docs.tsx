import DocsView from "../../components/common/DocsView";
import type { DocSection } from "../../components/common/docsContent";
import { PageHeader } from "../../components/ui";

const EXECUTIVE: DocSection[] = [
  {
    title: "For security leadership",
    items: [
      {
        q: "How should I present GeoShield data to the board?",
        a: "Lead with the Global Risk Index and where it sits in its band, then the few countries driving it and your mean response time. Keep raw indicator counts as backup, and frame findings as business exposure rather than technical detail.",
      },
      {
        q: "What does the Global Risk Index measure?",
        a: "The average of all country risk scores, weighted by each country's indicator volume, so high-volume countries count for more. It moves when the underlying dataset is refreshed, not minute by minute.",
      },
      {
        q: "How is this different from a SIEM dashboard?",
        a: "A SIEM shows your own logs. GeoShield shows external, cross-source threat intelligence by country and vendor, for strategic prioritisation. Operational triage lives in the Analyst panel.",
      },
    ],
  },
];

export default function EnterpriseDocs() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Documentation" description="Guides for security leadership, plus how the platform's numbers are produced." />
      <DocsView extra={EXECUTIVE} />
    </div>
  );
}
