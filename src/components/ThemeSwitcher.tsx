import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button, Icon } from '@acutrack-bookprint/acutrack-ds';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  effectiveTheme: Theme; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- V V V THIS IS NOW THE DEFAULT EXPORT V V V ---
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const savedTheme = localStorage.getItem('themePreference') as ThemePreference | null;
    return savedTheme || 'light';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = document.documentElement;
    let systemThemeMediaQuery: MediaQueryList | undefined;

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const newSystemTheme: Theme = event.matches ? 'dark' : 'light';
      root.classList.toggle('dark', event.matches);
      setEffectiveTheme(newSystemTheme);
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', handleSystemThemeChange);

    if (themePreference === 'system') {
      systemThemeMediaQuery = mediaQuery;
      const isSystemDark = systemThemeMediaQuery.matches;
      root.classList.toggle('dark', isSystemDark);
      setEffectiveTheme(isSystemDark ? 'dark' : 'light');
      systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      const isDark = themePreference === 'dark';
      root.classList.toggle('dark', isDark);
      setEffectiveTheme(themePreference);
    }

    localStorage.setItem('themePreference', themePreference);

    return () => {
      if (systemThemeMediaQuery) {
        systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange);
      }
    };
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
// --- ^ ^ ^ THIS IS NOW THE DEFAULT EXPORT ^ ^ ^ ---

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
};

export const ThemeToggleButton: React.FC = () => {
  const { themePreference, setThemePreference } = useTheme();

  const isActive = (buttonPreference: ThemePreference) => themePreference === buttonPreference;

  return (
    <div className="flex items-center space-x-1 p-0.5 bg-grey-200 dark:bg-grey-700 rounded-lg">
        <Button
            variant={isActive('light') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('light')}
            aria-pressed={isActive('light')}
            className={`min-w-[5.5rem] ${!isActive('light') ? 'text-grey-700 dark:text-grey-200 border-grey-300 dark:border-grey-600 hover:bg-grey-100 dark:hover:bg-grey-600' : 'dark:!text-grey-900'}`}
            title="Light Theme"
            leftIcon={<Icon size="sm">light_mode</Icon>}
        >
            Light
        </Button>
        <Button
            variant={isActive('dark') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('dark')}
            aria-pressed={isActive('dark')}
            className={`min-w-[5.5rem] ${!isActive('dark') ? 'text-grey-700 dark:text-grey-200 border-grey-300 dark:border-grey-600 hover:bg-grey-100 dark:hover:bg-grey-600' : 'dark:!text-[#0F172A]'}`}
            title="Dark Theme"
            leftIcon={<Icon size="sm">dark_mode</Icon>}
        >
            Dark
        </Button>
        <Button
            variant={isActive('system') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('system')}
            aria-pressed={isActive('system')}
            className={`min-w-[5.5rem] ${!isActive('system') ? 'text-grey-700 dark:text-grey-200 border-grey-300 dark:border-grey-600 hover:bg-grey-100 dark:hover:bg-grey-600' : 'dark:!text-[#0F172A]'}`}
            title="System Theme"
            leftIcon={<Icon size="sm">computer</Icon>}
        >
            System
        </Button>
    </div>
  );
};