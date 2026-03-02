const THEME_KEY = "theme";
const DEFAULT_THEME = "light";

export const getStoredTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : DEFAULT_THEME;
};

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_KEY, next);
  }
  return next;
};

export const toggleTheme = () => {
  const current = getStoredTheme();
  return applyTheme(current === "dark" ? "light" : "dark");
};
