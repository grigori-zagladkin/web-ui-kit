import type { Meta, StoryObj } from '@storybook/react';
import { Activity, LayoutDashboard, Settings } from 'lucide-react';
import { Tabs, type TabItem } from '../components/Tabs';

const meta: Meta = { title: 'Components/Tabs' };
export default meta;
type Story = StoryObj;

const items: TabItem[] = [
  { value: 'overview', label: 'Обзор', icon: <LayoutDashboard />, content: <p style={{ margin: 0 }}>Сводка по проекту.</p> },
  { value: 'activity', label: 'Активность', icon: <Activity />, content: <p style={{ margin: 0 }}>Последние изменения.</p> },
  { value: 'settings', label: 'Настройки', icon: <Settings />, content: <p style={{ margin: 0 }}>Параметры проекта.</p> },
  { value: 'archive', label: 'Архив', content: null, disabled: true },
];

export const Line: Story = {
  render: () => <Tabs aria-label="Разделы проекта" items={items} />,
};

export const Pill: Story = {
  render: () => (
    <Tabs
      aria-label="Период"
      variant="pill"
      defaultValue="month"
      items={[
        { value: 'week', label: 'Неделя', content: null },
        { value: 'month', label: 'Месяц', content: null },
        { value: 'year', label: 'Год', content: null },
      ]}
    />
  ),
};
