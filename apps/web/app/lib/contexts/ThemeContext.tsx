import { createContext, useState, useContext, useEffect } from "react";
import {
  DARK_MODE_STORAGE_KEY,
  applyDarkModeClass,
  readStoredDarkMode,
} from "../theme/themeInit";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = readStoredDarkMode();
    setIsDarkMode(isDark);
    applyDarkModeClass(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, newMode.toString());
    applyDarkModeClass(newMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
