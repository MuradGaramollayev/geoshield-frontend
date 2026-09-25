import { useState } from "react";
import { Link } from "react-router-dom";
import { ALL_ROLES, getUser, isExecutiveRole, panelPathForRole, saveUser } from "../../utils/auth";
import type { StoredUser } from "../../utils/auth";
import { Button, Card, CardHeader, EmptyState, SelectField, TextField } from "../ui";


/** Edits the signed-in profile. Accounts live in this browser until backend auth exists. */
export default function ProfileCard({ currentPanel }: { currentPanel: "analyst" | "enterprise" }) {
  const [user, setUser] = useState<StoredUser | null>(() => getUser());
  const [draft, setDraft] = useState<StoredUser | null>(user);
  const [saved, setSaved] = useState(false);

  if (!user || !draft) {
    return (
      <Card>
        <EmptyState
          title="You're not signed in"
          description="Create an account to keep your name and role on this device."
          action={
            <Link to="/signup" className="inline-flex h-10 px-4 items-center rounded-[12px] bg-ink-2 text-paper font-semibold text-sm">
              Create account
            </Link>
          }
        />
      </Card>
    );
  }

  const dirty = JSON.stringify(user) !== JSON.stringify(draft);
  const targetPanel = panelPathForRole(draft.role);
  const panelChanges = (currentPanel === "enterprise") !== isExecutiveRole(draft.role);
  const set = (k: keyof StoredUser) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSaved(false);
    setDraft({ ...draft, [k]: e.target.value } as StoredUser);
  };

  return (
    <Card>
      <CardHeader title="Profile" description="Saved in this browser. Account sync arrives with backend sign-in." />
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveUser(draft);
          setUser(draft);
          setSaved(true);
        }}
      >
        <TextField label="First name" value={draft.firstName} onChange={set("firstName")} required />
        <TextField label="Last name" value={draft.lastName} onChange={set("lastName")} required />
        <TextField label="Work email" type="email" value={draft.email} onChange={set("email")} required />
        <TextField label="Company" value={draft.company} onChange={set("company")} />
        <SelectField label="Role" value={draft.role} onChange={set("role")} className="sm:col-span-2">
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </SelectField>
        {panelChanges && (
          <p className="sm:col-span-2 text-sm text-text-2 bg-accent-100 rounded-[12px] px-3.5 py-2.5">
            {draft.role} uses the {isExecutiveRole(draft.role) ? "Enterprise" : "Analyst"} panel.{" "}
            {saved && (
              <Link to={targetPanel} className="font-semibold text-accent-ink hover:underline">
                Open it now
              </Link>
            )}
          </p>
        )}
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={!dirty}>
            Save profile
          </Button>
          {saved && !dirty && <span role="status" className="text-sm text-positive">Profile saved.</span>}
        </div>
      </form>
    </Card>
  );
}
