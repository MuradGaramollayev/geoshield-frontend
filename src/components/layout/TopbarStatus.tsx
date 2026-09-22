import { Link } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { formatAsOf } from "../../services/api";
import { useShellData } from "./shellData";

/** Honest backend status: feed mode + the dataset's as-of date. */
export function StatusPill() {
  const { status, statusError } = useShellData();
  if (statusError) {
    return (
      <span className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-sev-critical-tint text-sev-critical-text text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-sev-critical" />
        API unreachable
      </span>
    );
  }
  if (!status) return <span className="skeleton h-9 w-52 rounded-full" />;
  const online = status.online;
  return (
    <span
      className="inline-flex items-center gap-2.5 h-9 pl-3.5 pr-2 rounded-full bg-paper shadow-[var(--shadow-e3)] text-sm"
      title={online ? "Backend is online: IOC lookups query live APIs." : "Backend is serving its offline cache."}
    >
      <span className="text-text-3 hidden xl:inline">
        Data as of <span className="num text-text-2 font-medium">{formatAsOf(status.as_of)}</span>
      </span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-semibold ${
          online ? "bg-positive-tint text-positive" : "bg-caution-tint text-caution"
        }`}
      >
        <span className={online ? "live-dot" : "w-1.5 h-1.5 rounded-full bg-caution"} />
        {online ? "Feeds online" : "Offline cache"}
      </span>
    </span>
  );
}

export function AlertsBell({ to }: { to: string }) {
  const { openAlerts } = useShellData();
  const label = openAlerts ? `${openAlerts} open alerts` : "No open alerts";
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="relative w-10 h-10 rounded-[12px] bg-paper shadow-[var(--shadow-e3)] inline-flex items-center justify-center text-ink interactive hover:-translate-y-px"
    >
      <Bell size={17} />
      {!!openAlerts && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-sev-high-on text-[10px] font-bold num inline-flex items-center justify-center ring-2 ring-surface">
          {openAlerts}
        </span>
      )}
    </Link>
  );
}

export function UserChip({ settingsPath }: { settingsPath: string }) {
  const { user, initials } = useShellData();
  if (!user) {
    return (
      <Link to="/login" className="h-10 px-4 rounded-[12px] bg-ink-2 text-paper text-sm font-semibold inline-flex items-center interactive hover:bg-black">
        Sign in
      </Link>
    );
  }
  return (
    <Link
      to={settingsPath}
      title={`${user.firstName} ${user.lastName} · ${user.role}`}
      className="flex items-center gap-2.5 h-10 pl-1 pr-3 rounded-[12px] hover:bg-sunken interactive"
    >
      <span className="w-8 h-8 rounded-[10px] bg-ink-2 text-paper text-xs font-bold inline-flex items-center justify-center">
        {initials}
      </span>
      <span className="hidden lg:block text-left leading-tight">
        <span className="block text-sm font-semibold text-ink">{user.firstName}</span>
        <span className="block text-2xs text-text-3">{user.role}</span>
      </span>
    </Link>
  );
}

export function SearchTrigger({ onOpen, placeholder, wide = false }: { onOpen: () => void; placeholder: string; wide?: boolean }) {
  return (
    <button
      onClick={onOpen}
      className={`field text-left text-text-3 hover:shadow-[var(--shadow-e2-hover)] ${wide ? "w-full" : "w-72"}`}
    >
      <Search size={16} className="shrink-0" />
      <span className="flex-1 text-base truncate">{placeholder}</span>
      <kbd className="code text-2xs bg-sunken rounded-[6px] px-1.5 py-0.5 shrink-0">Ctrl K</kbd>
    </button>
  );
}
