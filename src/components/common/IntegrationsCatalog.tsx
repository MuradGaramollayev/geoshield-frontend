import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Mail, MessageSquare, Radar, ShieldCheck, Siren, Ticket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoutingConfig } from "../../services/api";
import { useMotion } from "../../design/panel";
import { Badge, IconTile } from "../ui";

interface CatalogItem {
  name: string;
  routingName?: string; // matches /api/alerts/routing entries
  desc: string;
  category: string;
  icon: LucideIcon;
}

const CATALOG: CatalogItem[] = [
  { name: "Slack", routingName: "Slack", desc: "Post alerts to a Slack channel", category: "Communication", icon: MessageSquare },
  { name: "PagerDuty", routingName: "PagerDuty", desc: "Page on-call engineers for critical incidents", category: "Incident response", icon: Siren },
  { name: "Jira", routingName: "Jira", desc: "Open tickets from incidents", category: "Ticketing", icon: Ticket },
  { name: "Email (SMTP)", routingName: "Email (SMTP)", desc: "Send alert digests to a mailbox", category: "Communication", icon: Mail },
  { name: "Splunk", desc: "Forward threat indicators to your SIEM", category: "SIEM", icon: Database },
  { name: "Microsoft Sentinel", desc: "Sync incidents with a Sentinel workspace", category: "SIEM", icon: ShieldCheck },
  { name: "CrowdStrike Falcon", desc: "Cross-reference IOCs with endpoint telemetry", category: "EDR", icon: Radar },
];

/**
 * Integration catalogue with honest states: routing preferences come from
 * /api/alerts/routing; connectors without a backend are marked Planned.
 */
export default function IntegrationsCatalog({ routing, alertsPath }: { routing: RoutingConfig | null; alertsPath: string }) {
  const m = useMotion();
  const byName = new Map(routing?.integrations.map((r) => [r.name, r]) ?? []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--gap-grid)]">
      {CATALOG.map((item, i) => {
        const route = item.routingName ? byName.get(item.routingName) : undefined;
        const Icon = item.icon;
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: m.enter, delay: i * m.stagger, ease: m.ease }}
            className="e2 interactive p-[var(--pad-card)] flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <IconTile>
                <Icon size={18} />
              </IconTile>
              {item.routingName ? (
                route?.connected ? <Badge tone="positive">Routing on</Badge> : <Badge>Routing off</Badge>
              ) : (
                <Badge tone="caution">Planned</Badge>
              )}
            </div>
            <p className="text-md font-semibold text-ink">{item.name}</p>
            <p className="text-sm text-text-3 mb-1">{item.category}</p>
            <p className="text-sm text-text-2 mb-5">{item.desc}</p>
            <div className="mt-auto">
              {item.routingName ? (
                <Link to={alertsPath} className="text-sm font-semibold text-accent-ink hover:underline">
                  Manage routing in Alert Center
                </Link>
              ) : (
                <span className="text-sm text-text-3">Connector not built yet</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
