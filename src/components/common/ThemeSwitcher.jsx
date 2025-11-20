import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isLight = theme === "light";
  console.log("theme hien tai", theme);

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
        transition-all duration-300 
        ${isLight 
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
          : "bg-gray-800 text-gray-100 hover:bg-gray-700"
        }
        shadow-sm hover:shadow-md
      `}
      title="Toggle theme"
    >
      {isLight ? (
        <Sun className="text-yellow-500" size={18} />
      ) : (
        <Moon className="text-blue-400" size={18} />
      )}
      <span className="hidden sm:inline">
        {isLight ? "Light Mode" : "Dark Mode"}
      </span>
    </motion.button>
  );
};

export default ThemeSwitcher;
