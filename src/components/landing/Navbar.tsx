import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("EN");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "#" },
    { label: "About", href: "#about" },
  ];

  const languages = ["EN", "AZ"];

  return (
    <nav className={"fixed top-0 left-0 right-0 z-50 transition-all duration-300 " + (scrolled ? "bg-navy/90 backdrop-blur-md border-b border-slate-800" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span
          className="font-mono font-bold text-white tracking-wider text-lg"
          style={{ textShadow: "0 0 12px rgba(16, 185, 129, 0.35)" }}
        >
          GEOSHIELD
        </span>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(function (link) {
            return (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={function () { setLangOpen(!langOpen); }}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Globe size={14} /> {lang}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg py-1 w-24 shadow-xl">
                {languages.map(function (l) {
                  return (
                    <button
                      key={l}
                      onClick={function () { setLang(l); setLangOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-emerald text-navy text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={function () { setMobileOpen(!mobileOpen); }}
          className="md:hidden text-slate-300"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-slate-800 px-6 py-4 space-y-3">
          {navLinks.map(function (link) {
            return (
              <a key={link.label} href={link.href} className="block text-sm text-slate-300">
                {link.label}
              </a>
            );
          })}
          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <Link to="/login" className="flex-1 text-center text-sm text-slate-300 border border-slate-700 rounded-lg py-2">
              Log In
            </Link>
            <Link to="/signup" className="flex-1 text-center text-sm bg-emerald text-navy font-semibold rounded-lg py-2">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}