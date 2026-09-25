import DocsView from "../components/common/DocsView";
import { PageHeader } from "../components/ui";

export default function Docs() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Documentation" description="How GeoShield's data, scores and tools work." />
      <DocsView />
    </div>
  );
}
