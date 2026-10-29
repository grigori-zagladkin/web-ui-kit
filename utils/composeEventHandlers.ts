/**
 * Вызывает сначала обработчик пользователя, затем внутренний.
 * Если пользователь вызвал `event.preventDefault()`, внутренний обработчик пропускается.
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  external: ((event: E) => void) | undefined,
  internal: (event: E) => void,
): (event: E) => void {
  return (event) => {
    external?.(event);
    if (!event.defaultPrevented) internal(event);
  };
}
