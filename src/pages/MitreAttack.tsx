import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { fetchMitreMatrix, fetchMitreTechnique } from "../services/api";
import type { MitreMatrix, MitreTechnique, MitreTechniqueDetail } from "../services/api";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f43f5e",
};

export default function MitreAttack() {
  const [matrix, setMatrix] = useState<MitreMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MitreTechnique | null>(null);
  const [detail, setDetail] = useState<MitreTechniqueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMitreMatrix()
      .then(setMatrix)
      .catch((err) => setError(err.message));
  }, []);

  const openTechnique = (t: MitreTechnique) => {
    setSelected(t);
    setDetail(null);
    setDetailLoading(true);
    fetchMitreTechnique(t.id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  if (error) {
    return <div className="p-6 text-rose-400 text-sm">Error: {error}</div>;
  }

  if (!matrix) {
    return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  }

  const totalTechniques = matrix.tactics.reduce((sum, t) => sum + t.techniques.length, 0);
  const highSevCount = matrix.tactics.reduce(
    (sum, t) => sum + t.techniques.filter((tech) => tech.severity === "HIGH" || tech.severity === "CRITICAL").length,
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">MITRE ATT&CK Matrix</h1>
        <p className="text-sm text-slate-500">{matrix.coverage} · {matrix.total_mapped.toLocaleString()} indicators mapped</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-glow p-4">
          <p className="text-2xl font-bold text-slate-100">{matrix.tactics.length}</p>
          <p className="text-xs text-slate-500 mt-1">Tactics Covered</p>
        </div>
        <div className="card-glow p-4">
          <p className="text-2xl font-bold text-slate-100">{totalTechniques}</p>
          <p className="text-xs text-slate-500 mt-1">Techniques Mapped</p>
        </div>
        <div className="card-glow p-4">
          <p className="text-2xl font-bold text-rose-400">{highSevCount}</p>
          <p className="text-xs text-slate-500 mt-1">High/Critical Severity</p>
        </div>
        <div className="card-glow p-4">
          <p className="text-2xl font-bold text-slate-100">{matrix.total_mapped.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Indicators</p>
        </div>
      </div>

      {/* Matrix grid — tactic columns */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2">
          {matrix.tactics.map((tactic) => (
            <div key={tactic.id} className="w-64 shrink-0">
              <div className="card-glow p-3 mb-3">
                <p className="text-xs font-mono text-slate-500">{tactic.id}</p>
                <h3 className="text-sm font-semibold text-slate-200">{tactic.name}</h3>
              </div>
              <div className="space-y-2">
                {tactic.techniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => openTechnique(tech)}
                    className="w-full text-left card-glow p-3 hover:border-sky-500/40 transition-colors"
                    style={{ borderLeftColor: SEVERITY_COLOR[tech.severity], borderLeftWidth: 3 }}
                  >
                    <p className="text-xs font-mono text-slate-500 mb-1">{tech.id}</p>
                    <p className="text-sm font-medium text-slate-200 mb-2">{tech.name}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: SEVERITY_COLOR[tech.severity], background: `${SEVERITY_COLOR[tech.severity]}1a` }}
                      >
                        {tech.severity}
                      </span>
                      <span className="text-xs text-slate-500">{tech.our_count.toLocaleString()} hits</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} style={{ color: SEVERITY_COLOR[selected.severity] }} />
              <p className="text-xs font-mono text-slate-500">{selected.id}</p>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-3">{selected.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ color: SEVERITY_COLOR[selected.severity], background: `${SEVERITY_COLOR[selected.severity]}1a` }}
              >
                {selected.severity}
              </span>
              <span className="text-sm text-slate-400">{selected.our_count.toLocaleString()} indicators observed</span>
            </div>
            {detailLoading && <p className="text-sm text-slate-500">Loading description...</p>}
            {!detailLoading && detail?.description && (
              <p className="text-sm text-slate-300 leading-relaxed">{detail.description}</p>
            )}
            {!detailLoading && !detail?.description && (
              <p className="text-sm text-slate-500">No additional description available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}