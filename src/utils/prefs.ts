/**
 * Per-browser preferences. There is no org-settings endpoint yet, so these
 * are stored locally and the UI says so wherever they're edited.
 */
export interface Prefs {
  orgName: string;
  timezone: string; // IANA zone, or "local"
}

const KEY = "geoshield_prefs";
const DEFAULTS: Prefs = { orgName: "", timezone: "local" };

export function getPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(update: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...update };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode); keep in memory only */
  }
  return next;
}

export const TIMEZONES = [
  { value: "local", label: "This device's timezone" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Baku", label: "Asia/Baku" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
];
