import { useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { Check, Copy } from "lucide-react";
import { generateResponseAction } from "../../services/api";
import type { ResponseActionResult } from "../../services/api";
import { formatTs } from "../../utils/time";
import { Button, ErrorState, Modal, Skeleton } from "../ui";

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
  bgp_null_route: "BGP null route",
  iptables_note: "iptables (note)",
  cisco_bgp: "Cisco BGP",
  juniper: "Juniper",
  pfsense: "pfSense",
  azure_nsg: "Azure NSG",
  stix: "STIX 2.1",
  taxii_hint: "TAXII hint",
  sigma: "Sigma rule",
  yara: "YARA rule",
};

interface ResponseModalProps {
  action: string;
  target: string;
  reason: string;
  onClose: () => void;
}

/** One-click response: asks the backend to render block rules for a target in each tool's syntax. */
export default function ResponseModal({ action, target, reason, onClose }: ResponseModalProps) {
  const req = useAsync<ResponseActionResult>(() => generateResponseAction(action, target, reason), [action, target, reason]);
  const result = req.loading ? null : req.data;
  const [chosenTab, setTab] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const tab = result ? (chosenTab && chosenTab in result.rules ? chosenTab : Object.keys(result.rules)[0] ?? null) : null;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Modal
      open
      onClose={onClose}
      width={720}
      title="Response rules"
      description={
        <>
          {action.replace(/_/g, " ")} · <span className="code">{target}</span>
        </>
      }
    >
      <div className="px-6 py-5">
        {req.loading && (
          <div className="space-y-3">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-48 rounded-[14px]" />
          </div>
        )}
        {req.error && <ErrorState message={req.error} onRetry={req.reload} />}
        {result && tab && (
          <>
            <div className="flex gap-1 overflow-x-auto pb-3 -mx-1 px-1" role="tablist">
              {Object.keys(result.rules).map((key) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`h-8 px-3 rounded-[9px] text-sm font-semibold whitespace-nowrap interactive ${
                    tab === key ? "bg-ink-2 text-paper" : "text-text-2 hover:bg-sunken hover:text-ink"
                  }`}
                >
                  {RULE_LABELS[key] ?? key}
                </button>
              ))}
            </div>
            <div className="relative">
              <pre className="code text-xs leading-relaxed text-paper bg-ink-2 rounded-[14px] p-4 pr-24 whitespace-pre-wrap break-all max-h-[46vh] overflow-y-auto">
                {result.rules[tab]}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3"
                icon={copied === tab ? <Check size={14} /> : <Copy size={14} />}
                onClick={() => copy(result.rules[tab], tab)}
              >
                {copied === tab ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-text-3 mt-3">
              Generated {formatTs(result.timestamp)}. Review each rule before applying it to production devices.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
