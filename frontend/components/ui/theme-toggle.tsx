'use client';

import { useEffect } from 'react';
import { useThemeStore, type Theme } from '@/store/theme-store';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2" role="radiogroup" aria-labelledby="theme-label">
      <span className="text-sm text-gray-600 dark:text-gray-300" id="theme-label">
        Theme:
      </span>
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <button
          onClick={() => handleThemeChange('light')}
          className={`px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            theme === 'light'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
          }`}
          role="radio"
          aria-checked={theme === 'light'}
          aria-label="Light theme"
        >
          ☀️ Light
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className={`px-3 py-1 text-sm border-x border-gray-300 dark:border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            theme === 'dark'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
          }`}
          role="radio"
          aria-checked={theme === 'dark'}
          aria-label="Dark theme"
        >
          🌙 Dark
        </button>
        <button
          onClick={() => handleThemeChange('high-contrast')}
          className={`px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            theme === 'high-contrast'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
          }`}
          role="radio"
          aria-checked={theme === 'high-contrast'}
          aria-label="High contrast theme"
        >
          ◐ High Contrast
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          className={`px-3 py-1 text-sm border-l border-gray-300 dark:border-gray-600 transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            theme === 'system'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
          }`}
          role="radio"
          aria-checked={theme === 'system'}
          aria-label="System theme preference"
        >
          💻 System
        </button>
      </div>
    </div>
  );
}
