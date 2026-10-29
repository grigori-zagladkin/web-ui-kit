'use client';

import { useEffect, useRef, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../utils/cx';
import { useControllableState } from '../utils/useControllableState';
import { Popover, type PopoverPlacement } from './Popover';
import styles from './DropdownMenu.module.css';

export type DropdownMenuItem =
  | {
      type?: 'item';
      label: ReactNode;
      icon?: ReactNode;
      /** Подсказка справа: хоткей, счётчик. */
      hint?: ReactNode;
      onSelect?: () => void;
      danger?: boolean;
      disabled?: boolean;
    }
  | {
      type: 'checkbox';
      label: ReactNode;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled?: boolean;
      /** Не закрывать меню после переключения (по умолчанию не закрывается). */
      closeOnSelect?: boolean;
    }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode };

export interface DropdownMenuProps {
  /** Триггер — `<button>` или Button. */
  trigger: ReactElement;
  items: DropdownMenuItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  className?: string;
  'aria-label'?: string;
}

export function DropdownMenu({
  trigger,
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  className,
  'aria-label': ariaLabel,
}: DropdownMenuProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const menuRef = useRef<HTMLDivElement>(null);

  const getItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)') ?? []);

  useEffect(() => {
    if (!isOpen) return;
    // фокус на первый пункт после показа поповера
    const id = requestAnimationFrame(() => getItems()[0]?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = getItems();
    if (list.length === 0) return;
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | null = null;
    if (event.key === 'ArrowDown') next = (index + 1) % list.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + list.length) % list.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else if (event.key === 'Tab') setOpen(false);
    if (next !== null) {
      event.preventDefault();
      list[next]?.focus();
    }
  };

  return (
    <Popover trigger={trigger} open={isOpen} onOpenChange={setOpen} placement={placement} flush className={className}>
      <div ref={menuRef} role="menu" aria-label={ariaLabel} className={styles.menu} onKeyDown={onKeyDown}>
        {items.map((item, index) => {
          if (item.type === 'separator') return <div key={index} role="separator" className={styles.separator} />;
          if (item.type === 'label')
            return (
              <div key={index} className={styles.label} role="presentation">
                {item.label}
              </div>
            );
          if (item.type === 'checkbox') {
            return (
              <button
                key={index}
                type="button"
                role="menuitemcheckbox"
                aria-checked={item.checked}
                tabIndex={-1}
                disabled={item.disabled}
                className={styles.item}
                onClick={() => {
                  item.onCheckedChange(!item.checked);
                  if (item.closeOnSelect) setOpen(false);
                }}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.checked && <Check />}
                </span>
                <span className={styles.text}>{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={index}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              className={cx(styles.item, item.danger && styles.danger)}
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
            >
              {item.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className={styles.text}>{item.label}</span>
              {item.hint && <span className={styles.hint}>{item.hint}</span>}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
