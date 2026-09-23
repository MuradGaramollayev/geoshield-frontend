import { useState } from "react";
import { getPrefs, savePrefs, TIMEZONES } from "../../utils/prefs";
import { useTheme } from "../../design/themeContext";
import { Button, Card, CardHeader, SelectField, TextField } from "../ui";

/** Browser-local preferences. Timezone drives every timestamp in the app. */
export default function PreferencesCard({ showOrg = false }: { showOrg?: boolean }) {
  const [prefs, setPrefs] = useState(getPrefs);
  const [draft, setDraft] = useState(prefs);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const dirty = JSON.stringify(prefs) !== JSON.stringify(draft);

  return (
    <Card>
      <CardHeader
        title={showOrg ? "Organisation" : "Preferences"}
        description="Saved in this browser. Appearance applies to this panel; timestamps everywhere use the timezone you pick."
      />
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPrefs(savePrefs(draft));
          setSaved(true);
        }}
      >
        {showOrg && (
          <TextField
            label="Organisation name"
            value={draft.orgName}
            placeholder="Acme Corp"
            onChange={(e) => {
              setSaved(false);
              setDraft({ ...draft, orgName: e.target.value });
            }}
          />
        )}
        <SelectField
          label="Appearance"
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark")}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </SelectField>
        <SelectField
          label="Timezone"
          value={draft.timezone}
          onChange={(e) => {
            setSaved(false);
            setDraft({ ...draft, timezone: e.target.value });
          }}
        >
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </SelectField>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={!dirty}>
            Save preferences
          </Button>
          {saved && !dirty && <span role="status" className="text-sm text-positive">Preferences saved.</span>}
        </div>
      </form>
    </Card>
  );
}
