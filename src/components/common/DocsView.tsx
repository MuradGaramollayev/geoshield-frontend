import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import { fetchStatus } from "../../services/api";
import { coreSections } from "./docsContent";
import type { DocSection } from "./docsContent";
import { useAsync } from "../../hooks/useAsync";
import { useMotion } from "../../design/panel";
import { Card, EmptyState, SearchField } from "../ui";

export default function DocsView({ extra = [] }: { extra?: DocSection[] }) {
  const { data } = useAsync(fetchStatus, []);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const m = useMotion();

  const sections = useMemo(() => {
    const all = [...extra, ...coreSections(data)];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all
      .map((s) => ({ ...s, items: s.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)) }))
      .filter((s) => s.items.length > 0);
  }, [data, extra, search]);

  return (
    <div className="space-y-[var(--gap-grid)]">
      <SearchField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the docs" aria-label="Search the docs" />
      {sections.length === 0 && (
        <Card>
          <EmptyState icon={<BookOpen size={20} />} title={`Nothing matches “${search}”`} description="Try a shorter word, like “score” or “map”." />
        </Card>
      )}
      {sections.map((s) => (
        <Card key={s.title} pad="none">
          <h2 className="px-[var(--pad-card)] pt-[var(--pad-card)] pb-2 text-md font-semibold text-ink">{s.title}</h2>
          <ul className="divide-y divide-line">
            {s.items.map((item) => {
              const key = `${s.title}:${item.q}`;
              const isOpen = open === key || search.trim().length > 0;
              return (
                <li key={key}>
                  <button
                    onClick={() => setOpen(open === key ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-[var(--pad-card)] py-3.5 text-left hover:bg-paper/60 interactive"
                  >
                    <span className="text-base font-medium text-ink">{item.q}</span>
                    <ChevronDown size={16} className={`text-text-3 shrink-0 transition-transform duration-[var(--dur)] ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: m.duration, ease: m.ease }}
                        className="overflow-hidden"
                      >
                        <p className="px-[var(--pad-card)] pb-4 text-sm text-text-2 leading-relaxed max-w-[75ch]">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
