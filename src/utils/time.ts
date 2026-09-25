import { getPrefs } from "./prefs";

/** Backend timestamps look like "2026-09-22T09:39:18+00:00Z" (double zone marker); normalise before parsing. */
export function parseTs(ts: string | null | undefined): Date | null {
  if (!ts) return null;
  const d = new Date(ts.replace(/([+-]\d{2}:\d{2})Z$/, "$1"));
  return isNaN(d.getTime()) ? null : d;
}

/** Formats in the timezone chosen in Settings (defaults to the device's). */
export function formatTs(ts: string | null | undefined): string {
  const d = parseTs(ts);
  if (!d) return ts ?? "—";
  const tz = getPrefs().timezone;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...(tz && tz !== "local" ? { timeZone: tz, timeZoneName: "short" } : {}),
  });
}

export function relativeTs(ts: string | null | undefined): string {
  const d = parseTs(ts);
  if (!d) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
