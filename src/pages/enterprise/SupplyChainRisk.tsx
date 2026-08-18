import { useEffect, useState } from "react";
import { Package, AlertTriangle, Skull, Search, Info } from "lucide-react";
import { fetchSupplyChainVendors, analyzeSupplyChain } from "../../services/api";
import type { SupplyChainVendor, SupplyChainAnalysis } from "../../services/api";

export default function SupplyChainRisk() {
  const [vendors, setVendors] = useState<SupplyChainVendor[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [analysis, setAnalysis] = useState<SupplyChainAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Supply Chain Risk Mapping</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cross-reference your tech stack against real, actively exploited vulnerabilities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor picker */}
        <div className="card-glow p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Your Tech Stack</h3>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1 mb-3">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-white placeholder-slate-600"
            />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredVendors.map((v) => (
              <label
                key={v.name}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/60 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(v.name)}
                    onChange={() => toggleVendor(v.name)}
                    className="w-3.5 h-3.5 accent-sky-500"
                  />
                  <span className="text-sm text-slate-300">{v.name}</span>
                </span>
                <span className="text-[10px] text-slate-600">{v.cve_count} CVE</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || selected.size === 0}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-sky-500 text-white font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Package size={15} />
            {analyzing ? "Analyzing..." : `Analyze ${selected.size} Vendor${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {error && <div className="card-glow p-4 text-rose-400 text-sm">Error: {error}</div>}

          {!analysis && !error && (
            <div className="card-glow p-12 text-center text-slate-500 text-sm">
              Select vendors from your tech stack and click Analyze to see real exposure
            </div>
          )}

          {analysis && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-glow p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Matched CVEs</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-100">{analysis.matched_cve_count}</p>
                </div>
                <div className="card-glow p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Skull size={16} className="text-rose-400" />
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Ransomware-linked</span>
                  </div>
                  <p className="text-3xl font-bold text-rose-400">{analysis.ransomware_count}</p>
                </div>
              </div>

              {analysis.affected_vendors.length > 0 && (
                <div className="card-glow p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Exposure by Vendor</h3>
                  <div className="space-y-2">
                    {analysis.affected_vendors.map((v: any) => (
                      <div key={v.vendor} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{v.vendor}</span>
                        <span className="text-slate-400">{v.cve_count} CVEs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.matches.length > 0 && (
                <div className="card-glow p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    Recent Exploited Vulnerabilities
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analysis.matches.map((m) => (
                      <div key={m.cve_id} className="bg-slate-800/40 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-sky-400">{m.cve_id}</span>
                          <div className="flex items-center gap-2">
                            {m.ransomware === "Known" && (
                              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                                RANSOMWARE
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">{m.date_added}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-200">{m.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.vendor} · {m.product}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.methodology && (
                <div className="card-glow p-4 flex items-start gap-3">
                  <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500">{analysis.methodology}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}