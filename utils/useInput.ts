'use client';

import { useCallback, useState, type ChangeEvent } from 'react';

export interface UseInputOptions {
  /** Валидатор: возвращает текст ошибки или `undefined`. */
  validate?: (value: string) => string | undefined;
}

/**
 * Состояние текстового поля: значение, «тронутость» и ошибка валидации.
 * `bind` раскладывается прямо в `<Input {...field.bind} />`.
 */
export function useInput(initialValue = '', { validate }: UseInputOptions = {}) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const validationError = validate?.(value);
  const error = touched ? validationError : undefined;

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value),
    [],
  );
  const onBlur = useCallback(() => setTouched(true), []);
  const reset = useCallback(() => {
    setValue(initialValue);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    setValue,
    touched,
    setTouched,
    error,
    isValid: validationError === undefined,
    reset,
    bind: { value, onChange, onBlur, 'aria-invalid': error ? true : undefined },
  };
}
