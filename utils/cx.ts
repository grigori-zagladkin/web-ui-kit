export type ClassValue =
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined
  | ClassValue[]
  | { [className: string]: unknown };

/** Склеивает классы: строки, массивы и объекты вида `{ active: isActive }`. Аналог clsx. */
export function cx(...values: ClassValue[]): string {
  let out = '';
  for (const value of values) {
    if (!value && value !== 0) continue;
    let chunk = '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
      chunk = String(value);
    } else if (Array.isArray(value)) {
      chunk = cx(...value);
    } else if (typeof value === 'object') {
      for (const key in value) {
        if (value[key]) chunk += (chunk ? ' ' : '') + key;
      }
    }
    if (chunk) out += (out ? ' ' : '') + chunk;
  }
  return out;
}
