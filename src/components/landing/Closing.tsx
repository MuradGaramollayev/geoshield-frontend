import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LogoLockup } from "../brand/Logo";
import { useTheme } from "../../design/themeContext";
import { Button } from "../ui";
import { revealStyle, useReveal } from "./reveal";

/** Final call to action, the founder note, and the footer. */
export default function Closing() {
  const th = useTheme();
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <>
      <div ref={ref} className="px-6 pb-8 pt-20 sm:pt-28">
        <div
          className="e3 relative mx-auto max-w-4xl overflow-hidden rounded-[28px] px-8 py-14 text-center"
          style={revealStyle(shown)}
        >
          <span
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-20"
            style={{ background: th.c.accent }}
          />
          <h2 className="relative text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-balance">
            See where the next attack comes from
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-text-2">
            Open the console on live data. Nothing to install, nothing simulated.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button variant="accent" size="lg" iconRight={<ArrowRight size={17} />}>
                Get started free
              </Button>
            </Link>
            <Link to="/analyst">
              <Button variant="secondary" size="lg">Take a look first</Button>
            </Link>
          </div>
        </div>
      </div>

      <div id="about" className="px-6 py-16 text-center">
        <p className="code text-2xs uppercase tracking-[0.18em] text-accent-ink">Built by</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">Murad Garamollayev</h3>
        <p className="mt-1 text-sm text-text-3">Cybersecurity engineer, founder</p>
      </div>

      <footer className="border-t border-line px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <LogoLockup size={26} />
          <nav className="flex items-center gap-6 text-sm text-text-3">
            <a href="#platform" className="hover:text-ink">Platform</a>
            <a href="#plans" className="hover:text-ink">Plans</a>
            <Link to="/login" className="hover:text-ink">Log in</Link>
            <Link to="/signup" className="hover:text-ink">Sign up</Link>
          </nav>
          <p className="text-xs text-text-3">© {new Date().getFullYear()} GeoShield</p>
        </div>
      </footer>
    </>
  );
}
