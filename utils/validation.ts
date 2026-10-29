/**
 * Валидация форм. Чистые функции без React и 'use client':
 * одну и ту же схему полей можно проверить и в браузере (Form), и на сервере (server action, API).
 */

export type RuleName =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'minItems'
  | 'maxItems';

export type Validator<TValues> = (
  value: unknown,
  values: TValues,
) => string | undefined | Promise<string | undefined>;

/** Правила поля. Form-поля расширяют этот тип, поэтому массив полей формы годится для validateValues. */
export interface ValidatableField<TValues = Record<string, unknown>> {
  name: string;
  /** Тип поля влияет на проверки: email, url, number, date, checkbox, checkboxes, richtext. */
  type?: string;
  required?: boolean;
  /** Длина строки (или текста в richtext). */
  minLength?: number;
  maxLength?: number;
  /** Число или дата/время в формате input (`2025-01-31`). */
  min?: number | string;
  max?: number | string;
  pattern?: RegExp;
  /** Для множественного выбора (checkboxes). */
  minItems?: number;
  maxItems?: number;
  /** Своя проверка: вернуть текст ошибки или undefined. Может быть асинхронной (проверка на сервере). */
  validate?: Validator<TValues>;
  /** Свои тексты ошибок вместо стандартных. */
  messages?: Partial<Record<RuleName, string>>;
  /** Показывать поле только при условии. Скрытые поля не валидируются. */
  when?: (values: TValues) => boolean;
}

export type FormErrors<TValues> = Partial<Record<Extract<keyof TValues, string>, string>>;

/** Минимальный контракт Standard Schema (https://standardschema.dev): Zod 3.24+, Valibot, ArkType. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | {
      readonly issues: ReadonlyArray<{
        readonly message: string;
        readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
      }>;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const chars = (n: number) => `${n} ${plural(n, 'символ', 'символа', 'символов')}`;

interface RichTextNode {
  type?: string;
  text?: string;
  content?: RichTextNode[];
}

function isRichTextDoc(value: unknown): value is RichTextNode {
  return typeof value === 'object' && value !== null && (value as RichTextNode).type === 'doc';
}

/** Количество символов текста в документе редактора (Tiptap JSON). */
export function richTextLength(node: RichTextNode | null | undefined): number {
  if (!node) return 0;
  const own = node.type === 'text' ? (node.text?.length ?? 0) : 0;
  return own + (node.content ?? []).reduce((sum, child) => sum + richTextLength(child), 0);
}

function richTextHasMedia(node: RichTextNode | null | undefined): boolean {
  if (!node) return false;
  return node.type === 'image' || (node.content ?? []).some(richTextHasMedia);
}

/** Пустое значение с точки зрения `required`. */
export function isEmptyValue(value: unknown, type?: string): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'boolean') return type === 'checkbox' || type === 'switch' ? !value : false;
  if (Array.isArray(value)) return value.length === 0;
  if (isRichTextDoc(value)) return richTextLength(value) === 0 && !richTextHasMedia(value);
  return false;
}

export function isFieldVisible<TValues>(field: { when?: (values: TValues) => boolean }, values: TValues): boolean {
  return field.when ? field.when(values) : true;
}

