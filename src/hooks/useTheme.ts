import { useState, useEffect } from 'react';
import { localStorageService } from '../services/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => localStorageService.getTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorageService.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
