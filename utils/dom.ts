export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** `true` → `""` (атрибут есть), `false`/`undefined` → `undefined` (атрибута нет). Для data-* атрибутов. */
export function dataAttr(condition: boolean | undefined): '' | undefined {
  return condition ? '' : undefined;
}
