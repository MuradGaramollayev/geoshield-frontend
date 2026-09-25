import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Circle } from "lucide-react";
import { isExecutiveRole, panelPathForRole, saveUser } from "../../utils/auth";
import type { UserRole } from "../../utils/auth";
import { Button, SelectField, TextField } from "../../components/ui";
import AuthLayout from "./AuthLayout";

const ROLES: { value: UserRole; tier: "Free" | "Pro" }[] = [
  { value: "Student", tier: "Free" },
  { value: "Junior Analyst", tier: "Free" },
  { value: "Security Enthusiast", tier: "Free" },
  { value: "SOC Analyst", tier: "Pro" },
  { value: "SOC Manager", tier: "Pro" },
  { value: "Security Researcher", tier: "Pro" },
  { value: "Penetration Tester", tier: "Pro" },
  { value: "Incident Responder", tier: "Pro" },
  { value: "CISO", tier: "Pro" },
  { value: "CTO", tier: "Pro" },
  { value: "Security Director", tier: "Pro" },
  { value: "Risk & Compliance Manager", tier: "Pro" },
  { value: "GRC Analyst", tier: "Pro" },
  { value: "IT Security Manager", tier: "Pro" },
  { value: "VP of Engineering", tier: "Pro" },
];

const RULES = [
  { label: "12+ characters", test: (p: string) => p.length >= 12 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<UserRole>("SOC Analyst");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const valid = RULES.every((r) => r.test(password));
  const match = password.length > 0 && password === confirm;
  const ready = firstName && lastName && email && valid && match;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    saveUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), company: company.trim(), role });
    navigate(panelPathForRole(role));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Your role decides which workspace you land in."
      footer={
        <>
          Already have an account? <Link to="/login" className="font-semibold text-accent-ink hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <TextField label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <TextField label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        <SelectField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <optgroup label="Free">
            {ROLES.filter((r) => r.tier === "Free").map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
          </optgroup>
          <optgroup label="Pro">
            {ROLES.filter((r) => r.tier === "Pro").map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
          </optgroup>
        </SelectField>
        <p className="text-xs text-text-3 -mt-2">
          You'll start in the {isExecutiveRole(role) ? "Enterprise panel (strategic overview for leadership)" : "Analyst console (operational SOC tools)"}.
        </p>
        <TextField label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {password.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 -mt-1" aria-label="Password requirements">
            {RULES.map((r) => {
              const ok = r.test(password);
              return (
                <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-positive" : "text-text-3"}`}>
                  {ok ? <Check size={13} strokeWidth={3} /> : <Circle size={10} />}
                  {r.label}
                </li>
              );
            })}
          </ul>
        )}
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          hint={confirm.length > 0 ? (match ? <span className="text-positive">Passwords match</span> : <span className="text-sev-critical-text">Passwords don't match yet</span>) : undefined}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={!ready}>
          Create account
        </Button>
        <p className="text-xs text-text-3 text-center">Your account is stored in this browser until backend sign-in launches.</p>
      </form>
    </AuthLayout>
  );
}
