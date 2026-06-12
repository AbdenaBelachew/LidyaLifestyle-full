import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('lidya_admin_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lidya_admin_theme', theme);
    } catch (e) {
      // ignore
    }

    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-admin-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-admin-theme');
      }
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
