import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Круглая заглушка (под аватар). */
  circle?: boolean;
  /** Несколько строк текста; последняя короче. */
  lines?: number;
}

export function Skeleton({ width, height, circle = false, lines, className, style, ...props }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <span className={cx(styles.lines, className)} aria-hidden="true" style={{ width, ...style }} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={styles.skeleton} style={{ height: height ?? '0.9em', width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height: height ?? (circle ? width : '1em'), ...style }}
      {...props}
    />
  );
}
