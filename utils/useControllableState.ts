'use client';

import { useCallback, useRef, useState, type SetStateAction } from 'react';

export interface UseControllableStateOptions<T> {
  /** Значение в controlled-режиме. */
  value?: T;
  /** Начальное значение в uncontrolled-режиме. */
  defaultValue: T;
  onChange?: (value: T) => void;
}

/**
 * Одно API для controlled и uncontrolled компонентов.
 * Если передан `value` — состоянием управляет родитель, иначе — сам компонент.
 * Сеттер принимает значение или функцию, как обычный useState.
 */
export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      currentRef.current = resolved;
      if (!isControlled) setInner(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue] as const;
}
