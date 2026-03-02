import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getStoredTheme, toggleTheme } from "../../utils/theme.js";

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const onToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed top-4 right-4 z-[100] inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md transition hover:bg-gray-50"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
};

export default ThemeToggleButton;
