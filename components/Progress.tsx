import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Progress.module.css';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Текущее значение. Без него — неопределённый прогресс (бегущая полоса). */
  value?: number;
  max?: number;
  label?: ReactNode;
  /** Показать процент справа от подписи. */
  showValue?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'default',
  className,
  ...props
}: ProgressProps) {
  const indeterminate = value === undefined;
  const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cx(styles.root, className)} {...props}>
      {(label || showValue) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && !indeterminate && <span className={styles.value}>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-label={typeof label === 'string' ? label : undefined}
        className={cx(styles.track, styles[size])}
      >
        <div
          className={cx(styles.bar, styles[variant], indeterminate && styles.indeterminate)}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
