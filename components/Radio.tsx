import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import styles from './Radio.module.css';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value'> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, className, style, ...props },
  ref,
) {
  return (
    <label className={cx(styles.root, className)} style={style} data-disabled={dataAttr(props.disabled)}>
      <span className={styles.control}>
        <input ref={ref} type="radio" className={styles.input} {...props} />
        <span className={styles.circle} aria-hidden="true" />
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

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /** Общее имя для всех радио внутри. */
  name: string;
  legend?: ReactNode;
  /** Controlled-значение (нужен `onValueChange`, работает внутри клиентских компонентов). */
  value?: string;
  /** Начальное значение для uncontrolled-режима — работает и на сервере. */
  defaultValue?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}

/**
 * Группа радиокнопок на `<fieldset>`. Имя и выбранное значение раздаются детям через cloneElement,
 * поэтому компонент остаётся серверным.
 */
export function RadioGroup({
  name,
  legend,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <fieldset className={cx(styles.group, className)} {...props}>
      {legend && <legend className={styles.legend}>{legend}</legend>}
      <div className={cx(styles.items, styles[orientation])}>
        {Children.map(children, (child) => {
          if (!isValidElement<RadioProps>(child)) return child;
          const childValue = child.props.value;
          return cloneElement(child, {
            name,
            ...(value !== undefined
              ? { checked: value === childValue }
              : defaultValue !== undefined
                ? { defaultChecked: defaultValue === childValue }
                : null),
            // обработчик только при onValueChange: функции в пропсах ломают серверный рендер (RSC)
            ...(onValueChange
              ? {
                  onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    child.props.onChange?.(event);
                    onValueChange(childValue, event);
                  },
                }
              : null),
          });
        })}
      </div>
    </fieldset>
  );
}
