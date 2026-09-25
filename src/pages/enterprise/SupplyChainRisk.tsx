import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bug, Package, Skull } from "lucide-react";
import { analyzeSupplyChain, fetchSupplyChainVendors } from "../../services/api";
import type { SupplyChainAnalysis, SupplyChainVendor } from "../../services/api";
import { useTheme } from "../../design/themeContext";
import { useMotion } from "../../design/panel";
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, MeterRow, MethodologyNote, PageHeader, SearchField, Skeleton, StatTile,
} from "../../components/ui";

export default function SupplyChainRisk() {
  const th = useTheme();
  const [vendors, setVendors] = useState<SupplyChainVendor[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [analysis, setAnalysis] = useState<SupplyChainAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const m = useMotion();

  useEffect(() => {
    fetchSupplyChainVendors()
      .then((d) => setVendors(d.vendors))
      .catch((err) => setError(err.message));
  }, []);

  const toggleVendor = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (selected.size === 0) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeSupplyChain(Array.from(selected));
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredVendors = (vendors ?? []).filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
  const maxVendor = Math.max(1, ...(analysis?.affected_vendors.map((v) => v.cve_count) ?? [1]));

  return (
    <div>
      <PageHeader
        title="Supply Chain Risk"
        description="Pick the vendors in your technology stack to see which of their vulnerabilities attackers are actively exploiting today."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--gap-grid)] items-start">
        <Card className="lg:sticky lg:top-0">
          <CardHeader
            title="Your technology stack"
            description={selected.size ? `${selected.size} selected` : "Select one or more vendors"}
            actions={selected.size ? <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button> : undefined}
          />
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a vendor" aria-label="Find a vendor" className="mb-3" />
          <div className="max-h-[380px] overflow-y-auto -mx-2 px-2 space-y-0.5">
            {vendors === null && !error
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9" />)
              : filteredVendors.map((v) => (
                  <label
                    key={v.name}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-[10px] cursor-pointer interactive ${
                      selected.has(v.name) ? "bg-paper shadow-[var(--shadow-e3)]" : "hover:bg-sunken"
                    }`}
                  >
                    <input type="checkbox" className="check" checked={selected.has(v.name)} onChange={() => toggleVendor(v.name)} />
                    <span className="flex-1 text-base text-ink truncate">{v.name}</span>
                    <span className="num text-xs text-text-3">{v.cve_count} CVEs</span>
                  </label>
                ))}
          </div>
          <Button variant="primary" className="w-full mt-4" icon={<Package size={16} />} loading={analyzing} disabled={selected.size === 0} onClick={handleAnalyze}>
            {selected.size === 0 ? "Select vendors to analyse" : `Analyse ${selected.size} vendor${selected.size !== 1 ? "s" : ""}`}
          </Button>
        </Card>

        <div className="lg:col-span-2 space-y-[var(--gap-grid)]">
          {error && <ErrorState message={error} />}

          {!analysis && !error && (
            <Card>
              <EmptyState
                icon={<Package size={20} />}
                title="See your real exposure"
                description="Choose the vendors you run, then analyse. Results come straight from CISA's Known Exploited Vulnerabilities catalogue."
              />
            </Card>
          )}

          {analysis && (
            <>
              <div className="grid grid-cols-2 gap-[var(--gap-grid)]">
                <StatTile icon={<Bug size={18} />} label="Actively exploited CVEs" value={analysis.matched_cve_count} />
                <StatTile
                  icon={<Skull size={18} />}
                  label="Linked to ransomware"
                  value={analysis.ransomware_count}
                  valueTone={analysis.ransomware_count > 0 ? th.sev.CRITICAL.text : undefined}
                  delay={0.07}
                />
              </div>

              {analysis.affected_vendors.length > 0 && (
                <Card>
                  <CardHeader title="Exposure by vendor" />
                  <div className="space-y-3">
                    {analysis.affected_vendors.map((v) => (
                      <MeterRow key={v.vendor} label={v.vendor} value={v.cve_count} max={maxVendor} right={`${v.cve_count} CVEs`} />
                    ))}
                  </div>
                </Card>
              )}

              {analysis.matches.length > 0 && (
                <Card pad="none">
                  <div className="px-[var(--pad-card)] pt-[var(--pad-card)]">
                    <CardHeader title="Exploited vulnerabilities in your stack" description={`${analysis.matches.length} listed, newest first`} />
                  </div>
                  <ul className="divide-y divide-line max-h-[480px] overflow-y-auto">
                    {analysis.matches.map((cve, i) => (
                      <motion.li
                        key={cve.cve_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: m.duration, delay: Math.min(i, 12) * 0.03 }}
                        className="px-[var(--pad-card)] py-4"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <a
                            href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="code text-sm font-semibold text-accent-ink hover:underline"
                          >
                            {cve.cve_id}
                          </a>
                          {cve.ransomware === "Known" && <Badge tone="ink">Ransomware</Badge>}
                          <span className="ml-auto text-sm text-text-3">Added <span className="num">{cve.date_added}</span></span>
                        </div>
                        <p className="text-base text-ink">{cve.name}</p>
                        <p className="text-sm text-text-3 mt-0.5">{cve.vendor} · {cve.product}{cve.due_date ? ` · CISA remediation due ${cve.due_date}` : ""}</p>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}

              {analysis.methodology && (
                <MethodologyNote>
                  <p>{analysis.methodology}</p>
                </MethodologyNote>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
