import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "system";
    setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (theme) => {
      if (theme === "light") {
        root.setAttribute("data-theme", "light");
        root.classList.remove("dark");
      } else if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
        if (prefersDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    const listener = (e) => {
      if (theme === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
