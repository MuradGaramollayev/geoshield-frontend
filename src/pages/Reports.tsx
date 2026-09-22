import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { downloadReport } from "../services/api";
import { useMotion } from "../design/panel";
import { Button, Card, IconTile, PageHeader } from "../components/ui";

const CONTENTS = [
  "Cover and data sources",
  "Executive summary: global risk index, indicator and country counts",
  "Top 20 countries ranked by risk score",
  "Threat distribution by attack type and by source",
  "CISA KEV summary: ransomware-linked CVEs and most-exploited vendors",
  "Recommended actions",
];

export default function Reports() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ name: string; time: string }[]>([]);
  const m = useMotion();

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await downloadReport();
      const now = new Date();
      setHistory((prev) => [
        { name: `GeoShield_Report_${now.toISOString().slice(0, 10).replace(/-/g, "")}.pdf`, time: now.toLocaleString("en-GB") },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Reports" description="Six-page PDF built by the backend from the current dataset each time you generate it." />

      <Card className="mb-[var(--gap-grid)]">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <IconTile size="lg" tone="ink">
                <FileText size={20} />
              </IconTile>
              <div>
                <p className="text-md font-semibold text-ink">Threat intelligence report (PDF)</p>
                <p className="text-sm text-text-3">About 6 pages · generated on demand</p>
              </div>
            </div>
            <ol className="space-y-1.5 mb-5">
              {CONTENTS.map((c, i) => (
                <li key={c} className="flex gap-3 text-sm text-text-2">
                  <span className="num text-text-3 w-4 text-right">{i + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
            {error && (
              <p role="alert" className="text-sm text-sev-critical-text mb-3">
                The report wasn't generated ({error}). Check the backend is running, then try again.
              </p>
            )}
            <Button variant="primary" icon={<Download size={16} />} onClick={generate} loading={generating}>
              {generating ? "Generating PDF" : "Generate and download PDF"}
            </Button>
          </div>
        </div>
      </Card>

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-2 px-1">Generated this session</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <motion.div
                key={`${h.name}-${i}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: m.duration }}
                className="e3 px-4 py-3 flex items-center gap-3"
              >
                <CheckCircle2 size={16} className="text-positive shrink-0" />
                <span className="code text-sm text-ink flex-1 truncate">{h.name}</span>
                <span className="text-xs text-text-3">{h.time}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
