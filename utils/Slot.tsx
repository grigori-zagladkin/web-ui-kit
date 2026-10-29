import { Children, cloneElement, isValidElement, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Передаёт свои пропсы единственному ребёнку вместо того, чтобы рендерить обёртку.
 * Основа для `asChild`: `<Button asChild><a href="/">Ссылка</a></Button>`.
 * Хуков нет — работает в серверных компонентах.
 */
export function Slot({ children, className, style, ...props }: SlotProps) {
  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) return null;

  const childProps = child.props;
  const merged: Record<string, unknown> = { ...props, ...childProps };

  for (const key of Object.keys(props)) {
    const own = (props as Record<string, unknown>)[key];
    const theirs = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof own === 'function' && typeof theirs === 'function') {
      merged[key] = (...args: unknown[]) => {
        (theirs as (...a: unknown[]) => void)(...args);
        (own as (...a: unknown[]) => void)(...args);
      };
    }
  }

  merged.className = cx(className, childProps.className as string | undefined);
  merged.style = { ...style, ...(childProps.style as object | undefined) };

  return cloneElement(child, merged);
}
