import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../components/Checkbox';
import { Radio, RadioGroup } from '../components/Radio';
import { Switch } from '../components/Switch';
import { Row, Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/Choice' };
export default meta;
type Story = StoryObj;

export const Checkboxes: Story = {
  render: () => (
    <Stack>
      <Row gap={20}>
        <Checkbox label="Обычный" />
        <Checkbox label="Отмечен" defaultChecked />
        <Checkbox label="Частично" indeterminate />
        <Checkbox label="Недоступен" disabled />
        <Checkbox label="Отмечен и недоступен" defaultChecked disabled />
      </Row>
      <Checkbox label="Получать уведомления" description="Раз в неделю присылаем сводку по проектам." defaultChecked />
      <Row gap={20}>
        <Checkbox size="sm" label="Маленький" defaultChecked />
        <Checkbox aria-label="Без подписи" />
      </Row>
    </Stack>
  ),
};

export const Radios: Story = {
  render: () => (
    <Stack>
      <RadioGroup name="plan" legend="Тариф" defaultValue="pro">
        <Radio value="free" label="Бесплатный" description="До 3 проектов" />
        <Radio value="pro" label="Pro" description="Без ограничений" />
        <Radio value="team" label="Команда" description="Скоро" disabled />
      </RadioGroup>
      <Section title="Горизонтально">
        <RadioGroup name="period" orientation="horizontal" defaultValue="month">
          <Radio value="month" label="Месяц" />
          <Radio value="year" label="Год" />
        </RadioGroup>
      </Section>
    </Stack>
  ),
};

export const Switches: Story = {
  render: () => (
    <Stack width={360}>
      <Row gap={20}>
        <Switch label="Выключен" />
        <Switch label="Включён" defaultChecked />
        <Switch label="Недоступен" disabled />
        <Switch size="sm" label="Маленький" defaultChecked />
      </Row>
      <Switch label="Тёмная тема" description="Следовать настройкам системы" labelPosition="left" defaultChecked />
    </Stack>
  ),
};
