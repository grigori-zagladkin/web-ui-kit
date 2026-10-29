import type { Meta, StoryObj } from '@storybook/react';
import { AtSign, Search } from 'lucide-react';
import { Field } from '../components/Field';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/Input' };
export default meta;
type Story = StoryObj;

export const States: Story = {
  render: () => (
    <Stack width={320}>
      <Input placeholder="Обычное" />
      <Input defaultValue="Заполненное" />
      <Input placeholder="С ошибкой" aria-invalid />
      <Input placeholder="Недоступное" disabled />
    </Stack>
  ),
};

export const SizesAndAdornments: Story = {
  render: () => (
    <Stack width={320}>
      <Section title="Размеры">
        <Input size="sm" placeholder="Small" />
        <Input size="md" placeholder="Medium" />
        <Input size="lg" placeholder="Large" />
      </Section>
      <Section title="Префиксы и суффиксы">
        <Input leading={<Search />} placeholder="Поиск" />
        <Input leading={<AtSign />} placeholder="username" />
        <Input leading="https://" placeholder="example.com" />
        <Input trailing="₽" placeholder="0" inputMode="decimal" />
      </Section>
    </Stack>
  ),
};

export const Fields: Story = {
  render: () => (
    <Stack width={360}>
      <Field id="email" label="Email" hint="На него придёт ссылка для входа" required>
        <Input type="email" placeholder="name@company.ru" />
      </Field>
      <Field id="name" label="Название проекта" error="Такое название уже занято">
        <Input defaultValue="Мой проект" />
      </Field>
      <Field id="role" label="Роль">
        <Select
          placeholder="Выберите роль"
          options={[
            { value: 'admin', label: 'Администратор' },
            { value: 'editor', label: 'Редактор' },
            { value: 'viewer', label: 'Наблюдатель' },
          ]}
        />
      </Field>
      <Field id="about" label="О себе" hint="До 500 символов">
        <Textarea placeholder="Пара слов о вас" />
      </Field>
    </Stack>
  ),
};

export const Selects: Story = {
  render: () => (
    <Stack width={320}>
      <Select size="sm" defaultValue="week" options={[{ value: 'week', label: 'За неделю' }, { value: 'month', label: 'За месяц' }]} />
      <Select defaultValue="month" options={[{ value: 'week', label: 'За неделю' }, { value: 'month', label: 'За месяц' }]} />
      <Select placeholder="Не выбрано" options={[{ value: 'a', label: 'Вариант А' }]} />
      <Select disabled defaultValue="a" options={[{ value: 'a', label: 'Недоступно' }]} />
    </Stack>
  ),
};

export const Textareas: Story = {
  render: () => (
    <Stack width={360}>
      <Textarea placeholder="Комментарий" />
      <Textarea defaultValue={'Высота подстраивается\nпод содержимое\nбез JS'} autoResize />
      <Textarea placeholder="С ошибкой" aria-invalid />
      <Textarea placeholder="Недоступно" disabled />
    </Stack>
  ),
};
