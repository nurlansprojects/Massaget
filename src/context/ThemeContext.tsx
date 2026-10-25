import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, TextSize } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  chatBackground: string;
  setChatBackground: (bg: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('massaget_theme') as ThemeMode) || 'dark';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('massaget_text_size') as TextSize) || 'medium';
  });

  const [chatBackground, setChatBackgroundState] = useState<string>(() => {
    return localStorage.getItem('massaget_chat_bg') || 'default';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('massaget_theme', newTheme);
  };

  const setTextSize = (newSize: TextSize) => {
    setTextSizeState(newSize);
    localStorage.setItem('massaget_text_size', newSize);
  };

  const setChatBackground = (newBg: string) => {
    setChatBackgroundState(newBg);
    localStorage.setItem('massaget_chat_bg', newBg);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        textSize,
        setTextSize,
        chatBackground,
        setChatBackground,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
