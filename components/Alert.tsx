import type { HTMLAttributes, ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Alert.module.css';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  /** Своя иконка; `false` — без иконки. */
  icon?: ReactNode | false;
  /** Кнопки справа. */
  action?: ReactNode;
}

const defaultIcons = {
  info: <Info />,
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  danger: <CircleAlert />,
};

export function Alert({ variant = 'info', title, icon, action, className, children, role, ...props }: AlertProps) {
  const iconNode = icon === false ? null : (icon ?? defaultIcons[variant]);
  return (
    <div
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cx(styles.alert, styles[variant], className)}
      {...props}
    >
      {iconNode && (
        <span className={styles.icon} aria-hidden="true">
          {iconNode}
        </span>
      )}
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.description}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
