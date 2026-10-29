import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Высота подстраивается под текст (CSS `field-sizing`, без JS). В старых браузерах — обычный ресайз. */
  autoResize?: boolean;
  resize?: 'none' | 'vertical' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoResize = false, resize = 'vertical', rows = 3, className, style, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx(styles.textarea, autoResize && styles.autoResize, className)}
      style={{ resize, ...style }}
      {...props}
    />
  );
});
