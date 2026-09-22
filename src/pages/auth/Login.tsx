import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, panelPathForRole } from "../../utils/auth";
import { Button, TextField } from "../../components/ui";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => getUser()?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Accounts live in this browser until backend authentication ships; the password isn't verified yet.
    const user = getUser();
    if (!user) {
      setError("There's no GeoShield account on this device yet. Create one to continue.");
      return;
    }
    if (user.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      setError(`This device has an account for ${user.email}. Use that email, or create a new account.`);
      return;
    }
    navigate(panelPathForRole(user.role));
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where your team left off."
      footer={
        <>
          New to GeoShield? <Link to="/signup" className="font-semibold text-accent-ink hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" className="text-sm text-sev-critical-text">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={!email || !password}>
          Sign in
        </Button>
        <p className="text-xs text-text-3 text-center">Accounts are stored in this browser until backend sign-in launches.</p>
      </form>
    </AuthLayout>
  );
}
