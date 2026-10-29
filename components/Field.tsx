import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import styles from './Field.module.css';

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** id поля ввода. Нужен, чтобы связать label, подсказку и ошибку без хуков (SSR). */
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Единственный контрол: Input, Textarea, Select и т.п. Получит id, aria-describedby, aria-invalid. */
  children: ReactElement;
}

/**
 * Обёртка поля формы: подпись, подсказка и ошибка.
 * Связи для скринридеров проставляются через cloneElement — хуков нет, работает на сервере.
 */
export function Field({ id, label, hint, error, required, className, children, ...props }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const child = Children.only(children);

  const control = isValidElement<Record<string, unknown>>(child)
    ? cloneElement(child, {
        id,
        required: required ?? child.props.required,
        'aria-describedby':
          [child.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : child.props['aria-invalid'],
      })
    : child;

  return (
    <div className={cx(styles.field, className)} {...props}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
