import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Separator.module.css';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Чисто визуальный разделитель, скрыт от скринридеров. */
  decorative?: boolean;
  /** Подпись посередине: «или», «Сегодня» и т.п. Только для горизонтального. */
  label?: ReactNode;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  label,
  className,
  ...props
}: SeparatorProps) {
  const a11y = decorative
    ? { role: 'none' as const }
    : { role: 'separator' as const, 'aria-orientation': orientation };

  if (label && orientation === 'horizontal') {
    return (
      <div className={cx(styles.labeled, className)} {...a11y} {...props}>
        <span className={styles.line} />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} />
      </div>
    );
  }

  return <div className={cx(styles.separator, styles[orientation], className)} {...a11y} {...props} />;
}
