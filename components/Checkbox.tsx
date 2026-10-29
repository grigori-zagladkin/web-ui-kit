import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * Частичный выбор («выбраны не все»). Отрисовывается без JS через data-атрибут
   * и `aria-checked="mixed"`; нативное свойство `indeterminate` не трогается.
   */
  indeterminate?: boolean;
  size?: 'sm' | 'md';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, size = 'md', className, style, ...props },
  ref,
) {
  return (
    <label className={cx(styles.root, styles[size], className)} style={style} data-disabled={dataAttr(props.disabled)}>
      <span className={styles.control}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.input}
          aria-checked={indeterminate ? 'mixed' : undefined}
          data-indeterminate={dataAttr(indeterminate)}
          {...props}
        />
        <span className={styles.box} aria-hidden="true">
          <Check className={styles.check} strokeWidth={3} />
          <Minus className={styles.dash} strokeWidth={3} />
        </span>
      </span>
      {(label || description) && (
        <span className={styles.text}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      )}
    </label>
  );
});
