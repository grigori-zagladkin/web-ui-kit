'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { cx } from '../utils/cx';
import { useControllableState } from '../utils/useControllableState';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';
import styles from './Dialog.module.css';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Элемент, открывающий диалог по клику. Можно не передавать и управлять через `open`. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Кнопки снизу. Функция получает `close`. */
  footer?: ReactNode | ((close: () => void) => ReactNode);
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
  hideCloseButton?: boolean;
  className?: string;
}

/**
 * Модальное окно на нативном `<dialog>`: фокус-ловушка, Esc, инертный фон и top layer — силами браузера.
 * Клиентская часть — только вызов `showModal()` / `close()`.
 */
export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  hideCloseButton = false,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const close = useCallback(() => setOpen(false), [setOpen]);

  useIsomorphicLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [setOpen]);

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    // клик по самому <dialog> = клик по подложке (контент лежит во внутреннем блоке)
    if (closeOnBackdropClick && event.target === event.currentTarget) close();
  };

  const triggerChild = trigger ? Children.only(trigger) : null;
  const triggerNode =
    triggerChild && isValidElement<{ onClick?: (event: MouseEvent) => void }>(triggerChild)
      ? cloneElement(triggerChild, {
          onClick: (event: MouseEvent) => {
            triggerChild.props.onClick?.(event);
            if (!event.defaultPrevented) setOpen(true);
          },
          'aria-haspopup': 'dialog',
        } as Record<string, unknown>)
      : null;

  return (
    <>
      {triggerNode}
      <dialog
        ref={ref}
        className={cx(styles.dialog, styles[size], className)}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={onDialogClick}
      >
        {isOpen && (
          <div className={styles.panel}>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className={styles.description}>
                    {description}
                  </p>
                )}
              </div>
              {!hideCloseButton && (
                <button type="button" className={styles.close} onClick={close} aria-label="Закрыть">
                  <X aria-hidden="true" />
                </button>
              )}
            </div>
            {children && <div className={styles.body}>{children}</div>}
            {footer && <div className={styles.footer}>{typeof footer === 'function' ? footer(close) : footer}</div>}
          </div>
        )}
      </dialog>
    </>
  );
}
