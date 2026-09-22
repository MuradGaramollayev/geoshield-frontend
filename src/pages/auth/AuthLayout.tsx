import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchStatus, formatAsOf } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { LogoLockup } from "../../components/brand/Logo";
import { CountUp } from "../../components/ui";

/** Split auth layout: form on the left, live platform numbers on the right. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const { data } = useAsync(fetchStatus, []);
  return (
    <div className="min-h-screen bg-canvas p-2.5 flex">
      <div className="flex-1 flex rounded-[28px] bg-surface shadow-[var(--shadow-e1)] overflow-hidden">
        <div className="flex-1 flex flex-col px-6 sm:px-12 py-8 overflow-y-auto">
          <Link to="/" aria-label="GeoShield home" className="self-start">
            <LogoLockup />
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="w-full max-w-md mx-auto my-auto py-10"
          >
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            <p className="text-md text-text-2 mt-1 mb-8">{subtitle}</p>
            {children}
            <div className="mt-8 text-sm text-text-2 text-center">{footer}</div>
          </motion.div>
        </div>

        <aside className="hidden lg:flex w-[44%] max-w-[620px] m-2.5 rounded-[22px] bg-ink-2 text-paper p-12 flex-col justify-between relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(252,88,42,0.35), transparent 65%)" }}
          />
          <p className="relative text-md text-paper/70 max-w-sm">
            Country-level threat intelligence from 9 sources, with the maths behind every score on screen.
          </p>
          <div className="relative">
            <dl className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <dd className="num text-4xl font-medium tracking-[-0.04em]">{data ? <CountUp value={data.data.countries} /> : "—"}</dd>
                <dt className="text-sm text-paper/60 mt-1">Countries scored</dt>
              </div>
              <div>
                <dd className="num text-4xl font-medium tracking-[-0.04em]">{data ? <CountUp value={data.data.total_threats} /> : "—"}</dd>
                <dt className="text-sm text-paper/60 mt-1">Threat indicators</dt>
              </div>
              <div>
                <dd className="num text-4xl font-medium tracking-[-0.04em] text-accent">{data ? <CountUp value={data.data.avg_risk} /> : "—"}</dd>
                <dt className="text-sm text-paper/60 mt-1">Global risk index</dt>
              </div>
              <div>
                <dd className="num text-4xl font-medium tracking-[-0.04em]">9</dd>
                <dt className="text-sm text-paper/60 mt-1">Intelligence sources</dt>
              </div>
            </dl>
            <p className="text-xs text-paper/50">{data?.as_of ? `Live from the GeoShield API · data as of ${formatAsOf(data.as_of)}` : "Connecting to the GeoShield API…"}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
