import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Row, Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/Button' };
export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () => (
    <Stack>
      <Section title="Варианты">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
      </Section>
      <Section title="Размеры">
        <Row>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </Row>
      </Section>
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack>
      <Section title="Иконка слева и справа">
        <Row>
          <Button variant="primary" icon={<Plus />}>Создать</Button>
          <Button iconRight={<ArrowRight />}>Далее</Button>
          <Button variant="danger" icon={<Trash2 />}>Удалить</Button>
        </Row>
      </Section>
      <Section title="Только иконка (iconOnly)">
        <Row>
          <Button iconOnly icon={<Settings />} aria-label="Настройки" size="sm" />
          <Button iconOnly icon={<Settings />} aria-label="Настройки" />
          <Button iconOnly icon={<Settings />} aria-label="Настройки" size="lg" />
          <Button iconOnly variant="ghost" icon={<Plus />} aria-label="Добавить" />
          <Button iconOnly variant="primary" icon={<Plus />} aria-label="Добавить" />
        </Row>
      </Section>
    </Stack>
  ),
};

export const Links: Story = {
  render: () => (
    <Stack>
      <Section title="variant=link — ссылка в тексте">
        <p style={{ margin: 0 }}>
          Прочитайте{' '}
          <Button variant="link" href="#rules">
            правила сервиса
          </Button>{' '}
          перед началом работы.
        </p>
      </Section>
      <Section title="link-muted, внешняя ссылка, ссылка-действие без href">
        <Row gap={20}>
          <Button variant="link-muted" href="#settings">
            Настройки
          </Button>
          <Button variant="link" href="https://example.com" external>
            Внешний сайт
          </Button>
          <Button variant="link">Показать ещё</Button>
          <Button variant="link" href="#off" disabled>
            Недоступна
          </Button>
        </Row>
      </Section>
      <Section title="Кнопка-ссылка (href у обычного варианта)">
        <Row>
          <Button variant="primary" href="#signup" iconRight={<ArrowRight />}>
            Начать
          </Button>
          <Button href="https://example.com" external>
            Документация
          </Button>
        </Row>
      </Section>
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack>
      <Section title="Загрузка">
        <Row>
          <Button variant="primary" loading>Сохранение</Button>
          <Button loading>Загрузка</Button>
          <Button iconOnly loading icon={<Settings />} aria-label="Загрузка" />
        </Row>
      </Section>
      <Section title="Недоступна">
        <Row>
          <Button variant="primary" disabled>Primary</Button>
          <Button disabled>Secondary</Button>
          <Button variant="ghost" disabled>Ghost</Button>
        </Row>
      </Section>
      <Section title="На всю ширину">
        <Stack width={320} gap={8}>
          <Button variant="primary" fullWidth>Войти</Button>
        </Stack>
      </Section>
    </Stack>
  ),
};
