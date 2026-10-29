import type { Meta, StoryObj } from '@storybook/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Tabs } from '../components/Tabs';
import { ThemeProvider, useTheme, type Theme } from '../components/ThemeProvider';

const meta: Meta = { title: 'Foundations/Theme' };
export default meta;
type Story = StoryObj;

const swatches = [
  'bg', 'bg-subtle', 'bg-muted', 'fg', 'fg-muted', 'fg-subtle', 'border', 'border-strong', 'primary',
  'accent', 'success', 'warning', 'danger',
];

export const Tokens: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
      {swatches.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          <div style={{ height: 48, borderRadius: 8, background: `var(--ui-${name})`, border: '1px solid var(--ui-border)' }} />
          <code style={{ color: 'var(--ui-fg-muted)' }}>--ui-{name}</code>
        </div>
      ))}
    </div>
  ),
};

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Tabs
        aria-label="Тема"
        variant="pill"
        value={theme}
        onValueChange={(v) => setTheme(v as Theme)}
        items={[
          { value: 'light', label: 'Светлая', icon: <Sun />, content: null },
          { value: 'dark', label: 'Тёмная', icon: <Moon />, content: null },
          { value: 'system', label: 'Системная', icon: <Monitor />, content: null },
        ]}
      />
      <span style={{ color: 'var(--ui-fg-muted)', fontSize: 13 }}>Сейчас: {resolvedTheme}</span>
    </div>
  );
}

/** Живой переключатель на useTheme. Вне скриншотов: зависит от localStorage. */
export const Switcher: Story = {
  tags: ['no-visual'],
  render: () => (
    <ThemeProvider storageKey="ui-theme-storybook-demo">
      <ThemeSwitcher />
    </ThemeProvider>
  ),
};
