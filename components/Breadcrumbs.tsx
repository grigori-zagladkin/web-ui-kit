import type { ComponentType, HTMLAttributes, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  /** Компонент ссылки, например `next/link`. По умолчанию `<a>`. */
  linkComponent?: ComponentType<{ href: string; className?: string; children?: ReactNode }>;
}

export function Breadcrumbs({
  items,
  separator = <ChevronRight />,
  linkComponent: LinkComponent,
  className,
  'aria-label': ariaLabel = 'Навигационная цепочка',
  ...props
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={cx(styles.root, className)} {...props}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {isLast || !item.href ? (
                <span className={isLast ? styles.current : styles.text} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : LinkComponent ? (
                <LinkComponent href={item.href} className={styles.link}>
                  {item.label}
                </LinkComponent>
              ) : (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
