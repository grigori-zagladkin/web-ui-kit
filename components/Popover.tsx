'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { useControllableState } from '../utils/useControllableState';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';
import styles from './Popover.module.css';

export type PopoverPlacement = 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';

export interface PopoverApi {
  close: () => void;
}

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Триггер — обязательно `<button>` (или Button): открытие идёт через нативный `popovertarget`. */
  trigger: ReactElement;
  children: ReactNode | ((api: PopoverApi) => ReactNode);
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  /** Отступ от триггера, px. */
  offset?: number;
  /** Ширина не меньше ширины триггера. */
  matchTriggerWidth?: boolean;
  /** Без внутренних отступов — для меню и списков. */
  flush?: boolean;
}

const VIEWPORT_PADDING = 8;

function computePosition(
  trigger: DOMRect,
  content: { width: number; height: number },
  placement: PopoverPlacement,
  offset: number,
): { top: number; left: number } {
  const [side, align = 'center'] = placement.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined];
  const spaceBelow = window.innerHeight - trigger.bottom;
  const spaceAbove = trigger.top;
  const needed = content.height + offset + VIEWPORT_PADDING;

  let resolvedSide = side;
  if (side === 'bottom' && spaceBelow < needed && spaceAbove > spaceBelow) resolvedSide = 'top';
  if (side === 'top' && spaceAbove < needed && spaceBelow > spaceAbove) resolvedSide = 'bottom';

  const top = resolvedSide === 'bottom' ? trigger.bottom + offset : trigger.top - offset - content.height;
  let left =
    align === 'start'
      ? trigger.left
      : align === 'end'
        ? trigger.right - content.width
        : trigger.left + trigger.width / 2 - content.width / 2;

  const maxLeft = window.innerWidth - content.width - VIEWPORT_PADDING;
  left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));
  return { top: Math.max(VIEWPORT_PADDING, top), left };
}

/**
 * Всплывающая панель на нативном Popover API: top layer, закрытие по Esc и клику вне — силами браузера.
 * Клиентский код нужен только для позиционирования относительно триггера.
 */
export function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 6,
  matchTriggerWidth = false,
  flush = false,
  className,
  style,
  id: idProp,
  ...props
}: PopoverProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!anchor || !content) return;
    const triggerRect = anchor.getBoundingClientRect();
    if (matchTriggerWidth) content.style.minWidth = `${triggerRect.width}px`;
    const { top, left } = computePosition(
      triggerRect,
      { width: content.offsetWidth, height: content.offsetHeight },
      placement,
      offset,
    );
    content.style.top = `${top}px`;
    content.style.left = `${left}px`;
  }, [placement, offset, matchTriggerWidth]);

  // состояние → DOM
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || typeof content.showPopover !== 'function') return;
    const shown = content.matches(':popover-open');
    if (isOpen && !shown) content.showPopover();
    if (!isOpen && shown) content.hidePopover();
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  // DOM → состояние (клик по триггеру, Esc, клик вне)
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const onToggle = (event: Event) => {
      const next = (event as ToggleEvent).newState === 'open';
      if (next) updatePosition();
      setOpen(next);
    };
    content.addEventListener('toggle', onToggle);
    return () => content.removeEventListener('toggle', onToggle);
  }, [setOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const triggerChild = Children.only(trigger);
  const triggerNode = isValidElement<Record<string, unknown>>(triggerChild)
    ? cloneElement(triggerChild, {
        popoverTarget: id,
        'aria-expanded': isOpen,
        'aria-controls': id,
      })
    : triggerChild;

  return (
    <>
      <span ref={anchorRef} className={styles.anchor}>
        {triggerNode}
      </span>
      <div
        ref={contentRef}
        id={id}
        popover="auto"
        className={cx(styles.popover, flush && styles.flush, className)}
        style={style as CSSProperties}
        {...props}
      >
        {typeof children === 'function' ? children({ close }) : children}
      </div>
    </>
  );
}
