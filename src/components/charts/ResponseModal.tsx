import { useEffect, useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { generateResponseAction } from "../../services/api";
import type { ResponseActionResult } from "../../services/api";

interface ResponseModalProps {
  action: string;
  target: string;
  reason: string;
  onClose: () => void;
}

const RULE_LABELS: Record<string, string> = {
  iptables: "iptables",
  pf: "pf (BSD)",
  windows: "Windows Firewall",
  cisco_acl: "Cisco ACL",
  aws_sg: "AWS Security Group",
  iptables_ipset: "iptables + ipset",
  nginx: "Nginx",
  cloudflare_rule: "Cloudflare",
  apache: "Apache",
  bgp_null_route: "BGP Null Route",
  iptables_note: "iptables (note)",
  cisco_bgp: "Cisco BGP",
  juniper: "Juniper",
  pfsense: "pfSense",
  azure_nsg: "Azure NSG",
  stix: "STIX 2.1",
  taxii_hint: "TAXII Hint",
  sigma: "Sigma Rule",
  yara: "YARA Rule",
};

export default function ResponseModal({ action, target, reason, onClose }: ResponseModalProps) {
  const [result, setResult] = useState<ResponseActionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    generateResponseAction(action, target, reason)
      .then((res) => {
        setResult(res);
        const keys = Object.keys(res.rules);
        if (keys.length > 0) setActiveTab(keys[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [action, target, reason]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100">One-Click Response</h2>
            <p className="text-sm text-slate-500">
              {action.replace(/_/g, " ")} · <span className="font-mono">{target}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 size={16} className="animate-spin" /> Generating rules...
          </div>
        )}

        {error && (
          <div className="p-6 text-rose-400 text-sm">Error: {error}</div>
        )}

        {result && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 overflow-x-auto">
              {Object.keys(result.rules).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`text-xs font-medium px-3 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === key
                      ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {RULE_LABELS[key] || key}
                </button>
              ))}
            </div>

            {/* Active tab content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {activeTab && (
                <div className="relative">
                  <button
                    onClick={() => handleCopy(result.rules[activeTab], activeTab)}
                    className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-1 transition-colors"
                  >
                    {copied === activeTab ? (
                      <><Check size={12} className="text-emerald-400" /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                  <pre className="bg-black/40 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                    {result.rules[activeTab]}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-5 pb-4 text-xs text-slate-600">
              Generated at {new Date(result.timestamp.replace(/([+-]\d{2}:\d{2})Z$/, "$1")).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}