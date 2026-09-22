import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, UserPlus, Users } from "lucide-react";
import { addTeamMember, fetchTeam, removeTeamMember } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useMotion } from "../../design/panel";
import { formatTs } from "../../utils/time";
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorState, IconButton, PageHeader, SelectField, SkeletonRows, TextField,
} from "../../components/ui";

// Must match VALID_ROLES in backend/routers/team.py
const ROLES = ["SOC Analyst", "SOC Manager", "CISO/Executive", "Researcher"];

export default function Team() {
  const { data, error, loading, reload, setData } = useAsync(fetchTeam, []);
  const members = data?.members ?? [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const m = useMotion();

  const invite = async () => {
    setAdding(true);
    setActionError(null);
    try {
      const member = await addTeamMember(name.trim(), email.trim(), role);
      setData((prev) => ({ count: (prev?.count ?? 0) + 1, members: [...(prev?.members ?? []), member] }));
      setName("");
      setEmail("");
    } catch (err) {
      setActionError(`Invite failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    setActionError(null);
    try {
      await removeTeamMember(id);
      setData((prev) => ({ count: Math.max(0, (prev?.count ?? 1) - 1), members: (prev?.members ?? []).filter((x) => x.id !== id) }));
    } catch (err) {
      setActionError(`Remove failed: ${err instanceof Error ? err.message : err}`);
    }
  };

  return (
    <div className="max-w-5xl">
      <PageHeader title="Team" description="Who has access to GeoShield and in which role. The roster is stored by the backend." />

      <Card className="mb-[var(--gap-grid)]">
        <CardHeader title="Invite a colleague" icon={<UserPlus size={17} />} />
        <form
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_220px_auto] gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            invite();
          }}
        >
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <Button type="submit" variant="primary" loading={adding} disabled={!name.trim() || !email.trim()}>
            Add to roster
          </Button>
        </form>
        <p className="text-xs text-text-3 mt-3">Adds the person to the roster with status “invited”. Invitation emails aren't sent yet.</p>
        {actionError && <p role="alert" className="text-sm text-sev-critical-text mt-2">{actionError}</p>}
      </Card>

      <Card pad="none">
        <div className="px-[var(--pad-card)] pt-[var(--pad-card)]">
          <CardHeader title="Roster" description={loading ? undefined : `${members.length} ${members.length === 1 ? "person" : "people"}`} />
        </div>
        {error ? (
          <div className="p-[var(--pad-card)] pt-0"><ErrorState message={error} onRetry={reload} /></div>
        ) : loading ? (
          <SkeletonRows rows={3} cols={3} />
        ) : members.length === 0 ? (
          <EmptyState icon={<Users size={20} />} title="No one on the roster yet" description="Invite the first colleague above." />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {members.map((mem) => (
                <motion.li
                  key={mem.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: m.duration, ease: m.ease }}
                  className="flex items-center gap-4 px-[var(--pad-card)] py-3.5"
                >
                  <span className="w-10 h-10 rounded-[12px] bg-ink-2 text-paper text-sm font-bold inline-flex items-center justify-center shrink-0">
                    {mem.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-base font-semibold text-ink truncate">{mem.name}</span>
                    <span className="block text-sm text-text-3 truncate">{mem.email}</span>
                  </span>
                  <span className="hidden md:block text-sm text-text-2 w-40">{mem.role}</span>
                  <span className="hidden lg:block text-xs text-text-3 w-32">Added {formatTs(mem.invited_at)}</span>
                  <Badge tone={mem.status === "active" ? "positive" : "caution"}>
                    {mem.status.charAt(0).toUpperCase() + mem.status.slice(1)}
                  </Badge>
                  <IconButton label={`Remove ${mem.name}`} size="sm" onClick={() => remove(mem.id)}>
                    <Trash2 size={15} />
                  </IconButton>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>
    </div>
  );
}
