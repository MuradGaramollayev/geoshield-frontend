export type UserRole =
  | "Student"
  | "Junior Analyst"
  | "Security Enthusiast"
  | "SOC Analyst"
  | "SOC Manager"
  | "Security Researcher"
  | "Penetration Tester"
  | "Incident Responder"
  | "CISO"
  | "CTO"
  | "Security Director"
  | "Risk & Compliance Manager"
  | "GRC Analyst"
  | "IT Security Manager"
  | "VP of Engineering";

export interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: UserRole;
}

const STORAGE_KEY = "geoshield_user";

export function saveUser(user: StoredUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const EXECUTIVE_ROLES: UserRole[] = [
  "CISO",
  "CTO",
  "Security Director",
  "Risk & Compliance Manager",
  "GRC Analyst",
  "IT Security Manager",
  "VP of Engineering",
];

export function isExecutiveRole(role: UserRole): boolean {
  return EXECUTIVE_ROLES.includes(role);
}

export function panelPathForRole(role: UserRole): string {
  return isExecutiveRole(role) ? "/enterprise" : "/analyst";
}