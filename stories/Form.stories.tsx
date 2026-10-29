import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AtSign } from 'lucide-react';
import { EditorViewer } from '../components/EditorViewer';
import { Form, type FormFieldConfig } from '../components/Form';

const meta: Meta = { title: 'Components/Form' };
export default meta;
type Story = StoryObj;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Регистрация: две колонки, секции, асинхронная проверка и проверка между полями ──

// type, а не interface: interface не совместим с Record<string, unknown>
type SignUp = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  role: string;
  birthday: string;
  plan: string;
  interests: string[];
  bio: string;
  newsletter: boolean;
  terms: boolean;
};

const signUpInitial: SignUp = {
  name: '',
  email: '',
  password: '',
  confirm: '',
  role: '',
  birthday: '',
  plan: 'free',
  interests: [],
  bio: '',
  newsletter: true,
  terms: false,
};

const signUpFields: FormFieldConfig<SignUp>[] = [
  { type: 'section', title: 'Аккаунт', description: 'Данные для входа в систему.' },
  { type: 'text', name: 'name', label: 'Имя', required: true, minLength: 2, autoComplete: 'name', placeholder: 'Анна Смирнова' },
  {
    type: 'email',
    name: 'email',
    label: 'Email',
    required: true,
    autoComplete: 'email',
    placeholder: 'name@company.ru',
    leading: <AtSign />,
    hint: 'taken@example.com — уже занят',
    // асинхронная проверка: имитация запроса к серверу
    validate: async (value) => {
      await wait(400);
      return value === 'taken@example.com' ? 'Этот email уже зарегистрирован' : undefined;
    },
  },
  {
    type: 'password',
    name: 'password',
    label: 'Пароль',
    required: true,
    minLength: 8,
    pattern: /\d/,
    messages: { pattern: 'Добавьте хотя бы одну цифру' },
    autoComplete: 'new-password',
  },
  { type: 'password', name: 'confirm', label: 'Повторите пароль', required: true, autoComplete: 'new-password' },
  { type: 'section', title: 'Профиль' },
  {
    type: 'select',
    name: 'role',
    label: 'Роль',
    required: true,
    options: [
      { value: 'dev', label: 'Разработчик' },
      { value: 'design', label: 'Дизайнер' },
      { value: 'manager', label: 'Менеджер' },
    ],
  },
  { type: 'date', name: 'birthday', label: 'Дата рождения', max: '2010-12-31', messages: { max: 'Регистрация с 14 лет' } },
  {
    type: 'radio',
    name: 'plan',
    label: 'Тариф',
    required: true,
    orientation: 'horizontal',
    options: [
      { value: 'free', label: 'Бесплатный' },
      { value: 'pro', label: 'Pro' },
    ],
  },
  {
    type: 'checkboxes',
    name: 'interests',
    label: 'Интересы',
    required: true,
    maxItems: 2,
    orientation: 'horizontal',
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Дизайн' },
    ],
  },
  { type: 'textarea', name: 'bio', label: 'О себе', span: 'full', maxLength: 200, hint: 'До 200 символов', rows: 3 },
  { type: 'switch', name: 'newsletter', label: 'Присылать новости', span: 'full' },
  { type: 'checkbox', name: 'terms', label: 'Принимаю условия использования', required: true, span: 'full' },
];

const passwordsMatch = (values: SignUp) =>
  values.confirm && values.password !== values.confirm ? { confirm: 'Пароли не совпадают' } : undefined;

