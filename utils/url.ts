/** Разрешённые схемы ссылок в пользовательском контенте. */
export const SAFE_LINK_PROTOCOLS = ['http', 'https', 'mailto', 'tel'];

function getProtocol(value: string): string | undefined {
  return /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1]?.toLowerCase();
}

/** Ссылка безопасна: относительная, якорь или http(s)/mailto/tel. Отсекает `javascript:`, `data:` и т.п. */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  // относительные пути, якоря и query (в т.ч. `//host` — это тот же http(s))
  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('?')) return true;
  const protocol = getProtocol(value);
  return protocol ? SAFE_LINK_PROTOCOLS.includes(protocol) : false;
}

/** Адрес картинки: только http(s) или относительный путь. */
export function isSafeImageSrc(src: string): boolean {
  const value = src.trim();
  if (value.startsWith('/')) return true;
  const protocol = getProtocol(value);
  return protocol === 'http' || protocol === 'https';
}
