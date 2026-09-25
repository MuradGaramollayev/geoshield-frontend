import { fetchStatus, formatAsOf } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { CountUp, Skeleton } from "../ui";
import { revealStyle, useReveal } from "./reveal";

/** Real figures from /api/status, counted up the first time they scroll in. */
export default function LiveStats() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.4);
  const { data, loading } = useAsync(fetchStatus, []);

  const items = data
    ? [
        { label: "Countries monitored", value: data.data.countries },
        { label: "Threat indicators", value: data.data.total_threats },
        { label: "Live sources", value: data.data.sources },
        { label: "Critical countries", value: data.data.critical },
      ]
    : [];

  return (
    <div ref={ref} className="relative border-y border-line bg-sunken/55 px-6 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
        {loading || !data
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[12px]" />)
          : items.map((s, i) => (
              <div key={s.label} style={revealStyle(shown, i)}>
                <p className="num text-3xl font-semibold tracking-tight text-ink">
                  {shown ? <CountUp value={s.value} duration={1400} /> : "0"}
                </p>
                <p className="mt-1.5 text-sm text-text-3">{s.label}</p>
              </div>
            ))}
      </div>
      {data?.as_of && (
        <p className="mx-auto mt-8 max-w-6xl text-2xs text-text-3">
          Aggregated dataset as of {formatAsOf(data.as_of)}.
        </p>
      )}
    </div>
  );
}
