import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Варианты списком. Можно передать и `<option>` через children. */
  options?: SelectOption[];
  /** Пустой первый вариант-подсказка. */
  placeholder?: string;
  wrapperClassName?: string;
}

/** Нативный `<select>`: доступность, мобильные пикеры и SSR из коробки. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', options, placeholder, wrapperClassName, className, children, defaultValue, value, ...props },
  ref,
) {
  const needsPlaceholderDefault = placeholder !== undefined && value === undefined && defaultValue === undefined;

  return (
    <span className={cx(styles.wrapper, styles[size], wrapperClassName)}>
      <select
        ref={ref}
        className={cx(styles.select, className)}
        value={value}
        defaultValue={needsPlaceholderDefault ? '' : defaultValue}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown className={styles.chevron} aria-hidden="true" />
    </span>
  );
});
