import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme store using Zustand with persistence
 * Supports light, dark, high-contrast, and system themes for accessibility
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        set({ theme });

        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark', 'high-contrast');

          let effectiveTheme = theme;
          if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
          }
          
          root.classList.add(effectiveTheme);
          root.setAttribute('data-theme', effectiveTheme);
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const themes: Theme[] = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        get().setTheme(nextTheme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
