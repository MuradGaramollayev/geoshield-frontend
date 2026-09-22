import { createContext, useContext } from "react";
import type { StatusData } from "../../services/api";
import type { StoredUser } from "../../utils/auth";

export interface ShellData {
  status: StatusData | null;
  statusError: boolean;
  openAlerts: number | null;
  user: StoredUser | null;
  initials: string | null;
}

export const ShellDataContext = createContext<ShellData>({
  status: null,
  statusError: false,
  openAlerts: null,
  user: null,
  initials: null,
});

export function useShellData(): ShellData {
  return useContext(ShellDataContext);
}
