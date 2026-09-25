import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Globe2, Search, ScanSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchCountries } from "../../services/api";
import type { CountryRisk } from "../../services/api";
import { SeverityBadge } from "../ui";
import { useMotion } from "../../design/panel";

export interface PaletteNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

type Result =
  | { kind: "nav"; item: PaletteNavItem }
  | { kind: "country"; country: CountryRisk }
  | { kind: "ip"; ip: string };

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

/**
 * Ctrl/⌘+K palette over real things: panel pages, the 124 monitored countries
 * (from /api/countries) and — in the Analyst panel — a direct IOC lookup.
 */
interface PaletteProps {
  onClose: () => void;
  nav: PaletteNavItem[];
  iocPath?: string;
  countryPath: string;
}

export function CommandPalette({ open, ...props }: PaletteProps & { open: boolean }) {
  // The dialog mounts fresh on every open, so query and selection always start empty.
  return createPortal(<AnimatePresence>{open && <PaletteDialog {...props} />}</AnimatePresence>, document.body);
}

function PaletteDialog({ onClose, nav, iocPath, countryPath }: PaletteProps) {
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const m = useMotion();

  useEffect(() => {
    fetchCountries().then((d) => setCountries(d.countries)).catch(() => {});
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Result[] = [];
    if (iocPath && IPV4.test(query.trim())) out.push({ kind: "ip", ip: query.trim() });
    const navHits = nav.filter((n) => !q || n.label.toLowerCase().includes(q));
    out.push(...navHits.slice(0, q ? 6 : 8).map((item) => ({ kind: "nav" as const, item })));
    if (q) {
      const cHits = countries
        .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 6);
      out.push(...cHits.map((country) => ({ kind: "country" as const, country })));
    }
    return out;
  }, [query, nav, countries, iocPath]);


  const run = (r: Result) => {
    onClose();
    if (r.kind === "nav") navigate(r.item.path);
    else if (r.kind === "country") navigate(`${countryPath}?country=${r.country.code}`);
    else if (iocPath) navigate(`${iocPath}?ip=${encodeURIComponent(r.ip)}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") onClose();
  };

  return (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: m.duration }}
        >
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Search"
            className="e4 relative w-full max-w-xl overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: m.duration, ease: m.ease }}
          >
            <div className="flex items-center gap-3 px-5 border-b border-line">
              <Search size={18} className="text-text-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKey}
                placeholder={iocPath ? "Search pages, countries, or paste an IP…" : "Search pages and countries…"}
                className="flex-1 h-14 bg-transparent outline-none text-md text-ink placeholder:text-text-3"
              />
              <kbd className="code text-2xs text-text-3 bg-sunken rounded-[6px] px-1.5 py-0.5">Esc</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-text-3">No pages or countries match “{query}”.</li>
              )}
              {results.map((r, i) => {
                const selected = i === active;
                const base = `flex items-center gap-3 px-3 py-2.5 rounded-[12px] cursor-pointer ${
                  selected ? "bg-paper shadow-[var(--shadow-e3)]" : ""
                }`;
                if (r.kind === "ip")
                  return (
                    <li key="ip" role="option" aria-selected={selected} className={base} onMouseEnter={() => setActive(i)} onClick={() => run(r)}>
                      <ScanSearch size={16} className="text-accent-ink" />
                      <span className="flex-1 text-sm text-ink">
                        Look up <span className="code font-semibold">{r.ip}</span> in IOC Explorer
                      </span>
                      {selected && <CornerDownLeft size={14} className="text-text-3" />}
                    </li>
                  );
                if (r.kind === "nav") {
                  const Icon = r.item.icon;
                  return (
                    <li key={r.item.path} role="option" aria-selected={selected} className={base} onMouseEnter={() => setActive(i)} onClick={() => run(r)}>
                      <Icon size={16} className="text-text-2" />
                      <span className="flex-1 text-sm text-ink">{r.item.label}</span>
                      <span className="text-2xs text-text-3">{r.item.group}</span>
                    </li>
                  );
                }
                return (
                  <li key={r.country.code} role="option" aria-selected={selected} className={base} onMouseEnter={() => setActive(i)} onClick={() => run(r)}>
                    <Globe2 size={16} className="text-text-2" />
                    <span className="flex-1 text-sm text-ink">{r.country.name}</span>
                    <span className="num text-sm text-text-2">{r.country.risk_score}</span>
                    <SeverityBadge severity={r.country.risk_level} size="xs" />
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
  );
}
