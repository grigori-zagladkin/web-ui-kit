'use client';

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import {
  isFieldVisible,
  validateRules,
  validateValues,
  type FormErrors,
  type StandardSchemaV1,
  type ValidatableField,
} from '../utils/validation';
import { Alert } from './Alert';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Field } from './Field';
import { Input } from './Input';
import { Radio, RadioGroup } from './Radio';
import { Select, type SelectOption } from './Select';
import { Switch } from './Switch';
import { Textarea } from './Textarea';
import styles from './Form.module.css';

// Редактор тяжёлый — грузим только если в форме есть richtext-поле
const LazyEditor = lazy(() => import('./Editor').then((m) => ({ default: m.Editor })));

type FormValues = Record<string, unknown>;
type FieldName<T> = Extract<keyof T, string>;

export interface ChoiceOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

interface BaseField<T extends FormValues> extends ValidatableField<T> {
  name: FieldName<T>;
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  disabled?: boolean | ((values: T) => boolean);
  /** Сколько колонок сетки занимает поле; `full` — всю строку. */
  span?: number | 'full';
  autoFocus?: boolean;
}

export interface CustomFieldProps<T extends FormValues> {
  id: string;
  name: string;
  value: unknown;
  setValue: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  disabled: boolean;
  values: T;
  /** id подсказки и ошибки — для aria-describedby. */
  describedBy?: string;
}

export interface FormSection {
  type: 'section';
  title: ReactNode;
  description?: ReactNode;
}

export type FormFieldConfig<T extends FormValues> =
  | (BaseField<T> & {
      type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
      autoComplete?: string;
      inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search';
      leading?: ReactNode;
      trailing?: ReactNode;
    })
  | (BaseField<T> & { type: 'number'; step?: number; leading?: ReactNode; trailing?: ReactNode })
  | (BaseField<T> & { type: 'date' | 'time' | 'datetime-local' })
  | (BaseField<T> & { type: 'textarea'; rows?: number; autoResize?: boolean })
  | (BaseField<T> & { type: 'select'; options: SelectOption[] })
  | (BaseField<T> & { type: 'radio'; options: ChoiceOption[]; orientation?: 'vertical' | 'horizontal' })
  | (BaseField<T> & { type: 'checkboxes'; options: ChoiceOption[]; orientation?: 'vertical' | 'horizontal' })
  | (BaseField<T> & { type: 'checkbox' | 'switch'; description?: ReactNode })
  | (BaseField<T> & { type: 'richtext'; minHeight?: number; toolbar?: boolean })
  | (BaseField<T> & { type: 'custom'; render: (props: CustomFieldProps<T>) => ReactNode })
  | FormSection;

export interface FormSubmitResult<T extends FormValues> {
  /** Ошибки по полям, например «email уже занят» с сервера. */
  fieldErrors?: FormErrors<T>;
  /** Общая ошибка над формой. */
  formError?: ReactNode;
}

