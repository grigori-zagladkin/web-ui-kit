import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Spinner.module.css';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  /** Текст для скринридеров. */
  label?: string;
}

export function Spinner({ size = 'md', label = 'Загрузка', className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx(styles.spinner, styles[size], className)}
      {...props}
    />
  );
}
