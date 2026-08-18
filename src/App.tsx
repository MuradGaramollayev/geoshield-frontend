import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import CopilotPanel from "./components/common/CopilotPanel";
import EnterpriseSidebar from "./components/enterprise/EnterpriseSidebar";
import EnterpriseTopbar from "./components/enterprise/EnterpriseTopbar";
import EnterpriseAdvisorPanel from "./components/enterprise/EnterpriseAdvisorPanel";
import Dashboard from "./pages/Dashboard";
import IocExplorer from "./pages/IocExplorer";
import MitreAttack from "./pages/MitreAttack";
import ThreatTimeline from "./pages/ThreatTimeline";
import Incidents from "./pages/Incidents";
import AlertCenter from "./pages/AlertCenter";
import ThreatExplorer from "./pages/ThreatExplorer";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Docs from "./pages/Docs";
import Analytics from "./pages/Analytics";
import EnterpriseDashboard from "./pages/enterprise/Dashboard";
import AdvancedAnalytics from "./pages/enterprise/AdvancedAnalytics";
import EnterpriseReports from "./pages/enterprise/Reports";
import AlertOverview from "./pages/enterprise/AlertOverview";
import EnterpriseIntegrations from "./pages/enterprise/Integrations";
import EnterpriseDocs from "./pages/enterprise/Docs";
import EnterpriseSettings from "./pages/enterprise/Settings";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import Landing from "./pages/Landing";
import DefenseArchitecture from "./pages/enterprise/DefenseArchitecture";
import RiskForecast from "./pages/enterprise/RiskForecast";
import SupplyChainRisk from "./pages/enterprise/SupplyChainRisk";

function AnalystLayout() {
  return (
    <div className="h-screen bg-navy flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
      <CopilotPanel />
    </div>
  );
}

function EnterpriseLayout() {
  return (
    <div className="h-screen bg-navy flex flex-col">
      <EnterpriseTopbar />
      <div className="flex flex-1 overflow-hidden">
        <EnterpriseSidebar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <EnterpriseAdvisorPanel />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/analyst" element={<AnalystLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ioc-explorer" element={<IocExplorer />} />
          <Route path="mitre" element={<MitreAttack />} />
          <Route path="timeline" element={<ThreatTimeline />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="threats" element={<ThreatExplorer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="docs" element={<Docs />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route element={<EnterpriseLayout />}>
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/enterprise/analytics" element={<AdvancedAnalytics />} />
          <Route path="/enterprise/defense" element={<DefenseArchitecture />} />
          <Route path="/enterprise/forecast" element={<RiskForecast />} />
          <Route path="/enterprise/supply-chain" element={<SupplyChainRisk />} />
          <Route path="/enterprise/reports" element={<EnterpriseReports />} />
          <Route path="/enterprise/alerts" element={<AlertOverview />} />
          <Route path="/enterprise/integrations" element={<EnterpriseIntegrations />} />
          <Route path="/enterprise/docs" element={<EnterpriseDocs />} />
          <Route path="/enterprise/settings" element={<EnterpriseSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;