export interface FormProps<T extends FormValues> {
  fields: ReadonlyArray<FormFieldConfig<T>>;
  initialValues: T;
  /** Вызывается после успешной валидации. Может вернуть ошибки с сервера. */
  onSubmit?: (values: T) => void | FormSubmitResult<T> | Promise<void | FormSubmitResult<T>>;
  /**
   * Нативный `action`: URL или server action. Без JS форма отправится браузером
   * (сработают нативные атрибуты required/minLength/pattern), с JS — после нашей валидации.
   */
  action?: string | ((formData: FormData) => void | Promise<void>);
  method?: 'get' | 'post';
  /** Схема Zod / Valibot / ArkType (Standard Schema) — дополнительно к правилам полей. */
  schema?: StandardSchemaV1;
  /** Проверки между полями: совпадение паролей, «дата окончания позже начала». */
  validate?: (values: T) => FormErrors<T> | undefined | Promise<FormErrors<T> | undefined>;
  /** Когда впервые показывать ошибку поля. После отправки ошибки обновляются на лету. */
  validateOn?: 'blur' | 'change' | 'submit';
  /** Ошибки при первом рендере — например, от сервера после отправки без JS. */
  initialErrors?: FormErrors<T>;
  /** Общая ошибка при первом рендере. */
  formError?: ReactNode;
  /** Сообщение после успешной отправки. */
  successMessage?: ReactNode;
  resetOnSuccess?: boolean;
  /** Число колонок сетки. В узком контейнере форма сама становится в одну колонку. */
  columns?: 1 | 2 | 3 | 4;
  submitLabel?: ReactNode;
  /** Показать кнопку сброса с этим текстом. */
  resetLabel?: ReactNode;
  /** Дополнительные кнопки рядом с «Отправить». */
  actions?: ReactNode;
  onValuesChange?: (values: T) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

function FieldMessages({ hintId, errorId, hint, error }: { hintId: string; errorId: string; hint?: ReactNode; error?: string }) {
  if (error) {
    return (
      <p id={errorId} className={styles.error} role="alert">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={hintId} className={styles.hint}>
      {hint}
    </p>
  ) : null;
}

function RichTextControl(props: {
  id?: string;
  'aria-describedby'?: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  invalid: boolean;
  disabled: boolean;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  toolbar?: boolean;
}) {
  return (
    <Suspense fallback={<div className={styles.editorFallback} style={{ minHeight: (props.minHeight ?? 160) + 40 }} data-editor-pending="" />}>
      <div onBlur={props.onBlur}>
        <LazyEditor
          id={props.id}
          aria-describedby={props['aria-describedby']}
          defaultValue={(props.value as never) ?? undefined}
          onChange={(json) => props.onChange(json)}
          invalid={props.invalid}
          editable={!props.disabled}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          minHeight={props.minHeight}
          toolbar={props.toolbar}
        />
      </div>
    </Suspense>
  );
}

/**
 * Генератор форм: поля описываются массивом, валидация — правилами полей,
 * функцией `validate` (между полями) и/или схемой (Zod, Valibot — Standard Schema).
 * Те же `fields` можно проверить на сервере через `validateValues` из utils.
 */
export function Form<T extends FormValues>({
  fields,
  initialValues,
  onSubmit,
  action,
  method = 'post',
  schema,
  validate,
  validateOn = 'blur',
  initialErrors,
  formError: initialFormError,
  successMessage,
  resetOnSuccess = false,
  columns = 1,
  submitLabel = 'Отправить',
  resetLabel,
  actions,
  onValuesChange,
  disabled: formDisabled = false,
  className,
  id: idProp,
  'aria-label': ariaLabel,
}: FormProps<T>) {
  const generatedId = useId();
  const baseId = idProp ?? generatedId;
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>(initialErrors ?? {});
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [submitted, setSubmitted] = useState(Boolean(initialErrors));
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState<Partial<Record<string, boolean>>>({});
  const [formError, setFormError] = useState<ReactNode>(initialFormError);
  const [success, setSuccess] = useState(false);
  // до гидратации работает нативная валидация браузера, после — наша
  const [hydrated, setHydrated] = useState(false);
  const asyncTokens = useRef<Record<string, number>>({});

  useEffect(() => setHydrated(true), []);

  const valueFields = fields.filter((f): f is Exclude<FormFieldConfig<T>, FormSection> => f.type !== 'section');
  const fieldId = (name: string) => `${baseId}-${name}`;

  const setFieldError = useCallback((name: string, error: string | undefined) => {
    setErrors((prev) => {
      if (prev[name as FieldName<T>] === error) return prev;
      const next = { ...prev };
      if (error) next[name as FieldName<T>] = error;
      else delete next[name as FieldName<T>];
      return next;
    });
  }, []);

  const runFieldValidation = (field: Exclude<FormFieldConfig<T>, FormSection>, nextValues: T, mode: 'change' | 'blur') => {
    const value = nextValues[field.name];
    const ruleError = validateRules(field, value);
    if (ruleError || !field.validate) {
      setFieldError(field.name, ruleError);
      return;
    }
    const result = field.validate(value, nextValues);
    if (!(result instanceof Promise)) {
      setFieldError(field.name, result);
      return;
    }
    // асинхронные проверки — только по blur и при отправке, не на каждый символ
    if (mode === 'change') {
      setFieldError(field.name, undefined);
      return;
    }
    const token = (asyncTokens.current[field.name] ?? 0) + 1;
    asyncTokens.current[field.name] = token;
    setValidating((prev) => ({ ...prev, [field.name]: true }));
    void result.then((error) => {
      if (asyncTokens.current[field.name] !== token) return;
      setFieldError(field.name, error);
      setValidating((prev) => ({ ...prev, [field.name]: false }));
    });
  };

  const shouldValidate = (name: string, mode: 'change' | 'blur') =>
    submitted || validateOn === 'change' || (mode === 'blur' && validateOn === 'blur') || (mode === 'change' && touched[name] && Boolean(errors[name as FieldName<T>]));

  const setValue = (field: Exclude<FormFieldConfig<T>, FormSection>, value: unknown) => {
    const nextValues = { ...values, [field.name]: value } as T;
    setValues(nextValues);
    setSuccess(false);
    onValuesChange?.(nextValues);
    if (shouldValidate(field.name, 'change')) runFieldValidation(field, nextValues, 'change');
  };

  const handleBlur = (field: Exclude<FormFieldConfig<T>, FormSection>) => {
    setTouched((prev) => (prev[field.name] ? prev : { ...prev, [field.name]: true }));
    if (shouldValidate(field.name, 'blur')) runFieldValidation(field, values, 'blur');
  };

  const focusFirstError = (errs: FormErrors<T>) => {
    const first = valueFields.find((f) => errs[f.name] && isFieldVisible(f, values));
    if (!first) return;
    const el = document.getElementById(fieldId(first.name));
    const target = el instanceof HTMLFieldSetElement ? el.querySelector<HTMLElement>('input:not(:disabled)') : el;
    target?.focus();
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setFormError(undefined);
    setSuccess(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setFormError(undefined);
    setSuccess(false);

    const errs = await validateValues(fields, values, { schema, validate });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const result = onSubmit ? await onSubmit(values) : undefined;
      if (result?.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setErrors(result.fieldErrors);
        focusFirstError(result.fieldErrors);
        return;
      }
      if (result?.formError) {
        setFormError(result.formError);
        return;
      }
      if (typeof action === 'function' && formRef.current) await action(new FormData(formRef.current));
      if (typeof action === 'string') {
        formRef.current?.submit();
        return;
      }
      setSuccess(true);
      if (resetOnSuccess) {
        setValues(initialValues);
        setTouched({});
        setSubmitted(false);
      }
    } catch {
      setFormError('Не удалось отправить форму. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig<T>, index: number) => {
    if (field.type === 'section') {
      return (
        <div key={`section-${index}`} className={styles.section}>
          <h3 className={styles.sectionTitle}>{field.title}</h3>
          {field.description && <p className={styles.sectionDescription}>{field.description}</p>}
        </div>
      );
    }
    if (!isFieldVisible(field, values)) return null;

    const id = fieldId(field.name);
    const value = values[field.name];
    const error = errors[field.name];
    const disabled = formDisabled || submitting || (typeof field.disabled === 'function' ? field.disabled(values) : Boolean(field.disabled));
    const onBlur = () => handleBlur(field);
    const set = (next: unknown) => setValue(field, next);
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = error ? errorId : field.hint ? hintId : undefined;
    const busy = validating[field.name];
    const span = field.span === 'full' ? '1 / -1' : field.span ? `span ${field.span}` : undefined;

    let control: ReactNode;
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'search':
        control = (
          <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Input
              type={field.type}
              name={field.name}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set(e.target.value)}
              onBlur={onBlur}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern?.source}
              leading={field.leading}
              trailing={busy ? <span className={styles.checking}>проверка…</span> : field.trailing}
              disabled={disabled}
              autoFocus={field.autoFocus}
            />
          </Field>
        );
        break;
      case 'number':
        control = (
          <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Input
              type="number"
              name={field.name}
              value={typeof value === 'number' && !Number.isNaN(value) ? String(value) : ''}
              onChange={(e) => set(e.target.value === '' ? undefined : e.target.valueAsNumber)}
              onBlur={onBlur}
              placeholder={field.placeholder}
              min={typeof field.min === 'number' ? field.min : undefined}
              max={typeof field.max === 'number' ? field.max : undefined}
              step={field.step}
              leading={field.leading}
              trailing={field.trailing}
              disabled={disabled}
              autoFocus={field.autoFocus}
            />
          </Field>
        );
        break;
      case 'date':
      case 'time':
      case 'datetime-local':
        control = (
          <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Input
              type={field.type}
              name={field.name}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set(e.target.value)}
              onBlur={onBlur}
              min={typeof field.min === 'string' ? field.min : undefined}
              max={typeof field.max === 'string' ? field.max : undefined}
              disabled={disabled}
              autoFocus={field.autoFocus}
            />
          </Field>
        );
        break;
      case 'textarea':
        control = (
          <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Textarea
              name={field.name}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set(e.target.value)}
              onBlur={onBlur}
              placeholder={field.placeholder}
              rows={field.rows}
              autoResize={field.autoResize}
              minLength={field.minLength}
              maxLength={field.maxLength}
              disabled={disabled}
              autoFocus={field.autoFocus}
            />
          </Field>
        );
        break;
      case 'select':
        control = (
          <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Select
              name={field.name}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set(e.target.value)}
              onBlur={onBlur}
              placeholder={field.placeholder ?? 'Выберите'}
              options={field.options}
              disabled={disabled}
            />
          </Field>
        );
        break;
      case 'radio':
        control = (
          <div className={styles.group}>
            <RadioGroup
              id={id}
              name={field.name}
              legend={field.label && <LegendText label={field.label} required={field.required} />}
              value={typeof value === 'string' ? value : ''}
              onValueChange={(next) => set(next)}
              orientation={field.orientation}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              disabled={disabled}
            >
              {field.options.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  disabled={option.disabled}
                  required={field.required}
                  aria-invalid={error ? true : undefined}
                  onBlur={onBlur}
                />
              ))}
            </RadioGroup>
            <FieldMessages hintId={hintId} errorId={errorId} hint={field.hint} error={error} />
          </div>
        );
        break;
      case 'checkboxes': {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        control = (
          <div className={styles.group}>
            <fieldset id={id} className={styles.fieldset} aria-describedby={describedBy} aria-invalid={error ? true : undefined} disabled={disabled}>
              {field.label && (
                <legend className={styles.legend}>
                  <LegendText label={field.label} required={field.required} />
                </legend>
              )}
              <div className={cx(styles.options, field.orientation === 'horizontal' && styles.horizontal)}>
                {field.options.map((option) => (
                  <Checkbox
                    key={option.value}
                    name={field.name}
                    value={option.value}
                    label={option.label}
                    description={option.description}
                    disabled={option.disabled}
                    checked={selected.includes(option.value)}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) =>
                      set(e.target.checked ? [...selected, option.value] : selected.filter((v) => v !== option.value))
                    }
                    onBlur={onBlur}
                  />
                ))}
              </div>
            </fieldset>
            <FieldMessages hintId={hintId} errorId={errorId} hint={field.hint} error={error} />
          </div>
        );
        break;
      }
      case 'checkbox':
      case 'switch': {
        const Control = field.type === 'checkbox' ? Checkbox : Switch;
        control = (
          <Field id={id} hint={field.hint} error={error}>
            <Control
              name={field.name}
              label={field.label}
              description={field.description}
              checked={value === true}
              onChange={(e) => set(e.target.checked)}
              onBlur={onBlur}
              disabled={disabled}
              required={field.required}
            />
          </Field>
        );
        break;
      }
      case 'richtext':
        control = (
          <>
            <Field id={id} label={field.label} hint={field.hint} error={error} required={field.required}>
              <RichTextControl
                value={value}
                onChange={set}
                onBlur={onBlur}
                invalid={Boolean(error)}
                disabled={disabled}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                minHeight={field.minHeight}
                toolbar={field.toolbar}
              />
            </Field>
            {/* для отправки без JS и через FormData */}
            <input type="hidden" name={field.name} value={value ? JSON.stringify(value) : ''} />
          </>
        );
        break;
      case 'custom':
        control = (
          <div className={styles.group}>
            {field.label && (
              <label htmlFor={id} className={styles.legend}>
                <LegendText label={field.label} required={field.required} />
              </label>
            )}
            {field.render({ id, name: field.name, value, setValue: set, onBlur, error, disabled, values, describedBy })}
            <FieldMessages hintId={hintId} errorId={errorId} hint={field.hint} error={error} />
          </div>
        );
        break;
    }

    return (
      <div key={field.name} className={styles.cell} style={span ? { gridColumn: span } : undefined}>
        {control}
      </div>
    );
  };

  return (
    <form
      ref={formRef}
      id={baseId}
      className={cx(styles.form, className)}
      style={{ ['--form-columns' as string]: columns }}
      action={action as string | undefined}
      method={typeof action === 'string' ? method : undefined}
      noValidate={hydrated}
      onSubmit={handleSubmit}
      aria-label={ariaLabel}
      aria-busy={submitting || undefined}
    >
      {formError && (
        <Alert variant="danger" title={formError} className={styles.formAlert} />
      )}
      {success && successMessage && <Alert variant="success" title={successMessage} className={styles.formAlert} />}
      <div className={styles.grid}>{fields.map(renderField)}</div>
      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={submitting} disabled={formDisabled}>
          {submitLabel}
        </Button>
        {resetLabel && (
          <Button type="button" variant="ghost" onClick={reset} disabled={submitting || formDisabled}>
            {resetLabel}
          </Button>
        )}
        {actions}
      </div>
    </form>
  );
}

function LegendText({ label, required }: { label: ReactNode; required?: boolean }) {
  return (
    <>
      {label}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </>
  );
}
