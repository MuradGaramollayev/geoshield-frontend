import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import ProfileCard from "../../components/common/ProfileCard";
import PreferencesCard from "../../components/common/PreferencesCard";
import SourceKeysCard from "../../components/common/SourceKeysCard";
import { Card, CardHeader, PageHeader } from "../../components/ui";

export default function EnterpriseSettings() {
  return (
    <div className="max-w-4xl space-y-[var(--gap-grid)]">
      <PageHeader title="Settings" description="Organisation details, your profile, and the platform's data-source configuration." />
      <PreferencesCard showOrg />
      <ProfileCard currentPanel="enterprise" />
      <Card>
        <CardHeader
          title="Team access"
          description="Invite colleagues and manage roles."
          icon={<Users size={17} />}
          actions={
            <Link to="/enterprise/team" className="text-sm font-semibold text-accent-ink hover:underline">
              Open team management
            </Link>
          }
          className="mb-0"
        />
      </Card>
      <SourceKeysCard />
    </div>
  );
}