/** Встроенные правила, без пользовательского `validate`. Синхронно. */
export function validateRules<TValues>(field: ValidatableField<TValues>, value: unknown): string | undefined {
  const m = field.messages ?? {};
  const type = field.type;

  if (isEmptyValue(value, type)) {
    if (!field.required) return undefined;
    if (type === 'checkbox' || type === 'switch') return m.required ?? 'Необходимо отметить';
    if (type === 'checkboxes' || type === 'radio' || type === 'select') return m.required ?? 'Выберите вариант';
    return m.required ?? 'Обязательное поле';
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (type === 'email' && !EMAIL_RE.test(text)) return m.email ?? 'Введите корректный email';
    if (type === 'url' && !URL_RE.test(text)) return m.url ?? 'Введите адрес вида https://example.com';
    if (field.pattern && !field.pattern.test(value)) return m.pattern ?? 'Неверный формат';
  }

  const length = typeof value === 'string' ? value.length : isRichTextDoc(value) ? richTextLength(value) : undefined;
  if (length !== undefined) {
    if (field.minLength !== undefined && length < field.minLength) return m.minLength ?? `Минимум ${chars(field.minLength)}`;
    if (field.maxLength !== undefined && length > field.maxLength) return m.maxLength ?? `Не больше ${chars(field.maxLength)}`;
  }

  if (type === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return m.pattern ?? 'Введите число';
    if (typeof field.min === 'number' && num < field.min) return m.min ?? `Не меньше ${field.min}`;
    if (typeof field.max === 'number' && num > field.max) return m.max ?? `Не больше ${field.max}`;
  }

  if ((type === 'date' || type === 'time' || type === 'datetime-local') && typeof value === 'string') {
    // значения input в ISO-формате сравниваются как строки
    if (typeof field.min === 'string' && value < field.min) return m.min ?? `Не раньше ${field.min}`;
    if (typeof field.max === 'string' && value > field.max) return m.max ?? `Не позже ${field.max}`;
  }

  if (Array.isArray(value)) {
    if (field.minItems !== undefined && value.length < field.minItems) return m.minItems ?? `Выберите не меньше ${field.minItems}`;
    if (field.maxItems !== undefined && value.length > field.maxItems) return m.maxItems ?? `Выберите не больше ${field.maxItems}`;
  }

  return undefined;
}

/** Правила + пользовательский `validate`. Возвращает Promise, только если `validate` асинхронный. */
export function validateField<TValues>(
  field: ValidatableField<TValues>,
  value: unknown,
  values: TValues,
): string | undefined | Promise<string | undefined> {
  const ruleError = validateRules(field, value);
  if (ruleError) return ruleError;
  if (!field.validate) return undefined;
  // пустое необязательное поле не гоняем через пользовательскую проверку
  if (isEmptyValue(value, field.type) && !field.required) return undefined;
  return field.validate(value, values);
}

function issueKey(path: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined): string | undefined {
  const first = path?.[0];
  if (first === undefined) return undefined;
  return String(typeof first === 'object' ? first.key : first);
}

export interface ValidateValuesOptions<TValues> {
  /** Схема Zod / Valibot / ArkType (Standard Schema). Ошибки привязываются по первому сегменту пути. */
  schema?: StandardSchemaV1;
  /** Проверки между полями (совпадение паролей и т.п.). */
  validate?: (values: TValues) => FormErrors<TValues> | undefined | Promise<FormErrors<TValues> | undefined>;
}

/**
 * Проверить все видимые поля. Порядок: правила поля → `validate` поля → `options.validate` → `options.schema`.
 * Для каждого поля остаётся первая ошибка. Пустой объект — значит всё валидно.
 */
export async function validateValues<TValues extends Record<string, unknown>>(
  fields: ReadonlyArray<ValidatableField<TValues> | { type: 'section' }>,
  values: TValues,
  options: ValidateValuesOptions<TValues> = {},
): Promise<FormErrors<TValues>> {
  const errors: Record<string, string> = {};
  const visible = fields.filter(
    (field): field is ValidatableField<TValues> => 'name' in field && isFieldVisible(field, values),
  );

  await Promise.all(
    visible.map(async (field) => {
      const error = await validateField(field, values[field.name], values);
      if (error) errors[field.name] = error;
    }),
  );

  const visibleNames = new Set(visible.map((f) => f.name));
  const add = (name: string, message: string | undefined) => {
    if (message && visibleNames.has(name) && !errors[name]) errors[name] = message;
  };

  if (options.validate) {
    const formErrors = await options.validate(values);
    for (const [name, message] of Object.entries(formErrors ?? {})) add(name, message as string | undefined);
  }

  if (options.schema) {
    const result = await options.schema['~standard'].validate(values);
    for (const issue of result.issues ?? []) {
      const key = issueKey(issue.path);
      if (key) add(key, issue.message);
    }
  }

  return errors as FormErrors<TValues>;
}
