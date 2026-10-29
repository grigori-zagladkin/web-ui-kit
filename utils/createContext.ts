import { createContext as reactCreateContext, useContext } from 'react';

/**
 * Контекст без значения по умолчанию: хук бросает понятную ошибку,
 * если компонент используется вне провайдера.
 */
export function createContext<T>(name: string) {
  const Context = reactCreateContext<T | null>(null);
  Context.displayName = name;

  function useStrictContext(): T {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`${name}: компонент должен быть внутри своего провайдера`);
    }
    return value;
  }

  return [Context.Provider, useStrictContext, Context] as const;
}
