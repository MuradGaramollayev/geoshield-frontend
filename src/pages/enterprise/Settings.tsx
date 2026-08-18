import { useEffect, useState } from "react";
import { Building2, Bell, Key, Users, Trash2, Plus, Loader2 } from "lucide-react";
import { fetchTeam, addTeamMember, removeTeamMember } from "../../services/api";
import type { TeamMember } from "../../services/api";

type Tab = "general" | "notifications" | "api" | "team";

const ROLES = ["SOC Analyst", "SOC Manager", "CISO/Executive", "Researcher"];

export default function EnterpriseSettings() {
  const [tab, setTab] = useState<Tab>("general");

  const [orgName, setOrgName] = useState("GeoShield Enterprise Org");
  const [timezone, setTimezone] = useState("UTC");
  const [retention, setRetention] = useState("90");

  const [emailDigest, setEmailDigest] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState(ROLES[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (tab === "team") {
      setTeamLoading(true);
      fetchTeam()
        .then((data) => setTeam(data.members))
        .catch((err) => setTeamError(err.message))
        .finally(() => setTeamLoading(false));
    }
  }, [tab]);

  const handleAddMember = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setAdding(true);
    try {
      const member = await addTeamMember(newName, newEmail, newRole);
      setTeam((prev) => [...prev, member]);
      setNewName("");
      setNewEmail("");
    } catch (err: any) {
      setTeamError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeTeamMember(id);
      setTeam((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setTeamError(err.message);
    }
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "general", label: "General", icon: Building2 },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "api", label: "API", icon: Key },
    { key: "team", label: "Team", icon: Users },
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Organization configuration and team access</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-800">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-3 border-b-2 transition-colors ${
                tab === t.key
                  ? "text-sky-400 border-sky-400"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <div className="card-glow p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Baku">Asia/Baku</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Data Retention (days)</label>
            <input
              type="number"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="card-glow p-6 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Daily email digest</span>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="w-4 h-4 accent-sky-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">Browser push notifications</span>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-4 h-4 accent-sky-500"
            />
          </label>
        </div>
      )}

      {tab === "api" && (
        <div className="card-glow p-6">
          <p className="text-xs text-slate-500 mb-3">
            API access is managed at the backend level. Anthropic Claude integration
            is currently active for AI Advisor responses.
          </p>
          <div className="bg-slate-800/60 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ANTHROPIC_API_KEY</span>
            <span className="text-xs text-emerald-400 font-semibold">Configured</span>
          </div>
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <div className="card-glow p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Invite Team Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email"
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddMember}
              disabled={adding || !newName.trim() || !newEmail.trim()}
              className="flex items-center gap-2 bg-sky-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Invite User
            </button>
            {teamError && <p className="text-xs text-rose-400 mt-2">Error: {teamError}</p>}
          </div>

          <div className="card-glow p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              Team Roster ({team.length})
            </h3>
            {teamLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : team.length === 0 ? (
              <p className="text-sm text-slate-500">No team members yet. Invite someone above.</p>
            ) : (
              <div className="space-y-2">
                {team.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email} · {m.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full capitalize">
                        {m.status}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}