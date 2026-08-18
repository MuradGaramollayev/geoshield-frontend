import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { getUser, panelPathForRole } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // UI-only auth: read the previously "signed up" user from localStorage.
    // No real password check yet — this simulates routing until backend Auth exists.
    setTimeout(() => {
      const user = getUser();
      if (!user) {
        setError("No account found. Please sign up first — this is a UI-only demo without a backend yet.");
        setSubmitting(false);
        return;
      }
      navigate(panelPathForRole(user.role));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background radar blur */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.5), transparent 55%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="card-glow p-8">
          <div className="flex flex-col items-center mb-8">
            <span
              className="font-mono font-bold text-white tracking-wider text-xl mb-3"
              style={{ textShadow: "0 0 12px rgba(16, 185, 129, 0.35)" }}
            >
              GEOSHIELD
            </span>
            <Shield size={20} className="text-emerald-400 mb-2" />
            <h1 className="text-xl font-bold text-slate-100">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="text-xs text-slate-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30"
              />
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald text-navy font-semibold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-xs text-slate-600 text-center mt-4">
            Forgot password?
          </p>

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
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-400 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}