import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function getInitialIsDark(): boolean {
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return (
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg hover:bg-muted transition-colors duration-150 active:scale-95 group"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-colors duration-150 group-hover:text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 transition-colors duration-150 group-hover:text-blue-500" />
      )}
    </button>
  );
}
