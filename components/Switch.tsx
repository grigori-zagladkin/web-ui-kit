import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import styles from './Switch.module.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
  /** Подпись слева, переключатель справа — удобно в настройках. */
  labelPosition?: 'right' | 'left';
}

/** Чекбокс с `role="switch"`: работает без JS, в формах отправляется как обычный чекбокс. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, size = 'md', labelPosition = 'right', className, style, ...props },
  ref,
) {
  return (
    <label
      className={cx(styles.root, styles[size], labelPosition === 'left' && styles.reverse, className)}
      style={style}
      data-disabled={dataAttr(props.disabled)}
    >
      <span className={styles.control}>
        <input ref={ref} type="checkbox" role="switch" className={styles.input} {...props} />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
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
