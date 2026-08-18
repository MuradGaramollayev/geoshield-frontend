import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Globe2, TrendingUp, Check, X } from "lucide-react";
import { saveUser, panelPathForRole } from "../../utils/auth";
import type { UserRole } from "../../utils/auth";

interface RoleOption {
  value: UserRole;
  tier: "Free" | "Pro";
}

const ROLE_OPTIONS: RoleOption[] = [
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

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 12 characters", test: (pw) => pw.length >= 12 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<UserRole>("Student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showPasswordHints = password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email) return;
    if (!passwordValid) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    saveUser({ firstName, lastName, email, company, role });

    setTimeout(() => {
      navigate(panelPathForRole(role));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-navy flex">
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <span
              className="font-mono font-bold text-white tracking-wider text-xl"
              style={{ textShadow: "0 0 12px rgba(16, 185, 129, 0.35)" }}
            >
              GEOSHIELD
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-8">Join security professionals worldwide</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              >
                <optgroup label="Free">
                  {ROLE_OPTIONS.filter((r) => r.tier === "Free").map((r) => (
                    <option key={r.value} value={r.value}>{r.value} — Free</option>
                  ))}
                </optgroup>
                <optgroup label="Pro">
                  {ROLE_OPTIONS.filter((r) => r.tier === "Pro").map((r) => (
                    <option key={r.value} value={r.value}>{r.value} — Pro</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              />
              {showPasswordHints && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        {passed ? (
                          <Check size={12} className="text-emerald-400 shrink-0" />
                        ) : (
                          <X size={12} className="text-slate-600 shrink-0" />
                        )}
                        <span className={`text-[11px] ${passed ? "text-emerald-400" : "text-slate-600"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              />
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {passwordsMatch ? (
                    <><Check size={12} className="text-emerald-400" /><span className="text-[11px] text-emerald-400">Passwords match</span></>
                  ) : (
                    <><X size={12} className="text-rose-400" /><span className="text-[11px] text-rose-400">Passwords do not match</span></>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !passwordValid || !passwordsMatch}
              className="w-full bg-emerald text-navy font-semibold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or continue with</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-slate-700 text-slate-300 text-sm py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <p className="text-sm text-slate-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">Log In</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-surface items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.4), transparent 60%)",
          }}
        />
        <div className="relative z-10 text-center px-12">
          <Shield size={48} className="text-emerald-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-100 mb-3">
            Join security professionals worldwide
          </h2>
          <p className="text-slate-400 mb-10">
            Real-time threat intelligence from 9 live sources, covering 120+ countries.
          </p>
          <div className="flex items-center justify-center gap-10">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <Globe2 size={16} className="text-sky-400" />
                <span className="text-2xl font-bold text-slate-100">124</span>
              </div>
              <p className="text-xs text-slate-500">Countries</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-2xl font-bold text-slate-100">100K+</span>
              </div>
              <p className="text-xs text-slate-500">Indicators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}