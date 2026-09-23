import { fetchRouting } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import IntegrationsCatalog from "../../components/common/IntegrationsCatalog";
import { Card, ErrorState, PageHeader, SegmentGauge, SkeletonCard } from "../../components/ui";
import { useTheme } from "../../design/themeContext";

export default function EnterpriseIntegrations() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(fetchRouting, []);
  const on = data?.integrations.filter((i) => i.connected).length ?? 0;
  const total = data?.integrations.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="How far GeoShield alerts reach into your existing tools, and what's on the roadmap."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonCard lines={2} className="mb-[var(--gap-grid)]" />
      ) : (
        <Card className="mb-[var(--gap-grid)]">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <SegmentGauge
              size={220}
              segments={[
                { value: on, color: th.c.accent, label: "Routing on" },
                { value: Math.max(total - on, 0), color: th.c.accent200, label: "Routing off" },
              ]}
              center={
                <>
                  {on}
                  <span className="text-text-3 text-xl"> / {total}</span>
                </>
              }
              caption="channels routed"
            />
            <div className="max-w-[60ch]">
              <p className="text-xl font-semibold text-ink tracking-[-0.01em] mb-2">Routing coverage</p>
              <p className="text-base text-text-2">
                {on} of {total} alert channels have routing turned on. The preference is stored today; automatic
                delivery to these channels and the SIEM and EDR connectors below are planned.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && <IntegrationsCatalog routing={data} alertsPath="/enterprise/alerts" />}
    </div>
  );
}
