import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext.jsx";

function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const label = isLight ? "Dark mode" : "Light mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${label.toLowerCase()}`}
      title={`Switch to ${label.toLowerCase()}`}
      className={className}
    >
      {isLight ? (
        <FiMoon className="shrink-0 text-[18px]" />
      ) : (
        <FiSun className="shrink-0 text-[18px]" />
      )}
      {showLabel && <span className="hidden lg:block">{label}</span>}
    </button>
  );
}

export default ThemeToggle;
