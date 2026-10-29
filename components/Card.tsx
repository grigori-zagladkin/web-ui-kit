import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `outline` — рамка, `subtle` — заливка без тени, `elevated` — с тенью. */
  variant?: 'outline' | 'subtle' | 'elevated';
  /** Подсветка при наведении — для кликабельных карточек. */
  interactive?: boolean;
}

export function Card({ variant = 'outline', interactive = false, className, ...props }: CardProps) {
  return <div className={cx(styles.card, styles[variant], interactive && styles.interactive, className)} {...props} />;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Кнопка или меню справа от заголовка. */
  action?: ReactNode;
}

export function CardHeader({ title, description, action, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cx(styles.header, className)} {...props}>
      <div className={styles.headerText}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.body, className)} {...props} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'between';
}

export function CardFooter({ align = 'end', className, ...props }: CardFooterProps) {
  return <div className={cx(styles.footer, styles[`align-${align}`], className)} {...props} />;
}
