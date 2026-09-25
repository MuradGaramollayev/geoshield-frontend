import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchIncidents, fetchStatus } from "../../services/api";
import type { StatusData } from "../../services/api";
import { getUser } from "../../utils/auth";
import type { StoredUser } from "../../utils/auth";
import { ShellDataContext } from "./shellData";

const OPEN = new Set(["NEW", "ASSIGNED", "INVESTIGATING"]);

/**
 * Real data behind the top bar, fetched once per shell: backend status, the
 * number of open incidents (what Alert Center shows as active alerts) and the
 * signed-in user. Refreshes every 60 s.
 */
export function ShellDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [openAlerts, setOpenAlerts] = useState<number | null>(null);
  const [user] = useState<StoredUser | null>(() => getUser());

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchStatus()
        .then((s) => {
          if (!alive) return;
          setStatus(s);
          setStatusError(false);
        })
        .catch(() => alive && setStatusError(true));
      fetchIncidents()
        .then((d) => alive && setOpenAlerts(d.incidents.filter((i) => OPEN.has(i.status)).length))
        .catch(() => alive && setOpenAlerts(null));
    };
    load();
    const t = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : null;

  return (
    <ShellDataContext.Provider value={{ status, statusError, openAlerts, user, initials }}>
      {children}
    </ShellDataContext.Provider>
  );
}
