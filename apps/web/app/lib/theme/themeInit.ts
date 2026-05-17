/** localStorage key for dark mode; must stay in sync with `ThemeContext`. */
export const DARK_MODE_STORAGE_KEY = "darkMode";

/** Blocking inline script for `app/layout.tsx` — applies `dark` on `<html>` before paint. */
export const themeInitScript = `(function(){try{var d=localStorage.getItem("${DARK_MODE_STORAGE_KEY}")==="true";if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export function readStoredDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function applyDarkModeClass(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
}
