import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { useState } from "react";
import { CiLight } from "react-icons/ci";

function ThemeSwitcher() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <span onClick={toggleTheme}>
      <CiLight />

      {/* Switch to {theme === "light" ? "Dark" : "Light"} Mode */}
    </span>
  );
}

export default ThemeSwitcher;
