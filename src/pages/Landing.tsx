import { ThemeProvider } from "../design/theme";
import { PanelContext } from "../design/panel";
import Ambience from "../components/landing/Ambience";
import Nav from "../components/landing/Nav";
import Hero from "../components/landing/Hero";
import LiveStats from "../components/landing/LiveStats";
import ThreatTicker from "../components/landing/ThreatTicker";
import Section from "../components/landing/Section";
import IocDemo from "../components/landing/IocDemo";
import Pipeline from "../components/landing/Pipeline";
import Capabilities from "../components/landing/Capabilities";
import Consoles from "../components/landing/Consoles";
import Feeds from "../components/landing/Feeds";
import Comparison from "../components/landing/Comparison";
import Plans from "../components/landing/Plans";
import Closing from "../components/landing/Closing";

export default function Landing() {
  return (
    <PanelContext.Provider value="public">
      <ThemeProvider panel="public">
        <div className="relative min-h-screen bg-surface text-ink">
          <Ambience />
          <Nav />
          <main className="relative">
            <Hero />
            <LiveStats />
            <ThreatTicker />

            <Section
              id="live"
              eyebrow="Live data"
              title="Try it on a real address"
              lead="The same lookup the console runs, on this page, against the live vendors."
              tone="sunken"
              veil="top-right"
            >
              <IocDemo />
            </Section>

            <Section
              eyebrow="How it works"
              title="From raw feeds to a country score"
            >
              <Pipeline />
            </Section>

            <Section
              id="platform"
              eyebrow="Platform"
              title="What a shift actually needs"
              tone="sunken"
            >
              <Capabilities />
            </Section>

            <Section
              id="consoles"
              eyebrow="Two consoles"
              title="One system, two tempos"
              lead="The same design tokens and the same data throughout. Only the density, the pacing and the language change."
              veil="bottom-left"
            >
              <Consoles />
            </Section>

            <Section
              eyebrow="Sources"
              title="Nine feeds, nothing simulated"
              lead="Every figure in the product traces back to a named public source, and the interface says which one."
              tone="sunken"
            >
              <Feeds />
            </Section>

            <Section eyebrow="Fit" title="Next to your SIEM, not instead of it">
              <Comparison />
            </Section>

            <Section id="plans" eyebrow="Plans" title="Pricing that scales with the team" tone="sunken">
              <Plans />
            </Section>
          </main>
          <div className="relative"><Closing /></div>
        </div>
      </ThemeProvider>
    </PanelContext.Provider>
  );
}
