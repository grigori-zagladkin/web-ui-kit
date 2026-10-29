import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Кнопки действия. */
  action?: ReactNode;
  /** Пунктирная рамка вокруг — для пустых зон внутри страниц. */
  bordered?: boolean;
  size?: 'sm' | 'md';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  bordered = false,
  size = 'md',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx(styles.root, styles[size], bordered && styles.bordered, className)} {...props}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
