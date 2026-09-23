import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "../brand/Logo";
import { ThemeToggle } from "../layout/ThemeToggle";
import { Button } from "../ui";

const LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#live", label: "Live data" },
  { href: "#consoles", label: "Consoles" },
  { href: "#plans", label: "Plans" },
];

/** Sticky top bar. Transparent over the hero, solid once the page moves. */
export default function Nav() {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        lifted ? "bg-surface/85 backdrop-blur-xl shadow-[var(--shadow-e1)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link to="/" aria-label="GeoShield home" className="interactive hover:opacity-80">
          <LogoLockup size={28} />
        </Link>

        <ul className="hidden md:flex items-center gap-1 ml-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-2 rounded-[10px] text-sm font-medium text-text-2 interactive hover:text-ink hover:bg-sunken"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="accent" size="sm">Get started</Button>
          </Link>
          <button
            className="md:hidden w-10 h-10 rounded-[12px] inline-flex items-center justify-center text-ink interactive hover:bg-sunken"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="md:hidden border-t border-line bg-surface px-6 py-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-text-2 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
