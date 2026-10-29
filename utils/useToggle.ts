'use client';

import { useCallback, useState } from 'react';

/** Булево состояние с переключателем. `toggle(true|false)` задаёт значение явно. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback((next?: boolean) => {
    setValue((prev) => (typeof next === 'boolean' ? next : !prev));
  }, []);
  return [value, toggle, setValue] as const;
}