function RegistrationDemo() {
  const [result, setResult] = useState<SignUp>();
  return (
    <div style={{ maxWidth: 640 }}>
      <Form
        aria-label="Регистрация"
        fields={signUpFields}
        initialValues={signUpInitial}
        validate={passwordsMatch}
        columns={2}
        submitLabel="Зарегистрироваться"
        resetLabel="Очистить"
        successMessage="Аккаунт создан"
        onSubmit={async (values) => {
          await wait(500);
          setResult(values);
        }}
      />
      {result && (
        <pre data-testid="result" style={{ marginTop: 16, fontSize: 12, color: 'var(--ui-fg-muted)' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export const Registration: Story = {
  render: () => <RegistrationDemo />,
};

export const WithErrors: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Form
        aria-label="Регистрация"
        fields={signUpFields}
        initialValues={{ ...signUpInitial, name: 'А', email: 'taken@example.com', password: 'qwerty', confirm: 'qwerty1' }}
        columns={2}
        submitLabel="Зарегистрироваться"
        formError="Не удалось создать аккаунт. Исправьте ошибки и попробуйте снова."
        initialErrors={{
          name: 'Минимум 2 символа',
          email: 'Этот email уже зарегистрирован',
          password: 'Минимум 8 символов',
          confirm: 'Пароли не совпадают',
          role: 'Выберите вариант',
          interests: 'Выберите вариант',
          terms: 'Необходимо отметить',
        }}
      />
    </div>
  ),
};

// ── Условные поля, richtext и серверные ошибки ──

type Order = {
  delivery: string;
  city: string;
  address: string;
  pickupPoint: string;
  quantity: number | undefined;
  comment: unknown;
};

const orderFields: FormFieldConfig<Order>[] = [
  {
    type: 'radio',
    name: 'delivery',
    label: 'Способ получения',
    required: true,
    span: 'full',
    orientation: 'horizontal',
    options: [
      { value: 'courier', label: 'Курьер', description: 'Завтра, 300 ₽' },
      { value: 'pickup', label: 'Самовывоз', description: 'Сегодня, бесплатно' },
    ],
  },
  { type: 'text', name: 'city', label: 'Город', required: true, when: (v) => v.delivery === 'courier' },
  { type: 'text', name: 'address', label: 'Адрес', required: true, minLength: 5, when: (v) => v.delivery === 'courier', span: 2 },
  {
    type: 'select',
    name: 'pickupPoint',
    label: 'Пункт выдачи',
    required: true,
    when: (v) => v.delivery === 'pickup',
    span: 'full',
    options: [
      { value: 'center', label: 'ТЦ «Центральный»' },
      { value: 'north', label: 'ул. Северная, 12' },
    ],
  },
  { type: 'number', name: 'quantity', label: 'Количество', required: true, min: 1, max: 10, trailing: 'шт.' },
  { type: 'richtext', name: 'comment', label: 'Комментарий к заказу', maxLength: 300, minHeight: 80, span: 'full' },
];

function OrderDemo() {
  const [comment, setComment] = useState<unknown>();
  return (
    <div style={{ maxWidth: 640 }}>
      <Form
        aria-label="Оформление заказа"
        fields={orderFields}
        initialValues={{ delivery: 'courier', city: '', address: '', pickupPoint: '', quantity: 1, comment: undefined } as Order}
        columns={3}
        submitLabel="Оформить заказ"
        successMessage="Заказ оформлен"
        onSubmit={async (values) => {
          await wait(300);
          // ответ сервера с ошибкой по конкретному полю
          if (values.city.toLowerCase() === 'атлантида') return { fieldErrors: { city: 'В этот город не доставляем' } };
          setComment(values.comment);
          return undefined;
        }}
      />
      {Boolean(comment) && (
        <div style={{ marginTop: 24 }}>
          <EditorViewer content={comment as never} size="sm" />
        </div>
      )}
    </div>
  );
}

export const ConditionalFields: Story = {
  render: () => <OrderDemo />,
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Form
        aria-label="Профиль"
        disabled
        initialValues={{ name: 'Анна', email: 'anna@company.ru' }}
        fields={[
          { type: 'text', name: 'name', label: 'Имя' },
          { type: 'email', name: 'email', label: 'Email' },
        ]}
        submitLabel="Сохранить"
      />
    </div>
  ),
};
