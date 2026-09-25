import { Sparkles } from "lucide-react";
import { askCopilot, fetchCopilotSuggestions } from "../../services/api";
import ChatPanel from "./ChatPanel";

const ask = (q: string) => askCopilot(q, true); // Analyst Copilot: always answers offline from the dataset

export default function CopilotPanel() {
  return (
    <ChatPanel
      title="AI Copilot"
      subtitle="Offline answers grounded in the GeoShield threat dataset"
      launcherIcon={<Sparkles size={16} />}
      launcherLabel="Open AI Copilot"
      emptyPrompt="Ask about indicators, countries, techniques or incidents."
      placeholder="Ask about threats, risk scores, CVEs…"
      loadSuggestions={fetchCopilotSuggestions}
      ask={ask}
      showConfidence
    />
  );
}
