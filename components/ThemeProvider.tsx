'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createContext } from '../utils/createContext';
import { useMediaQuery } from '../utils/useMediaQuery';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ui-theme';

export interface ThemeContextValue {
  /** Выбор пользователя: light, dark или system. */
  theme: Theme;
  /** Фактическая тема после учёта системной настройки. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const [ThemeContextProvider, useTheme] = createContext<ThemeContextValue>('ThemeProvider');
export { useTheme };

export interface ThemeProviderProps {
  children: ReactNode;
  /** Тема, пока пользователь ничего не выбрал. */
  defaultTheme?: Theme;
  /** Жёстко заданная тема (например, для Storybook или отдельной страницы). Игнорирует выбор пользователя. */
  forcedTheme?: ResolvedTheme;
  /** Ключ в localStorage и имя cookie. Должен совпадать с ключом в `<ThemeScript>`. */
  storageKey?: string;
}

function readStoredTheme(key: string): Theme | undefined {
  try {
    const value = localStorage.getItem(key);
    return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Хранит выбранную тему, применяет её атрибутом `data-theme` на `<html>`
 * и отдаёт `useTheme()`. Чтобы при SSR тема не мигала, добавьте `<ThemeScript>` в `<head>`.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  forcedTheme,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // undefined до чтения localStorage: так серверный и первый клиентский рендер совпадают
  const [stored, setStored] = useState<Theme | undefined>(undefined);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setStored(readStoredTheme(storageKey) ?? defaultTheme);
  }, [storageKey, defaultTheme]);

  const theme = stored ?? defaultTheme;
  const resolvedTheme: ResolvedTheme =
    forcedTheme ?? (theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme);

  useEffect(() => {
    if (stored === undefined && !forcedTheme) return;
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme, stored, forcedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setStored(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // приватный режим или запрет хранилища — тема просто не запомнится
      }
      document.cookie = `${storageKey}=${next}; path=/; max-age=31536000; samesite=lax`;
    },
    [storageKey],
  );

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContextProvider value={value}>{children}</ThemeContextProvider>;
}
