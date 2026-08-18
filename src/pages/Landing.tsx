import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import StatsBar from "../components/landing/StatsBar";
import HowItWorks from "../components/landing/HowItWorks";
import ProblemSolution from "../components/landing/ProblemSolution";
import DashboardPreview from "../components/landing/DashboardPreview";
import LiveThreatFeed from "../components/landing/LiveThreatFeed";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import ComparisonTable from "../components/landing/ComparisonTable";
import DataSources from "../components/landing/DataSources";
import IntegrationLogos from "../components/landing/IntegrationLogos";
import TwoProducts from "../components/landing/TwoProducts";
import Pricing from "../components/landing/Pricing";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import AboutFounder from "../components/landing/AboutFounder";

export default function Landing() {
  return (
    <div className="bg-navy min-h-screen landing-bg">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ProblemSolution />
      <DashboardPreview />
      <LiveThreatFeed />
      <FeaturesGrid />
      <ComparisonTable />
      <DataSources />
      <IntegrationLogos />
      <TwoProducts />
      <Pricing />
      <FinalCTA />
      <Footer />
      <AboutFounder />
    </div>
  );
}