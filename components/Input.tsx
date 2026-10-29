import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Содержимое слева: иконка, «https://», «₽». */
  leading?: ReactNode;
  /** Содержимое справа: иконка, единицы, кнопка очистки. */
  trailing?: ReactNode;
  /** Класс для обёртки (рамки). `className` уходит на сам `<input>`. */
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', leading, trailing, wrapperClassName, className, type = 'text', ...props },
  ref,
) {
  return (
    <span className={cx(styles.wrapper, styles[size], wrapperClassName)}>
      {leading && <span className={styles.adornment}>{leading}</span>}
      <input ref={ref} type={type} className={cx(styles.input, className)} {...props} />
      {trailing && <span className={styles.adornment}>{trailing}</span>}
    </span>
  );
});
