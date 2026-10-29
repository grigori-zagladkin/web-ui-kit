import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: ReactNode;
  /** Триггер: кнопка, иконка, ссылка. Должен уметь получать фокус. */
  children: ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** id подсказки — для связи через aria-describedby. Без него подсказка только визуальная. */
  id?: string;
  /** Показать принудительно (для документации и скриншотов). */
  open?: boolean;
  className?: string;
}

/**
 * Подсказка на чистом CSS: показывается по hover и focus, хуков и JS нет.
 * Позиция фиксированная (side), автоматического переворота у краёв экрана нет.
 */
export function Tooltip({ content, children, side = 'top', id, open, className }: TooltipProps) {
  const child = Children.only(children);
  const trigger =
    id && isValidElement<Record<string, unknown>>(child)
      ? cloneElement(child, {
          'aria-describedby': [child.props['aria-describedby'], id].filter(Boolean).join(' '),
        })
      : child;

  return (
    <span className={cx(styles.root, className)} data-open={dataAttr(open)}>
      {trigger}
      <span id={id} role="tooltip" className={cx(styles.tooltip, styles[side])}>
        {content}
      </span>
    </span>
  );
}
