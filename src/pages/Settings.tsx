import { ShieldCheck } from "lucide-react";
import ProfileCard from "../components/common/ProfileCard";
import PreferencesCard from "../components/common/PreferencesCard";
import SourceKeysCard from "../components/common/SourceKeysCard";
import { Card, CardHeader, PageHeader } from "../components/ui";

export default function Settings() {
  return (
    <div className="max-w-4xl space-y-[var(--gap-grid)]">
      <PageHeader title="Settings" description="Your profile, display preferences and the backend's data-source keys." />
      <ProfileCard currentPanel="analyst" />
      <PreferencesCard />
      <SourceKeysCard />
      <Card>
        <CardHeader title="Security" icon={<ShieldCheck size={17} />} />
        <p className="text-sm text-text-2 max-w-[70ch]">
          Sign-in is local to this browser today. Passwords, SSO and two-factor authentication arrive with backend
          authentication.
        </p>
      </Card>
    </div>
  );
}
