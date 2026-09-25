import { Briefcase } from "lucide-react";
import { askCopilotWithRole, fetchCopilotSuggestionsWithRole } from "../../services/api";
import ChatPanel from "../common/ChatPanel";

const loadSuggestions = () => fetchCopilotSuggestionsWithRole("executive");
const ask = (q: string) => askCopilotWithRole(q, false, "executive"); // uses Claude when the backend has a key

export default function EnterpriseAdvisorPanel() {
  return (
    <ChatPanel
      title="AI Advisor"
      subtitle="Strategic answers on your risk posture · powered by Claude"
      launcherIcon={<Briefcase size={16} />}
      launcherLabel="Open AI Advisor"
      emptyPrompt="Ask a strategic question about your organisation's risk exposure."
      placeholder="Ask about exposure, priorities, board questions…"
      loadSuggestions={loadSuggestions}
      ask={ask}
    />
  );
}
