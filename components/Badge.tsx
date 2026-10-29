import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  /** `soft` — мягкая заливка, `outline` — только обводка. */
  appearance?: 'soft' | 'outline';
  /** Цветная точка перед текстом — для статусов. */
  dot?: boolean;
}

export function Badge({
  variant = 'neutral',
  appearance = 'soft',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], styles[appearance], className)} {...props}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
