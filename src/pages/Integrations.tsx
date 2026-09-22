import { fetchRouting } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import IntegrationsCatalog from "../components/common/IntegrationsCatalog";
import { ErrorState, PageHeader, SkeletonCard } from "../components/ui";

export default function Integrations() {
  const { data, error, loading, reload } = useAsync(fetchRouting, []);
  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Where GeoShield alerts can go. Routing preferences are saved today; outbound delivery and SIEM/EDR connectors are on the roadmap."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--gap-grid)]">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : (
        <IntegrationsCatalog routing={data} alertsPath="/analyst/alerts" />
      )}
    </div>
  );
}
