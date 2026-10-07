import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import "./ThemeToggle.css";

/**
 * Light/dark theme switch. `variant="dark-surface"` (default) is for use
 * on dark backgrounds like the sidebar; variant="light-surface" is for
 * use on white toolbars like the admin header.
 */
const ThemeToggle = ({ variant = "dark-surface" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isDark ? <Moon size={12} strokeWidth={2.5} /> : <Sun size={12} strokeWidth={2.5} />}
        </span>
      </span>
      <span className="theme-toggle__label">{isDark ? "Dark mode" : "Light mode"}</span>
    </button>
  );
};

export default ThemeToggle;
