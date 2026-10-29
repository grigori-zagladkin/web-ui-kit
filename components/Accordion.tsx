import {
  Children,
  cloneElement,
  isValidElement,
  type DetailsHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Accordion.module.css';

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Имя группы: в один момент открыт только один пункт (атрибут `name` у `<details>`).
   * Без него пункты открываются независимо.
   */
  exclusiveName?: string;
  variant?: 'separated' | 'bordered';
  children: ReactNode;
}

/** Аккордеон на нативных `<details>/<summary>` — без JS и клиентского кода. */
export function Accordion({ exclusiveName, variant = 'separated', className, children, ...props }: AccordionProps) {
  return (
    <div className={cx(styles.root, styles[variant], className)} {...props}>
      {exclusiveName
        ? Children.map(children, (child) =>
            isValidElement<AccordionItemProps>(child) ? cloneElement(child, { name: exclusiveName }) : child,
          )
        : children}
    </div>
  );
}

export interface AccordionItemProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'title'> {
  title: ReactNode;
  /** Атрибут `name` у `<details>`; обычно его проставляет Accordion. */
  name?: string;
  children: ReactNode;
}

export function AccordionItem({ title, className, children, ...props }: AccordionItemProps) {
  return (
    <details className={cx(styles.item, className)} {...props}>
      <summary className={styles.summary}>
        <span className={styles.title}>{title}</span>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
