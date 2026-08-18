import AttackHeatmap from "../../components/enterprise/AttackHeatmap";
import AttackCategoryRadar from "../../components/enterprise/AttackCategoryRadar";
import ThreatFlowSankey from "../../components/enterprise/ThreatFlowSankey";
import ResponseEfficiencyPanel from "../../components/enterprise/ResponseEfficiencyPanel";

export default function AdvancedAnalytics() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Advanced Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Deep operational metrics for security leadership
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttackHeatmap />
        <AttackCategoryRadar />
      </div>

      <ThreatFlowSankey />

      <ResponseEfficiencyPanel />
    </div>
  );
}