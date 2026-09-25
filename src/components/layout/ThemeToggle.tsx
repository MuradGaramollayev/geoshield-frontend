import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../design/themeContext";

/** Light/dark switch. Both panels share one token set; only the values change. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="w-10 h-10 rounded-[12px] bg-paper shadow-[var(--shadow-e3)] inline-flex items-center justify-center text-ink interactive hover:-translate-y-px"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
