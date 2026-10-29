'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useControllableState } from '../utils/useControllableState';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `line` — подчёркивание, `pill` — сегментированный переключатель. */
  variant?: 'line' | 'pill';
  className?: string;
  'aria-label'?: string;
}

/**
 * Вкладки по ARIA-паттерну: стрелки, Home/End. Все панели рендерятся сразу
 * (неактивные — с `hidden`), так что контент попадает в SSR-разметку.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'line',
  className,
  'aria-label': ariaLabel,
}: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.value ?? '';
  const [active, setActive] = useControllableState({
    value,
    defaultValue: defaultValue ?? firstEnabled,
    onChange: onValueChange,
  });
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.value === active);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % enabled.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + enabled.length) % enabled.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    if (next === null) return;
    event.preventDefault();
    const target = enabled[next];
    if (!target) return;
    setActive(target.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(target.value)}"]`)?.focus();
  };

  return (
    <div className={cx(styles.root, className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={cx(styles.list, styles[variant])}
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-controls={`${baseId}-panel-${item.value}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              data-value={item.value}
              className={styles.tab}
              onClick={() => setActive(item.value)}
            >
              {item.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={item.value !== active}
          tabIndex={0}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
