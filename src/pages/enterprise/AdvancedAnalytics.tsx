import AttackHeatmap from "../../components/enterprise/AttackHeatmap";
import AttackCategoryRadar from "../../components/enterprise/AttackCategoryRadar";
import ThreatFlowSankey from "../../components/enterprise/ThreatFlowSankey";
import ResponseEfficiencyPanel from "../../components/enterprise/ResponseEfficiencyPanel";
import RiskScoreNote from "../../components/common/RiskScoreNote";
import { PageHeader } from "../../components/ui";

export default function AdvancedAnalytics() {
  return (
    <div className="space-y-[var(--gap-grid)]">
      <PageHeader title="Advanced Analytics" description="Patterns behind the headline numbers: when activity lands, what's changing, and how the team is responding." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--gap-grid)]">
        <AttackHeatmap />
        <AttackCategoryRadar />
      </div>
      <ThreatFlowSankey />
      <ResponseEfficiencyPanel />
      <RiskScoreNote />
    </div>
  );
}
