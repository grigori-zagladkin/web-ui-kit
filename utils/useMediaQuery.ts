'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Подписка на media query. На сервере возвращает `serverFallback` (по умолчанию `false`),
 * поэтому гидратация не ломается.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}
