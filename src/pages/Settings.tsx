import { useState } from "react";
import { User, Bell, Shield, Globe2, Save } from "lucide-react";

export default function Settings() {
  const [name, setName] = useState("Murad Garamollayev");
  const [email, setEmail] = useState("murad@geoshield.io");
  const [role, setRole] = useState("SOC Analyst");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyBrowser, setNotifyBrowser] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="card-glow p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Profile</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald/50"
            >
              <option>SOC Analyst</option>
              <option>SOC Manager</option>
              <option>Researcher</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-glow p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Email notifications</span>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Browser push notifications</span>
            <input
              type="checkbox"
              checked={notifyBrowser}
              onChange={(e) => setNotifyBrowser(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="card-glow p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-200">Security</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Authentication is not yet connected to a backend — password and 2FA
          management will be available once Auth is implemented.
        </p>
        <button disabled className="text-xs bg-slate-800 text-slate-600 rounded-lg px-3 py-2 cursor-not-allowed">
          Change Password (coming soon)
        </button>
      </div>

      {/* Language */}
      <div className="card-glow p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe2 size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Language</h3>
        </div>
        <p className="text-xs text-slate-500">
          Dashboard and analyst tools are English-only by design (industry
          standard for SOC tooling). Language selection is available on the
          landing page and sign-in screen.
        </p>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-emerald text-navy font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}   