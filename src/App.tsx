import { lazy, Suspense } from "react";
import { LogoMark } from "./components/brand/Logo";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnalystShell from "./components/layout/AnalystShell";
import EnterpriseShell from "./components/layout/EnterpriseShell";

// Each page is its own chunk, so the landing page and each panel load only what they need.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const IocExplorer = lazy(() => import("./pages/IocExplorer"));
const MitreAttack = lazy(() => import("./pages/MitreAttack"));
const ThreatTimeline = lazy(() => import("./pages/ThreatTimeline"));
const Incidents = lazy(() => import("./pages/Incidents"));
const AlertCenter = lazy(() => import("./pages/AlertCenter"));
const ThreatExplorer = lazy(() => import("./pages/ThreatExplorer"));
const Reports = lazy(() => import("./pages/Reports"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Settings = lazy(() => import("./pages/Settings"));
const Docs = lazy(() => import("./pages/Docs"));
const Analytics = lazy(() => import("./pages/Analytics"));
const EnterpriseDashboard = lazy(() => import("./pages/enterprise/Dashboard"));
const AdvancedAnalytics = lazy(() => import("./pages/enterprise/AdvancedAnalytics"));
const EnterpriseReports = lazy(() => import("./pages/enterprise/Reports"));
const AlertOverview = lazy(() => import("./pages/enterprise/AlertOverview"));
const EnterpriseIntegrations = lazy(() => import("./pages/enterprise/Integrations"));
const EnterpriseDocs = lazy(() => import("./pages/enterprise/Docs"));
const EnterpriseSettings = lazy(() => import("./pages/enterprise/Settings"));
const Team = lazy(() => import("./pages/enterprise/Team"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const Login = lazy(() => import("./pages/auth/Login"));
const Landing = lazy(() => import("./pages/Landing"));
const DefenseArchitecture = lazy(() => import("./pages/enterprise/DefenseArchitecture"));
const RiskForecast = lazy(() => import("./pages/enterprise/RiskForecast"));
const SupplyChainRisk = lazy(() => import("./pages/enterprise/SupplyChainRisk"));
const Benchmarking = lazy(() => import("./pages/enterprise/Benchmarking"));
const InfrastructureCorrelation = lazy(() => import("./pages/InfrastructureCorrelation"));

function RouteFallback() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 opacity-70">
        <LogoMark size={26} />
        <span className="text-sm text-text-3">Loading…</span>
      </div>
      <div className="skeleton h-8 w-64 mb-4" />
      <div className="skeleton h-40 w-full rounded-[20px]" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/analyst" element={<AnalystShell />}>
          <Route index element={<Dashboard />} />
          <Route path="ioc-explorer" element={<IocExplorer />} />
          <Route path="mitre" element={<MitreAttack />} />
          <Route path="correlation" element={<InfrastructureCorrelation />} />
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

        <Route element={<EnterpriseShell />}>
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/enterprise/analytics" element={<AdvancedAnalytics />} />
          <Route path="/enterprise/defense" element={<DefenseArchitecture />} />
          <Route path="/enterprise/forecast" element={<RiskForecast />} />
          <Route path="/enterprise/supply-chain" element={<SupplyChainRisk />} />
          <Route path="/enterprise/benchmarking" element={<Benchmarking />} />
          <Route path="/enterprise/reports" element={<EnterpriseReports />} />
          <Route path="/enterprise/alerts" element={<AlertOverview />} />
          <Route path="/enterprise/integrations" element={<EnterpriseIntegrations />} />
          <Route path="/enterprise/docs" element={<EnterpriseDocs />} />
          <Route path="/enterprise/settings" element={<EnterpriseSettings />} />
          <Route path="/enterprise/team" element={<Team />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;