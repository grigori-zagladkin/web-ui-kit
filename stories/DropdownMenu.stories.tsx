import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Pencil, Share2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { DropdownMenu, type DropdownMenuItem } from '../components/DropdownMenu';

const meta: Meta = { title: 'Components/DropdownMenu' };
export default meta;
type Story = StoryObj;

const items: DropdownMenuItem[] = [
  { label: 'Редактировать', icon: <Pencil />, hint: 'E' },
  { label: 'Дублировать', icon: <Copy />, hint: 'Ctrl+D' },
  { label: 'Поделиться', icon: <Share2 /> },
  { type: 'separator' },
  { label: 'Удалить', icon: <Trash2 />, danger: true },
];

export const Open: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <div style={{ height: 240 }}>
      <DropdownMenu defaultOpen aria-label="Действия" trigger={<Button>Действия</Button>} items={items} />
    </div>
  ),
};

export const Closed: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <DropdownMenu aria-label="Действия" trigger={<Button>Действия</Button>} items={items} />
    </div>
  ),
};

function CheckboxMenu() {
  const [columns, setColumns] = useState({ name: true, email: true, role: false });
  return (
    <DropdownMenu
      defaultOpen
      aria-label="Колонки"
      trigger={<Button>Колонки</Button>}
      items={[
        { type: 'label', label: 'Показывать колонки' },
        { type: 'checkbox', label: 'Имя', checked: columns.name, onCheckedChange: (v) => setColumns((c) => ({ ...c, name: v })) },
        { type: 'checkbox', label: 'Email', checked: columns.email, onCheckedChange: (v) => setColumns((c) => ({ ...c, email: v })) },
        { type: 'checkbox', label: 'Роль', checked: columns.role, onCheckedChange: (v) => setColumns((c) => ({ ...c, role: v })) },
      ]}
    />
  );
}

export const WithCheckboxes: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <div style={{ height: 200 }}>
      <CheckboxMenu />
    </div>
  ),
};
